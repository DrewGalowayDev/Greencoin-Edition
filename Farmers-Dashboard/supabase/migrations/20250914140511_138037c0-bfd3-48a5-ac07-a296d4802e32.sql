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