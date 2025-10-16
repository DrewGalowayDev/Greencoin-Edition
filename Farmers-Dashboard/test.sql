-- Additional ENUM types for carbon credit platform
CREATE TYPE public.verification_status AS ENUM ('pending', 'verified', 'rejected', 'under_review');
CREATE TYPE public.carbon_practice AS ENUM ('no-till', 'cover-cropping', 'agroforestry', 'rotational-grazing', 'composting', 'improved-fallow', 'silvopasture', 'water-conservation');
CREATE TYPE public.land_tenure_type AS ENUM ('owned', 'leased', 'communal');
CREATE TYPE public.carbon_methodology AS ENUM ('field-sampling', 'modeling', 'hybrid', 'VCS-VM0017', 'VCS-VM0024', 'Gold-Standard');
CREATE TYPE public.credit_status AS ENUM ('pending', 'issued', 'sold', 'retired', 'expired');
CREATE TYPE public.transaction_status AS ENUM ('pending', 'completed', 'failed', 'cancelled');

-- Create carbon_farmers table (extends the existing profiles)
CREATE TABLE public.carbon_farmers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  farmer_id TEXT NOT NULL UNIQUE, -- Format: FARM12345
  full_name TEXT NOT NULL,
  phone_number TEXT NOT NULL,
  email TEXT,
  preferred_language TEXT NOT NULL DEFAULT 'en',
  
  -- Location data
  gps_coordinates TEXT NOT NULL, -- Format: "lat,lng"
  physical_address TEXT,
  region TEXT,
  country TEXT NOT NULL DEFAULT 'Kenya',
  
  -- Farm information
  farm_size_hectares DECIMAL(10,2) NOT NULL CHECK (farm_size_hectares >= 0.5 AND farm_size_hectares <= 1000),
  climate_zone TEXT,
  soil_type TEXT,
  
  -- Practices and eligibility
  selected_practices carbon_practice[] NOT NULL,
  baseline_soil_carbon DECIMAL(8,4),
  baseline_biomass_carbon DECIMAL(8,4),
  
  -- Registration status
  verification_status verification_status NOT NULL DEFAULT 'pending',
  registration_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verification_date TIMESTAMP WITH TIME ZONE,
  onboarding_completed BOOLEAN NOT NULL DEFAULT false,
  
  -- Program participation
  program_start_date DATE,
  contract_duration_years INTEGER DEFAULT 5,
  estimated_onboarding_time TEXT DEFAULT '4-6 weeks',
  
  -- Contact preferences
  sms_notifications BOOLEAN NOT NULL DEFAULT true,
  email_notifications BOOLEAN NOT NULL DEFAULT true,
  whatsapp_notifications BOOLEAN NOT NULL DEFAULT false,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create land_tenure table
