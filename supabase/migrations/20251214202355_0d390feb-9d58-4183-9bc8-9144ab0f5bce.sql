-- Drop the overly permissive policies on flagged_numbers
DROP POLICY IF EXISTS "Anyone can flag numbers" ON public.flagged_numbers;
DROP POLICY IF EXISTS "Anyone can view flagged numbers" ON public.flagged_numbers;

-- Create user-specific policies for flagged_numbers
-- Users can only view their own flagged numbers
CREATE POLICY "Users can view their own flagged numbers" 
ON public.flagged_numbers 
FOR SELECT 
USING (user_id = auth.uid());

-- Authenticated users can insert flagged numbers (with their own user_id)
CREATE POLICY "Authenticated users can flag numbers" 
ON public.flagged_numbers 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL AND (user_id IS NULL OR user_id = auth.uid()));