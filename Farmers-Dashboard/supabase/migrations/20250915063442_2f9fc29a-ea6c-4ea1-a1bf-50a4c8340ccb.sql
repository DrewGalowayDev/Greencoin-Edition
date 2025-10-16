-- Safe SQL script for carbon credits functionality - Part 1: Create Tables
-- Run each section separately to avoid syntax errors

-- =====================================================
-- PART 1: CREATE TABLES
-- =====================================================

-- Create verification_steps table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.verification_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  credit_id UUID NOT NULL REFERENCES public.credits(id) ON DELETE CASCADE,
  step_name TEXT NOT NULL,
  step_order INTEGER NOT NULL,
  completed BOOLEAN NOT NULL DEFAULT false,
  completion_date DATE,
  expected_date DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create carbon_practices table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.carbon_practices (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  practice_name TEXT NOT NULL,
  practice_type TEXT NOT NULL,
  implementation_level TEXT NOT NULL DEFAULT 'Low',
  start_date DATE,
  area_hectares DECIMAL(8,2),
  estimated_co2_impact DECIMAL(8,2),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create carbon_calculations table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.carbon_calculations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  farm_size DECIMAL(8,2) NOT NULL,
  soil_type TEXT,
  rainfall TEXT,
  implementation_level TEXT,
  soil_carbon DECIMAL(8,2) NOT NULL DEFAULT 0,
  biomass DECIMAL(8,2) NOT NULL DEFAULT 0,
  emissions DECIMAL(8,2) NOT NULL DEFAULT 0,
  total_credits DECIMAL(8,2) NOT NULL DEFAULT 0,
  confidence_score INTEGER NOT NULL DEFAULT 0,
  calculation_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create market_data table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.market_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  average_price DECIMAL(10,2) NOT NULL,
  volume_24h DECIMAL(12,2) NOT NULL DEFAULT 0,
  change_24h DECIMAL(5,2) NOT NULL DEFAULT 0,
  top_buyers TEXT[] DEFAULT '{}',
  market_date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =====================================================
-- PART 2: ADD COLUMNS TO CREDITS TABLE
-- =====================================================
-- Run these ALTER TABLE commands one by one, ignore errors if columns exist

-- Add pending_credits column
ALTER TABLE public.credits ADD COLUMN IF NOT EXISTS pending_credits NUMERIC NOT NULL DEFAULT 0;

-- Add in_verification_credits column
ALTER TABLE public.credits ADD COLUMN IF NOT EXISTS in_verification_credits NUMERIC NOT NULL DEFAULT 0;

-- Add market_price column
ALTER TABLE public.credits ADD COLUMN IF NOT EXISTS market_price NUMERIC NOT NULL DEFAULT 0;

-- Add price_change column
ALTER TABLE public.credits ADD COLUMN IF NOT EXISTS price_change NUMERIC NOT NULL DEFAULT 0;

-- Add methodology column
ALTER TABLE public.credits ADD COLUMN IF NOT EXISTS methodology TEXT DEFAULT 'VCS-VM0017';

-- Add confidence_score column
ALTER TABLE public.credits ADD COLUMN IF NOT EXISTS confidence_score DECIMAL(5,2) DEFAULT 0.87;

-- Add next_verification_date column
ALTER TABLE public.credits ADD COLUMN IF NOT EXISTS next_verification_date DATE;

-- =====================================================
-- PART 3: ENABLE ROW LEVEL SECURITY
-- =====================================================

-- Enable RLS on new tables (ignore errors if already enabled)
ALTER TABLE public.verification_steps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carbon_practices ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carbon_calculations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.market_data ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- PART 4: CREATE RLS POLICIES
-- =====================================================
-- Drop existing policies first to avoid conflicts, then recreate

-- Policies for verification_steps
DROP POLICY IF EXISTS "Farmers can view verification steps for their credits" ON public.verification_steps;
CREATE POLICY "Farmers can view verification steps for their credits"
ON public.verification_steps FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.credits
  JOIN public.farms ON farms.id = credits.farm_id
  WHERE credits.id = verification_steps.credit_id
  AND farms.owner_id = auth.uid()
));

-- Policies for carbon_practices
DROP POLICY IF EXISTS "Farmers can manage practices for their farms" ON public.carbon_practices;
CREATE POLICY "Farmers can manage practices for their farms"
ON public.carbon_practices FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.farms
  WHERE farms.id = carbon_practices.farm_id
  AND farms.owner_id = auth.uid()
));

