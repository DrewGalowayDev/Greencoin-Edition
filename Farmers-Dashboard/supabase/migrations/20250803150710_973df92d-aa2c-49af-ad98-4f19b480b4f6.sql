-- Create custom types
CREATE TYPE public.app_role AS ENUM ('admin', 'farmer', 'moderator');
CREATE TYPE public.farm_status AS ENUM ('active', 'inactive', 'seasonal');
CREATE TYPE public.crop_stage AS ENUM ('planted', 'growing', 'flowering', 'harvesting', 'harvested');
CREATE TYPE public.crop_health AS ENUM ('excellent', 'good', 'fair', 'poor', 'diseased');
CREATE TYPE public.transaction_type AS ENUM ('income', 'expense');
CREATE TYPE public.transaction_category AS ENUM ('seeds', 'fertilizer', 'equipment', 'labor', 'fuel', 'maintenance', 'sales', 'other');
CREATE TYPE public.equipment_condition AS ENUM ('excellent', 'good', 'fair', 'poor', 'needs_repair');
CREATE TYPE public.alert_priority AS ENUM ('low', 'medium', 'high', 'critical');
CREATE TYPE public.alert_type AS ENUM ('weather', 'crop_health', 'financial', 'maintenance', 'harvest');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  role app_role NOT NULL DEFAULT 'farmer',
  profile_image_url TEXT,
  location TEXT,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  subscription_tier TEXT DEFAULT 'basic',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create farms table
CREATE TABLE public.farms (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  owner_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  location TEXT NOT NULL,
  size_hectares DECIMAL(10,2) NOT NULL,
  soil_type TEXT,
  climate_zone TEXT,
  established_date DATE,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  status farm_status NOT NULL DEFAULT 'active',
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create crops table
CREATE TABLE public.crops (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  crop_type TEXT NOT NULL,
  variety TEXT,
  planting_date DATE NOT NULL,
  expected_harvest_date DATE,
  actual_harvest_date DATE,
  current_stage crop_stage NOT NULL DEFAULT 'planted',
  health_status crop_health NOT NULL DEFAULT 'good',
  planted_area_hectares DECIMAL(8,2) NOT NULL,
  expected_yield_kg DECIMAL(10,2),
  actual_yield_kg DECIMAL(10,2),
  notes TEXT,
  image_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create weather_data table
CREATE TABLE public.weather_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  recorded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  temperature_celsius DECIMAL(5,2),
  humidity_percent DECIMAL(5,2),
  rainfall_mm DECIMAL(8,2),
  wind_speed_kmh DECIMAL(6,2),
  soil_moisture_percent DECIMAL(5,2),
  uv_index DECIMAL(4,2),
  pressure_hpa DECIMAL(7,2),
  weather_description TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create financial_records table
CREATE TABLE public.financial_records (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  crop_id UUID REFERENCES public.crops(id) ON DELETE SET NULL,
  transaction_type transaction_type NOT NULL,
  category transaction_category NOT NULL,
  amount DECIMAL(12,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  transaction_date DATE NOT NULL,
  description TEXT NOT NULL,
  receipt_url TEXT,
  supplier_info JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create equipment_inventory table
CREATE TABLE public.equipment_inventory (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  item_name TEXT NOT NULL,
  category TEXT NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  unit TEXT,
  purchase_date DATE,
  purchase_price DECIMAL(10,2),
  current_condition equipment_condition NOT NULL DEFAULT 'good',
  maintenance_schedule TEXT,
  last_maintenance_date DATE,
  next_maintenance_date DATE,
  supplier_info JSONB,
  warranty_expiry DATE,
  location_in_farm TEXT,
  notes TEXT,
  image_urls TEXT[],
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create market_prices table
CREATE TABLE public.market_prices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crop_type TEXT NOT NULL,
  variety TEXT,
  region TEXT NOT NULL,
  current_price DECIMAL(10,2) NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  unit TEXT NOT NULL DEFAULT 'kg',
  price_date DATE NOT NULL,
  market_demand TEXT,
  seasonal_factor DECIMAL(5,2),
  price_trend TEXT,
  source TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create alerts table
CREATE TABLE public.alerts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  farm_id UUID REFERENCES public.farms(id) ON DELETE CASCADE,
  crop_id UUID REFERENCES public.crops(id) ON DELETE CASCADE,
  alert_type alert_type NOT NULL,
  priority alert_priority NOT NULL DEFAULT 'medium',
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  is_dismissed BOOLEAN NOT NULL DEFAULT false,
  action_required BOOLEAN NOT NULL DEFAULT false,
  expires_at TIMESTAMP WITH TIME ZONE,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create notifications table
CREATE TABLE public.notifications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL,
  is_read BOOLEAN NOT NULL DEFAULT false,
  data JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create crop_history table for tracking changes
CREATE TABLE public.crop_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  crop_id UUID NOT NULL REFERENCES public.crops(id) ON DELETE CASCADE,
  changed_by UUID NOT NULL REFERENCES public.profiles(user_id),
  change_type TEXT NOT NULL,
  old_values JSONB,
  new_values JSONB,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create farm_activities table
CREATE TABLE public.farm_activities (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  crop_id UUID REFERENCES public.crops(id) ON DELETE SET NULL,
  user_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  activity_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT,
  activity_date DATE NOT NULL,
  duration_hours DECIMAL(5,2),
  cost DECIMAL(10,2),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security on all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crops ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weather_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.financial_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.equipment_inventory ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_prices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.alerts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.crop_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.farm_activities ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create RLS policies for farms
CREATE POLICY "Farmers can view their own farms" 
ON public.farms FOR SELECT 
USING (auth.uid() = owner_id);

CREATE POLICY "Farmers can create their own farms" 
ON public.farms FOR INSERT 
WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "Farmers can update their own farms" 
ON public.farms FOR UPDATE 
USING (auth.uid() = owner_id);

CREATE POLICY "Farmers can delete their own farms" 
ON public.farms FOR DELETE 
USING (auth.uid() = owner_id);

-- Create RLS policies for crops
CREATE POLICY "Farmers can view crops on their farms" 
ON public.crops FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.farms 
  WHERE farms.id = crops.farm_id 
  AND farms.owner_id = auth.uid()
));

CREATE POLICY "Farmers can create crops on their farms" 
ON public.crops FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.farms 
  WHERE farms.id = crops.farm_id 
  AND farms.owner_id = auth.uid()
));

CREATE POLICY "Farmers can update crops on their farms" 
ON public.crops FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.farms 
  WHERE farms.id = crops.farm_id 
  AND farms.owner_id = auth.uid()
));

