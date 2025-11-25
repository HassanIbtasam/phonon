-- Create table for flagged phone numbers
CREATE TABLE public.flagged_numbers (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phone_number TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('scam', 'safe')),
  message_context TEXT,
  flagged_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(phone_number)
);

-- Enable Row Level Security
ALTER TABLE public.flagged_numbers ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read flagged numbers (for AI to learn)
CREATE POLICY "Anyone can view flagged numbers"
ON public.flagged_numbers
FOR SELECT
USING (true);

-- Allow anyone to insert flagged numbers (in production, this should require auth)
CREATE POLICY "Anyone can flag numbers"
ON public.flagged_numbers
FOR INSERT
WITH CHECK (true);

-- Allow updates to change status or add context
CREATE POLICY "Anyone can update flagged numbers"
ON public.flagged_numbers
FOR UPDATE
USING (true);

-- Create index for faster lookups
CREATE INDEX idx_flagged_numbers_phone ON public.flagged_numbers(phone_number);
CREATE INDEX idx_flagged_numbers_status ON public.flagged_numbers(status);