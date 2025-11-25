-- Update RLS policies to require authentication
DROP POLICY IF EXISTS "Anyone can view flagged numbers" ON public.flagged_numbers;
DROP POLICY IF EXISTS "Anyone can flag numbers" ON public.flagged_numbers;
DROP POLICY IF EXISTS "Anyone can update flagged numbers" ON public.flagged_numbers;

-- Create new policies requiring authentication
CREATE POLICY "Authenticated users can view flagged numbers" 
ON public.flagged_numbers 
FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Authenticated users can flag numbers" 
ON public.flagged_numbers 
FOR INSERT 
TO authenticated 
WITH CHECK (true);

CREATE POLICY "Authenticated users can update flagged numbers" 
ON public.flagged_numbers 
FOR UPDATE 
TO authenticated 
USING (true);

-- Add user_id column to track who flagged each number
ALTER TABLE public.flagged_numbers 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL;