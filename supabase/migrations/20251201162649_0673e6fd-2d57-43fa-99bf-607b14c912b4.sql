CREATE TABLE public.subscription_plans (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  tier text NOT NULL UNIQUE,
  price_monthly numeric NOT NULL,
  price_yearly numeric NOT NULL,
  text_analysis_limit integer,
  screenshot_analysis_limit integer,
  link_analysis_limit integer,
  live_call_limit integer,
  features jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.user_subscriptions (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  plan_id uuid NOT NULL REFERENCES public.subscription_plans(id),
  billing_period text NOT NULL CHECK (billing_period IN ('monthly', 'yearly', 'lifetime')),
  status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  started_at timestamp with time zone NOT NULL DEFAULT now(),
  expires_at timestamp with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

CREATE TABLE public.usage_tracking (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id uuid NOT NULL,
  feature_type text NOT NULL CHECK (feature_type IN ('text_analysis', 'screenshot_analysis', 'link_analysis', 'live_call')),
  usage_count integer NOT NULL DEFAULT 0,
  period_start timestamp with time zone NOT NULL DEFAULT date_trunc('month', now()),
  period_end timestamp with time zone NOT NULL DEFAULT (date_trunc('month', now()) + interval '1 month'),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(user_id, feature_type, period_start)
);

ALTER TABLE public.subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_subscriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;