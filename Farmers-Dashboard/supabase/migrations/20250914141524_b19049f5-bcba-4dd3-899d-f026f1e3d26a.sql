-- Fix security issue with profiles table (without foreign key that already exists)
-- Ensure user_id column cannot be null (critical for RLS)
ALTER TABLE public.profiles ALTER COLUMN user_id SET NOT NULL;

-- Add unique constraint on user_id to prevent duplicate profiles
ALTER TABLE public.profiles ADD CONSTRAINT profiles_user_id_unique UNIQUE (user_id);

-- Drop existing policies and recreate them with more explicit security
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;

-- Create stricter RLS policies with explicit user validation
CREATE POLICY "Users can insert their own profile only" 
ON public.profiles 
FOR INSERT 
TO authenticated
WITH CHECK (auth.uid() = user_id AND user_id IS NOT NULL);

CREATE POLICY "Users can update their own profile only" 
ON public.profiles 
FOR UPDATE 
TO authenticated
USING (auth.uid() = user_id AND user_id IS NOT NULL)
WITH CHECK (auth.uid() = user_id AND user_id IS NOT NULL);

CREATE POLICY "Users can view their own profile only" 
ON public.profiles 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id AND user_id IS NOT NULL);

-- Ensure RLS is enabled (should already be enabled but adding for safety)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;