CREATE POLICY "Farmers can delete crops on their farms" 
ON public.crops FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.farms 
  WHERE farms.id = crops.farm_id 
  AND farms.owner_id = auth.uid()
));

-- Create RLS policies for weather data
CREATE POLICY "Farmers can view weather data for their farms" 
ON public.weather_data FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.farms 
  WHERE farms.id = weather_data.farm_id 
  AND farms.owner_id = auth.uid()
));

CREATE POLICY "System can insert weather data" 
ON public.weather_data FOR INSERT 
WITH CHECK (true);

-- Create RLS policies for financial records
CREATE POLICY "Farmers can view financial records for their farms" 
ON public.financial_records FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.farms 
  WHERE farms.id = financial_records.farm_id 
  AND farms.owner_id = auth.uid()
));

CREATE POLICY "Farmers can create financial records for their farms" 
ON public.financial_records FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM public.farms 
  WHERE farms.id = financial_records.farm_id 
  AND farms.owner_id = auth.uid()
));

CREATE POLICY "Farmers can update financial records for their farms" 
ON public.financial_records FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM public.farms 
  WHERE farms.id = financial_records.farm_id 
  AND farms.owner_id = auth.uid()
));

CREATE POLICY "Farmers can delete financial records for their farms" 
ON public.financial_records FOR DELETE 
USING (EXISTS (
  SELECT 1 FROM public.farms 
  WHERE farms.id = financial_records.farm_id 
  AND farms.owner_id = auth.uid()
));

-- Create RLS policies for equipment inventory
CREATE POLICY "Farmers can manage equipment for their farms" 
ON public.equipment_inventory FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.farms 
  WHERE farms.id = equipment_inventory.farm_id 
  AND farms.owner_id = auth.uid()
));

-- Create RLS policies for market prices (public read)
CREATE POLICY "Everyone can view market prices" 
ON public.market_prices FOR SELECT 
USING (true);

CREATE POLICY "System can manage market prices" 
ON public.market_prices FOR ALL 
USING (true);

-- Create RLS policies for alerts
CREATE POLICY "Users can view their own alerts" 
ON public.alerts FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own alerts" 
ON public.alerts FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can create alerts for users" 
ON public.alerts FOR INSERT 
WITH CHECK (true);

-- Create RLS policies for notifications
CREATE POLICY "Users can view their own notifications" 
ON public.notifications FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own notifications" 
ON public.notifications FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications for users" 
ON public.notifications FOR INSERT 
WITH CHECK (true);

-- Create RLS policies for crop history
CREATE POLICY "Farmers can view crop history for their farms" 
ON public.crop_history FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.crops 
  JOIN public.farms ON farms.id = crops.farm_id 
  WHERE crops.id = crop_history.crop_id 
  AND farms.owner_id = auth.uid()
));

CREATE POLICY "Users can create crop history" 
ON public.crop_history FOR INSERT 
WITH CHECK (auth.uid() = changed_by);

-- Create RLS policies for farm activities
CREATE POLICY "Farmers can manage activities for their farms" 
ON public.farm_activities FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.farms 
  WHERE farms.id = farm_activities.farm_id 
  AND farms.owner_id = auth.uid()
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_farms_updated_at
  BEFORE UPDATE ON public.farms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_crops_updated_at
  BEFORE UPDATE ON public.crops
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_financial_records_updated_at
  BEFORE UPDATE ON public.financial_records
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_equipment_inventory_updated_at
  BEFORE UPDATE ON public.equipment_inventory
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user registration
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'New Farmer')
  );
  RETURN NEW;