-- Policies for carbon_calculations
DROP POLICY IF EXISTS "Farmers can manage calculations for their farms" ON public.carbon_calculations;
CREATE POLICY "Farmers can manage calculations for their farms"
ON public.carbon_calculations FOR ALL
USING (EXISTS (
  SELECT 1 FROM public.farms
  WHERE farms.id = carbon_calculations.farm_id
  AND farms.owner_id = auth.uid()
));

-- Policies for market_data (public read)
DROP POLICY IF EXISTS "Everyone can view market data" ON public.market_data;
CREATE POLICY "Everyone can view market data"
ON public.market_data FOR SELECT
USING (true);

-- =====================================================
-- PART 5: CREATE TRIGGERS
-- =====================================================
-- Drop existing triggers first, then recreate

DROP TRIGGER IF EXISTS update_verification_steps_updated_at ON public.verification_steps;
CREATE TRIGGER update_verification_steps_updated_at
  BEFORE UPDATE ON public.verification_steps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_carbon_practices_updated_at ON public.carbon_practices;
CREATE TRIGGER update_carbon_practices_updated_at
  BEFORE UPDATE ON public.carbon_practices
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_carbon_calculations_updated_at ON public.carbon_calculations;
CREATE TRIGGER update_carbon_calculations_updated_at
  BEFORE UPDATE ON public.carbon_calculations
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- PART 6: CREATE INDEXES
-- =====================================================
-- Drop and recreate indexes

DROP INDEX IF EXISTS idx_verification_steps_credit_id;
CREATE INDEX idx_verification_steps_credit_id ON public.verification_steps(credit_id);

DROP INDEX IF EXISTS idx_carbon_practices_farm_id;
CREATE INDEX idx_carbon_practices_farm_id ON public.carbon_practices(farm_id);

DROP INDEX IF EXISTS idx_carbon_calculations_farm_id;
CREATE INDEX idx_carbon_calculations_farm_id ON public.carbon_calculations(farm_id);

DROP INDEX IF EXISTS idx_market_data_date;
CREATE INDEX idx_market_data_date ON public.market_data(market_date);

-- =====================================================
-- PART 7: INSERT SAMPLE DATA
-- =====================================================
-- Only run if you want sample data

-- Insert sample market data
INSERT INTO public.market_data (average_price, volume_24h, change_24h, top_buyers, market_date)
SELECT 28.89, 2847.25, 3.2, ARRAY['GreenTech Solutions', 'EcoCorpAfrica', 'CarbonNeutral Ltd'], CURRENT_DATE
WHERE NOT EXISTS (SELECT 1 FROM public.market_data LIMIT 1);

-- Insert sample verification steps (only if credits exist)
INSERT INTO public.verification_steps (credit_id, step_name, step_order, completed, completion_date, expected_date)
SELECT 
  c.id,
  'QA/QC',
  1,
  true,
  '2025-07-15'::DATE,
  null
FROM public.credits c
WHERE NOT EXISTS (SELECT 1 FROM public.verification_steps WHERE credit_id = c.id AND step_name = 'QA/QC')
LIMIT 1;

INSERT INTO public.verification_steps (credit_id, step_name, step_order, completed, completion_date, expected_date)
SELECT 
  c.id,
  'Field Check',
  2,
  true,
  '2025-07-18'::DATE,
  null
FROM public.credits c
WHERE NOT EXISTS (SELECT 1 FROM public.verification_steps WHERE credit_id = c.id AND step_name = 'Field Check')
LIMIT 1;

INSERT INTO public.verification_steps (credit_id, step_name, step_order, completed, completion_date, expected_date)
SELECT 
  c.id,
  'Satellite',
  3,
  true,
  '2025-07-22'::DATE,
  null
FROM public.credits c
WHERE NOT EXISTS (SELECT 1 FROM public.verification_steps WHERE credit_id = c.id AND step_name = 'Satellite')
LIMIT 1;

INSERT INTO public.verification_steps (credit_id, step_name, step_order, completed, expected_date)
SELECT 
  c.id,
  'Lab Analysis',
  4,
  false,
  '2025-08-01'::DATE
FROM public.credits c
WHERE NOT EXISTS (SELECT 1 FROM public.verification_steps WHERE credit_id = c.id AND step_name = 'Lab Analysis')
LIMIT 1;

INSERT INTO public.verification_steps (credit_id, step_name, step_order, completed, expected_date)
SELECT 
  c.id,
  'Final Audit',
  5,
  false,
  '2025-08-15'::DATE
FROM public.credits c
WHERE NOT EXISTS (SELECT 1 FROM public.verification_steps WHERE credit_id = c.id AND step_name = 'Final Audit')
LIMIT 1;