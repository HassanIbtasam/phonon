-- Enable Row Level Security on subscription_plans table
ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;

-- Allow everyone to view subscription plans (pricing is public)
CREATE POLICY "Anyone can view subscription plans" ON public.subscription_plans
FOR SELECT
USING (true);

-- Only service role can insert/update/delete plans (managed via admin functions)
-- No policies for INSERT/UPDATE/DELETE means only service role key can perform these operations