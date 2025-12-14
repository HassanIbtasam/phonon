-- Add RLS policies for user_roles table
-- Users can view their own roles
CREATE POLICY "Users can view their own roles" 
ON public.user_roles 
FOR SELECT 
USING (user_id = auth.uid());

-- Add RLS policies for user_subscriptions table
CREATE POLICY "Users can view their own subscription" 
ON public.user_subscriptions 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own subscription" 
ON public.user_subscriptions 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own subscription" 
ON public.user_subscriptions 
FOR UPDATE 
USING (user_id = auth.uid());

-- Add RLS policies for usage_tracking table
CREATE POLICY "Users can view their own usage" 
ON public.usage_tracking 
FOR SELECT 
USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own usage" 
ON public.usage_tracking 
FOR INSERT 
WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own usage" 
ON public.usage_tracking 
FOR UPDATE 
USING (user_id = auth.uid());