CREATE TABLE public.land_tenure (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID NOT NULL REFERENCES public.carbon_farmers(id) ON DELETE CASCADE,
  ownership_type land_tenure_type NOT NULL,
  document_number TEXT NOT NULL,
  document_type TEXT, -- Title deed, lease agreement, etc.
  expiry_date DATE, -- For leased land
  legal_verification BOOLEAN NOT NULL DEFAULT false,
  verification_notes TEXT,
  document_url TEXT, -- Link to uploaded document
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create carbon_estimates table
CREATE TABLE public.carbon_estimates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  estimation_id TEXT NOT NULL UNIQUE, -- Format: EST78901
  farmer_id UUID NOT NULL REFERENCES public.carbon_farmers(id) ON DELETE CASCADE,
  
  -- Estimation period
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  vintage_year INTEGER NOT NULL,
  
  -- Methodology and calculation
  methodology carbon_methodology NOT NULL,
  practices_included carbon_practice[] NOT NULL,
  include_baseline BOOLEAN NOT NULL DEFAULT true,
  
  -- Results
  total_co2e_sequestered DECIMAL(10,4) NOT NULL,
  total_co2e_avoided DECIMAL(10,4) NOT NULL DEFAULT 0,
  net_co2e_impact DECIMAL(10,4) NOT NULL,
  credits_eligible DECIMAL(10,4) NOT NULL,
  confidence_score DECIMAL(3,2) NOT NULL CHECK (confidence_score >= 0 AND confidence_score <= 1),
  
  -- Breakdown
  soil_carbon_sequestration DECIMAL(10,4) NOT NULL DEFAULT 0,
  biomass_carbon DECIMAL(10,4) NOT NULL DEFAULT 0,
  emission_reductions DECIMAL(10,4) NOT NULL DEFAULT 0,
  buffer_discount DECIMAL(10,4) NOT NULL DEFAULT 0,
  leakage_discount DECIMAL(10,4) NOT NULL DEFAULT 0,
  
  -- Monetary value
  estimated_value_usd DECIMAL(12,2),
  min_value_usd DECIMAL(12,2),
  max_value_usd DECIMAL(12,2),
  
  -- Metadata
  calculation_details JSONB,
  practice_contributions JSONB, -- Array of practice-specific contributions
  generated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  valid_until TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create carbon_credits table
CREATE TABLE public.carbon_credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  credit_batch_id TEXT NOT NULL UNIQUE, -- VCS registry format
  farmer_id UUID NOT NULL REFERENCES public.carbon_farmers(id) ON DELETE CASCADE,
  estimation_id UUID REFERENCES public.carbon_estimates(id),
  
  -- Credit details
  quantity DECIMAL(10,4) NOT NULL,
  vintage_year INTEGER NOT NULL,
  methodology TEXT NOT NULL,
  project_id TEXT,
  verification_body TEXT NOT NULL,
  
  -- Serial numbers and tracking
  serial_numbers TEXT[] NOT NULL,
  vcs_registry_id TEXT,
  blockchain_token_id TEXT,
  
  -- Status and lifecycle
  status credit_status NOT NULL DEFAULT 'pending',
  issuance_date TIMESTAMP WITH TIME ZONE,
  retirement_date TIMESTAMP WITH TIME ZONE,
  retirement_reason TEXT,
  
  -- Pricing and market
  issue_price_usd DECIMAL(10,2),
  current_market_price_usd DECIMAL(10,2),
  
  -- Co-benefits and metadata
  co_benefits TEXT[],
  additionality_proof TEXT,
  permanence_risk TEXT,
  metadata JSONB,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create carbon_transactions table
CREATE TABLE public.carbon_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  transaction_id TEXT NOT NULL UNIQUE, -- Format: TXN67890
  farmer_id UUID NOT NULL REFERENCES public.carbon_farmers(id) ON DELETE CASCADE,
  credit_batch_id UUID REFERENCES public.carbon_credits(id),
  
  -- Transaction details
  transaction_type TEXT NOT NULL, -- 'issuance', 'sale', 'purchase', 'retirement'
  quantity DECIMAL(10,4) NOT NULL,
  price_per_credit DECIMAL(10,2),
  total_amount_usd DECIMAL(12,2),
  currency TEXT NOT NULL DEFAULT 'USD',
  
  -- Parties involved
  buyer_wallet_address TEXT,
  seller_wallet_address TEXT,
  buyer_info JSONB,
  seller_info JSONB,
  
  -- Blockchain details
  blockchain_tx_hash TEXT,
  block_number BIGINT,
  gas_used INTEGER,
  network_fee DECIMAL(12,8),
  platform_fee DECIMAL(12,2),
  
  -- Status and timeline
  status transaction_status NOT NULL DEFAULT 'pending',
  initiated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  confirmation_count INTEGER DEFAULT 0,
  
  -- Additional data
  escrow_details JSONB,
  payment_method TEXT,
  notes TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create carbon_marketplace_listings table
CREATE TABLE public.carbon_marketplace_listings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  listing_id TEXT NOT NULL UNIQUE, -- Format: LIST78901
  seller_id UUID NOT NULL REFERENCES public.carbon_farmers(id) ON DELETE CASCADE,
  
  -- Credit information
  credit_batches JSONB NOT NULL, -- Array of credit batch details
  total_credits DECIMAL(10,4) NOT NULL,
  available_credits DECIMAL(10,4) NOT NULL,
  
  -- Pricing
  price_per_credit DECIMAL(10,2) NOT NULL CHECK (price_per_credit >= 5.00 AND price_per_credit <= 150.00),
  total_value DECIMAL(12,2) NOT NULL,
  minimum_purchase DECIMAL(10,4) NOT NULL DEFAULT 1.0,
  bulk_discounts JSONB, -- Array of quantity-based discounts
  
  -- Marketing details
  title TEXT NOT NULL,
  description TEXT,
  co_benefits TEXT[],
  impact_metrics JSONB,
  
  -- Listing management
  status TEXT NOT NULL DEFAULT 'active', -- 'active', 'sold', 'expired', 'cancelled'
  listing_duration_days INTEGER NOT NULL DEFAULT 90,
  listed_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Market analytics
  view_count INTEGER NOT NULL DEFAULT 0,
  inquiry_count INTEGER NOT NULL DEFAULT 0,
  listing_fee DECIMAL(10,2),
  
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create carbon_verification_documents table
CREATE TABLE public.carbon_verification_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID NOT NULL REFERENCES public.carbon_farmers(id) ON DELETE CASCADE,
  document_type TEXT NOT NULL, -- 'land_tenure', 'soil_sample', 'practice_evidence', 'baseline_report'
  file_name TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size_bytes INTEGER,
  mime_type TEXT,
  upload_date TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  verification_status verification_status NOT NULL DEFAULT 'pending',
  verified_by UUID REFERENCES public.profiles(user_id),
  verification_notes TEXT,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create farmer_onboarding_steps table
CREATE TABLE public.farmer_onboarding_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farmer_id UUID NOT NULL REFERENCES public.carbon_farmers(id) ON DELETE CASCADE,
  step_name TEXT NOT NULL, -- 'registration', 'document_verification', 'field_assessment', 'baseline_measurement', 'training'
  step_order INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'in_progress', 'completed', 'skipped'
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  assigned_to UUID REFERENCES public.profiles(user_id),
  notes TEXT,
  required_documents TEXT[],
  estimated_duration TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on new tables
ALTER TABLE public.carbon_farmers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.land_tenure ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carbon_estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carbon_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carbon_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carbon_marketplace_listings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carbon_verification_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farmer_onboarding_steps ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for carbon_farmers
CREATE POLICY "Farmers can view their own carbon profile" 
ON public.carbon_farmers FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Farmers can update their own carbon profile" 
ON public.carbon_farmers FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Anyone can register as a carbon farmer" 
ON public.carbon_farmers FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all carbon farmers" 
ON public.carbon_farmers FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE profiles.user_id = auth.uid() 
  AND profiles.role = 'admin'
));

