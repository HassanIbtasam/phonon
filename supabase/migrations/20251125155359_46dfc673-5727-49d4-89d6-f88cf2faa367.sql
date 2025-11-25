-- Update RLS policies to allow anonymous flagging
DROP POLICY IF EXISTS "Authenticated users can view flagged numbers" ON public.flagged_numbers;
DROP POLICY IF EXISTS "Authenticated users can flag numbers" ON public.flagged_numbers;
DROP POLICY IF EXISTS "Authenticated users can update flagged numbers" ON public.flagged_numbers;

-- Allow anyone to view and insert flagged numbers (for AI checking and anonymous reporting)
CREATE POLICY "Anyone can view flagged numbers" 
ON public.flagged_numbers 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can flag numbers" 
ON public.flagged_numbers 
FOR INSERT 
WITH CHECK (true);

-- Only allow users to update their own flagged numbers
CREATE POLICY "Users can update their own flagged numbers" 
ON public.flagged_numbers 
FOR UPDATE 
USING (user_id = auth.uid() OR user_id IS NULL);

-- Create scan_history table for personal scan history
CREATE TABLE IF NOT EXISTS public.scan_history (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  message_preview text NOT NULL,
  phone_number text,
  risk_level text NOT NULL,
  reason text NOT NULL,
  scanned_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on scan_history
ALTER TABLE public.scan_history ENABLE ROW LEVEL SECURITY;

-- Users can only view their own scan history
CREATE POLICY "Users can view their own scan history" 
ON public.scan_history 
FOR SELECT 
USING (user_id = auth.uid());

-- Users can only insert their own scan history
CREATE POLICY "Users can insert their own scan history" 
ON public.scan_history 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_scan_history_user_id ON public.scan_history(user_id);
CREATE INDEX IF NOT EXISTS idx_scan_history_scanned_at ON public.scan_history(scanned_at DESC);