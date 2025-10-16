-- Create verification_steps table
CREATE TABLE public.verification_steps (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  label TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'failed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for verification_steps
ALTER TABLE public.verification_steps ENABLE ROW LEVEL SECURITY;

-- Create policies for verification_steps
CREATE POLICY "Users can view their own verification steps"
ON public.verification_steps
FOR SELECT
USING (farm_id IN (SELECT id FROM public.farms WHERE owner_id = auth.uid()));

CREATE POLICY "Users can insert their own verification steps"
ON public.verification_steps
FOR INSERT
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE owner_id = auth.uid()));

CREATE POLICY "Users can update their own verification steps"
ON public.verification_steps
FOR UPDATE
USING (farm_id IN (SELECT id FROM public.farms WHERE owner_id = auth.uid()));

-- Create verification_timeline table
CREATE TABLE public.verification_timeline (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  label TEXT NOT NULL,
  timestamp TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for verification_timeline
ALTER TABLE public.verification_timeline ENABLE ROW LEVEL SECURITY;

-- Create policies for verification_timeline
CREATE POLICY "Users can view their own verification timeline"
ON public.verification_timeline
FOR SELECT
USING (farm_id IN (SELECT id FROM public.farms WHERE owner_id = auth.uid()));

CREATE POLICY "Users can insert their own verification timeline"
ON public.verification_timeline
FOR INSERT
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE owner_id = auth.uid()));

-- Create verification_documents table
CREATE TABLE public.verification_documents (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  farm_id UUID NOT NULL REFERENCES public.farms(id) ON DELETE CASCADE,
  filename TEXT NOT NULL,
  file_path TEXT,
  file_size INTEGER,
  content_type TEXT,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS for verification_documents
ALTER TABLE public.verification_documents ENABLE ROW LEVEL SECURITY;

-- Create policies for verification_documents
CREATE POLICY "Users can view their own verification documents"
ON public.verification_documents
FOR SELECT
USING (farm_id IN (SELECT id FROM public.farms WHERE owner_id = auth.uid()));

CREATE POLICY "Users can insert their own verification documents"
ON public.verification_documents
FOR INSERT
WITH CHECK (farm_id IN (SELECT id FROM public.farms WHERE owner_id = auth.uid()));

CREATE POLICY "Users can update their own verification documents"
ON public.verification_documents
FOR UPDATE
USING (farm_id IN (SELECT id FROM public.farms WHERE owner_id = auth.uid()));

CREATE POLICY "Users can delete their own verification documents"
ON public.verification_documents
FOR DELETE
USING (farm_id IN (SELECT id FROM public.farms WHERE owner_id = auth.uid()));

-- Add triggers for updated_at
CREATE TRIGGER update_verification_steps_updated_at
  BEFORE UPDATE ON public.verification_steps
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add practices column to farms table if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'farms' 
                 AND column_name = 'practices') THEN
    ALTER TABLE public.farms ADD COLUMN practices TEXT[];
  END IF;
END $$;