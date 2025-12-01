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

    const { featureType } = await req.json();

    // Calculate current period
    const now = new Date();
    const periodStart = new Date(now.getFullYear(), now.getMonth(), 1);
    const periodEnd = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Get or create usage record
    let { data: usageRecord } = await supabaseClient
      .from('usage_tracking')
      .select('*')
      .eq('user_id', user.id)
      .eq('feature_type', featureType)
      .eq('period_start', periodStart.toISOString())
      .eq('period_end', periodEnd.toISOString())
      .maybeSingle();

    if (!usageRecord) {
      const { data: newRecord } = await supabaseClient
        .from('usage_tracking')
        .insert({
          user_id: user.id,
          feature_type: featureType,
          usage_count: 0,
          period_start: periodStart.toISOString(),
          period_end: periodEnd.toISOString(),
        })
        .select()
        .single();
      usageRecord = newRecord;
    }

    // Get user's plan limits
    const { data: subscription } = await supabaseClient
      .from('user_subscriptions')
      .select('plan_id, subscription_plans(*)')
      .eq('user_id', user.id)
      .eq('status', 'active')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let limit: number | null = null;
    let planName = 'Basic';

    if (subscription && subscription.subscription_plans) {
      const plan: any = subscription.subscription_plans;
      planName = plan.name;
      
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
    } else {
      // Default to basic plan
      const { data: basicPlan } = await supabaseClient
        .from('subscription_plans')
        .select('*')
        .eq('tier', 'basic')
        .single();

      if (basicPlan) {
        planName = basicPlan.name;
        switch (featureType) {
          case 'text_analysis':
            limit = basicPlan.text_analysis_limit;
            break;
          case 'screenshot_analysis':
            limit = basicPlan.screenshot_analysis_limit;
            break;
          case 'link_analysis':
            limit = basicPlan.link_analysis_limit;
            break;
          case 'live_call':
            limit = basicPlan.live_call_limit;
            break;
        }
      }
    }

    const canUse = limit === null || (usageRecord?.usage_count || 0) < limit;

    return new Response(
      JSON.stringify({
        canUse,
        currentUsage: usageRecord?.usage_count || 0,
        limit,
        planName,
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