-- Create RLS policies for land_tenure
CREATE POLICY "Farmers can manage their land tenure" 
ON public.land_tenure FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.carbon_farmers 
  WHERE carbon_farmers.id = land_tenure.farmer_id 
  AND carbon_farmers.user_id = auth.uid()
));

-- Create RLS policies for carbon_estimates
CREATE POLICY "Farmers can view their carbon estimates" 
ON public.carbon_estimates FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.carbon_farmers 
  WHERE carbon_farmers.id = carbon_estimates.farmer_id 
  AND carbon_farmers.user_id = auth.uid()
));

CREATE POLICY "System can create carbon estimates" 
ON public.carbon_estimates FOR INSERT 
WITH CHECK (true);

-- Create RLS policies for carbon_credits
CREATE POLICY "Farmers can view their carbon credits" 
ON public.carbon_credits FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.carbon_farmers 
  WHERE carbon_farmers.id = carbon_credits.farmer_id 
  AND carbon_farmers.user_id = auth.uid()
));

-- Create RLS policies for carbon_transactions
CREATE POLICY "Farmers can view their carbon transactions" 
ON public.carbon_transactions FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.carbon_farmers 
  WHERE carbon_farmers.id = carbon_transactions.farmer_id 
  AND carbon_farmers.user_id = auth.uid()
));