END;
$$;

-- Create trigger for new user profile creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create indexes for better performance
CREATE INDEX idx_farms_owner_id ON public.farms(owner_id);
CREATE INDEX idx_crops_farm_id ON public.crops(farm_id);
CREATE INDEX idx_crops_planting_date ON public.crops(planting_date);
CREATE INDEX idx_weather_data_farm_id ON public.weather_data(farm_id);
CREATE INDEX idx_weather_data_recorded_at ON public.weather_data(recorded_at);
CREATE INDEX idx_financial_records_farm_id ON public.financial_records(farm_id);
CREATE INDEX idx_financial_records_date ON public.financial_records(transaction_date);
CREATE INDEX idx_equipment_inventory_farm_id ON public.equipment_inventory(farm_id);
CREATE INDEX idx_market_prices_crop_type ON public.market_prices(crop_type);
CREATE INDEX idx_market_prices_region ON public.market_prices(region);
CREATE INDEX idx_market_prices_date ON public.market_prices(price_date);
CREATE INDEX idx_alerts_user_id ON public.alerts(user_id);
CREATE INDEX idx_alerts_is_read ON public.alerts(is_read);
CREATE INDEX idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX idx_crop_history_crop_id ON public.crop_history(crop_id);
CREATE INDEX idx_farm_activities_farm_id ON public.farm_activities(farm_id);

-- Create credits table to track earned carbon credits
CREATE TABLE public.credits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID NOT NULL,
  co2_tons NUMERIC NOT NULL DEFAULT 0,
  greencoins NUMERIC NOT NULL DEFAULT 0,
  estimated_value NUMERIC NOT NULL DEFAULT 0,
  verification_status TEXT NOT NULL DEFAULT 'pending',
  verification_body TEXT,
  verification_progress INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.credits ENABLE ROW LEVEL SECURITY;

-- Create policies for credits
CREATE POLICY "Farmers can view credits for their farms" 
ON public.credits 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM farms 
  WHERE farms.id = credits.farm_id AND farms.owner_id = auth.uid()
));

CREATE POLICY "Farmers can create credits for their farms" 
ON public.credits 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM farms 
  WHERE farms.id = credits.farm_id AND farms.owner_id = auth.uid()
));

CREATE POLICY "Farmers can update credits for their farms" 
ON public.credits 
FOR UPDATE 
USING (EXISTS (
  SELECT 1 FROM farms 
  WHERE farms.id = credits.farm_id AND farms.owner_id = auth.uid()
));

-- Create credit transactions table
CREATE TABLE public.credit_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID NOT NULL,
  credit_id UUID NOT NULL,
  transaction_date DATE NOT NULL,
  credits_amount NUMERIC NOT NULL,
  greencoins_amount NUMERIC NOT NULL,
  verifier TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'completed',
  transaction_type TEXT NOT NULL DEFAULT 'earned',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for transactions
ALTER TABLE public.credit_transactions ENABLE ROW LEVEL SECURITY;

-- Create policies for credit transactions
CREATE POLICY "Farmers can view credit transactions for their farms" 
ON public.credit_transactions 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM farms 
  WHERE farms.id = credit_transactions.farm_id AND farms.owner_id = auth.uid()
));

CREATE POLICY "Farmers can create credit transactions for their farms" 
ON public.credit_transactions 
FOR INSERT 
WITH CHECK (EXISTS (
  SELECT 1 FROM farms 
  WHERE farms.id = credit_transactions.farm_id AND farms.owner_id = auth.uid()
));

-- Add foreign key relationships
ALTER TABLE public.credits ADD CONSTRAINT credits_farm_id_fkey 
  FOREIGN KEY (farm_id) REFERENCES public.farms(id) ON DELETE CASCADE;

ALTER TABLE public.credit_transactions ADD CONSTRAINT credit_transactions_farm_id_fkey 
  FOREIGN KEY (farm_id) REFERENCES public.farms(id) ON DELETE CASCADE;

ALTER TABLE public.credit_transactions ADD CONSTRAINT credit_transactions_credit_id_fkey 
  FOREIGN KEY (credit_id) REFERENCES public.credits(id) ON DELETE CASCADE;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_credits_updated_at
  BEFORE UPDATE ON public.credits
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some sample data for demonstration
INSERT INTO public.credits (farm_id, co2_tons, greencoins, estimated_value, verification_status, verification_body, verification_progress)
SELECT 
  f.id,
  15.3,
  15.3,
  436.05,
  'in_progress',
  'SCS Global Services',
  75
FROM public.farms f
LIMIT 1;
INSERT INTO public.credit_transactions (farm_id, credit_id, transaction_date, credits_amount, greencoins_amount, verifier, status, transaction_type)