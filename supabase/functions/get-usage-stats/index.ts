import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.84.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { data: { user }, error: userError } = await supabaseClient.auth.getUser();
    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Calculate current period
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Get user's plan
    const { data: subscription } = await supabaseClient
      .from('user_subscriptions')
      .select('plan_id, subscription_plans(*)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let plan: any;
    if (subscription && subscription.subscription_plans) {
      plan = subscription.subscription_plans;
    } else {
      // Default to free plan
      const { data: freePlan } = await supabaseClient
        .from('subscription_plans')
        .select('*')
        .eq('tier', 'free')
        .maybeSingle();
      plan = freePlan;
    }

    // If no plan found, return default limits
    if (!plan) {
      plan = {
        name: 'Basic',
        tier: 'free',
        text_analysis_limit: 10,
        screenshot_analysis_limit: 5,
        link_analysis_limit: 10,
        live_call_limit: 0,
      };
    }

    // Get usage records for current period
    const { data: usageRecords } = await supabaseClient
      .from('usage_tracking')
      .select('*')
      .eq('user_id', user.id)
      .eq('period_start', periodStart.toISOString())
      .eq('period_end', periodEnd.toISOString());

    const featureTypes = ['text_analysis', 'screenshot_analysis', 'link_analysis', 'live_call'];
    const stats = featureTypes.map(featureType => {
      const usage = usageRecords?.find(r => r.feature_type === featureType);
      const currentUsage = usage?.usage_count || 0;
      
      let limit: number | null = null;
      switch (featureType) {
        case 'text_analysis':
          limit = plan.text_analysis_limit;
          break;
        case 'screenshot_analysis':
          limit = plan.screenshot_analysis_limit;
          break;
        case 'link_analysis':
          limit = plan.link_analysis_limit;
          break;
        case 'live_call':
          limit = plan.live_call_limit;
          break;
      }

      const percentageUsed = limit === null ? 0 : Math.round((currentUsage / limit) * 100);

      return {
        featureType,
        currentUsage,
        limit,
        percentageUsed,
        periodStart: periodStart.toISOString(),
        periodEnd: periodEnd.toISOString(),
      };
    });

    return new Response(
      JSON.stringify({ 
        stats,
        planName: plan.name,
        planTier: plan.tier
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    return new Response(JSON.stringify({ error: message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});