-- Create RLS policies for marketplace listings
CREATE POLICY "Everyone can view active marketplace listings" 
ON public.carbon_marketplace_listings FOR SELECT 
USING (status = 'active');

CREATE POLICY "Farmers can manage their own listings" 
ON public.carbon_marketplace_listings FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.carbon_farmers 
  WHERE carbon_farmers.id = carbon_marketplace_listings.seller_id 
  AND carbon_farmers.user_id = auth.uid()
));

-- Create RLS policies for verification documents
CREATE POLICY "Farmers can manage their verification documents" 
ON public.carbon_verification_documents FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.carbon_farmers 
  WHERE carbon_farmers.id = carbon_verification_documents.farmer_id 
  AND carbon_farmers.user_id = auth.uid()
));

-- Create RLS policies for onboarding steps
CREATE POLICY "Farmers can view their onboarding progress" 
ON public.farmer_onboarding_steps FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.carbon_farmers 
  WHERE carbon_farmers.id = farmer_onboarding_steps.farmer_id 
  AND carbon_farmers.user_id = auth.uid()
));

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_carbon_farmers_updated_at
  BEFORE UPDATE ON public.carbon_farmers
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_land_tenure_updated_at
  BEFORE UPDATE ON public.land_tenure
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_carbon_credits_updated_at
  BEFORE UPDATE ON public.carbon_credits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_carbon_transactions_updated_at
  BEFORE UPDATE ON public.carbon_transactions
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_carbon_marketplace_listings_updated_at
  BEFORE UPDATE ON public.carbon_marketplace_listings
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_farmer_onboarding_steps_updated_at
  BEFORE UPDATE ON public.farmer_onboarding_steps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to generate farmer ID
CREATE OR REPLACE FUNCTION public.generate_farmer_id()
RETURNS TEXT
LANGUAGE plpgsql
AS $$
DECLARE
  new_id TEXT;
  counter INTEGER;
BEGIN
  -- Get the next sequence number
  SELECT COALESCE(MAX(CAST(SUBSTRING(farmer_id FROM 5) AS INTEGER)), 0) + 1
  INTO counter
  FROM public.carbon_farmers
  WHERE farmer_id ~ '^FARM[0-9]+$';
  
  -- Format as FARM followed by 5-digit zero-padded number
  new_id := 'FARM' || LPAD(counter::TEXT, 5, '0');
  
  RETURN new_id;
END;
$$;

-- Create function to handle carbon farmer registration
CREATE OR REPLACE FUNCTION public.handle_carbon_farmer_registration()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  new_farmer_id TEXT;
BEGIN
  -- Generate unique farmer ID
  new_farmer_id := public.generate_farmer_id();
  NEW.farmer_id := new_farmer_id;
  
  -- Set default values
  NEW.registration_date := now();
  NEW.verification_status := 'pending';
  
  RETURN NEW;
END;
$$;

-- Create trigger for farmer ID generation
CREATE TRIGGER carbon_farmer_registration_trigger
  BEFORE INSERT ON public.carbon_farmers
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_carbon_farmer_registration();

-- Create function to initialize onboarding steps
CREATE OR REPLACE FUNCTION public.initialize_onboarding_steps()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  -- Insert onboarding steps for new farmer
  INSERT INTO public.farmer_onboarding_steps (farmer_id, step_name, step_order, estimated_duration) VALUES
    (NEW.id, 'registration', 1, '1 day'),
    (NEW.id, 'document_verification', 2, '2-3 days'),
    (NEW.id, 'field_assessment', 3, '1-2 weeks'),
    (NEW.id, 'baseline_measurement', 4, '1-2 weeks'),
    (NEW.id, 'training', 5, '3-5 days');
  
  RETURN NEW;
END;
$$;

-- Create trigger for onboarding initialization
CREATE TRIGGER initialize_farmer_onboarding
  AFTER INSERT ON public.carbon_farmers
  FOR EACH ROW
  EXECUTE FUNCTION public.initialize_onboarding_steps();

-- Create indexes for better performance
CREATE INDEX idx_carbon_farmers_farmer_id ON public.carbon_farmers(farmer_id);
CREATE INDEX idx_carbon_farmers_user_id ON public.carbon_farmers(user_id);
CREATE INDEX idx_carbon_farmers_verification_status ON public.carbon_farmers(verification_status);
CREATE INDEX idx_carbon_farmers_region ON public.carbon_farmers(region);
CREATE INDEX idx_carbon_farmers_practices ON public.carbon_farmers USING GIN(selected_practices);

CREATE INDEX idx_land_tenure_farmer_id ON public.land_tenure(farmer_id);
CREATE INDEX idx_land_tenure_ownership_type ON public.land_tenure(ownership_type);

CREATE INDEX idx_carbon_estimates_farmer_id ON public.carbon_estimates(farmer_id);
CREATE INDEX idx_carbon_estimates_vintage_year ON public.carbon_estimates(vintage_year);
CREATE INDEX idx_carbon_estimates_methodology ON public.carbon_estimates(methodology);

CREATE INDEX idx_carbon_credits_farmer_id ON public.carbon_credits(farmer_id);
CREATE INDEX idx_carbon_credits_status ON public.carbon_credits(status);
CREATE INDEX idx_carbon_credits_vintage_year ON public.carbon_credits(vintage_year);

CREATE INDEX idx_carbon_transactions_farmer_id ON public.carbon_transactions(farmer_id);
CREATE INDEX idx_carbon_transactions_status ON public.carbon_transactions(status);
CREATE INDEX idx_carbon_transactions_type ON public.carbon_transactions(transaction_type);

CREATE INDEX idx_marketplace_listings_seller ON public.carbon_marketplace_listings(seller_id);
CREATE INDEX idx_marketplace_listings_status ON public.carbon_marketplace_listings(status);
CREATE INDEX idx_marketplace_listings_expires ON public.carbon_marketplace_listings(expires_at);

CREATE INDEX idx_verification_documents_farmer ON public.carbon_verification_documents(farmer_id);
CREATE INDEX idx_verification_documents_type ON public.carbon_verification_documents(document_type);
CREATE INDEX idx_verification_documents_status ON public.carbon_verification_documents(verification_status);

CREATE INDEX idx_onboarding_steps_farmer ON public.farmer_onboarding_steps(farmer_id);
CREATE INDEX idx_onboarding_steps_status ON public.farmer_onboarding_steps(status);

-- Create views for easier data access
CREATE VIEW public.farmer_dashboard_summary AS
SELECT 
  cf.farmer_id,
  cf.full_name,
  cf.farm_size_hectares,
  cf.verification_status,
  cf.selected_practices,
  cf.registration_date,
  COUNT(cc.id) as total_credits,
  SUM(cc.quantity) as total_credit_quantity,
  SUM(CASE WHEN cc.status = 'issued' THEN cc.quantity ELSE 0 END) as available_credits,
  COUNT(ct.id) as total_transactions,
  SUM(ct.total_amount_usd) as total_earnings
FROM public.carbon_farmers cf
LEFT JOIN public.carbon_credits cc ON cf.id = cc.farmer_id
LEFT JOIN public.carbon_transactions ct ON cf.id = ct.farmer_id AND ct.status = 'completed'
GROUP BY cf.id, cf.farmer_id, cf.full_name, cf.farm_size_hectares, cf.verification_status, cf.selected_practices, cf.registration_date;

-- Enable realtime for all carbon credit tables
ALTER PUBLICATION supabase_realtime ADD TABLE public.carbon_farmers;
ALTER PUBLICATION supabase_realtime ADD TABLE public.land_tenure;
ALTER PUBLICATION supabase_realtime ADD TABLE public.carbon_estimates;
ALTER PUBLICATION supabase_realtime ADD TABLE public.carbon_credits;
ALTER PUBLICATION supabase_realtime ADD TABLE public.carbon_transactions;
ALTER PUBLICATION supabase_realtime ADD TABLE public.carbon_marketplace_listings;
ALTER PUBLICATION supabase_realtime ADD TABLE public.carbon_verification_documents;
ALTER PUBLICATION supabase_realtime ADD TABLE public.farmer_onboarding_steps;