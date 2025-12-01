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

    // Get existing record
    const { data: existingRecord } = await supabaseClient
      .from('usage_tracking')
      .select('*')
      .eq('user_id', user.id)
      .eq('feature_type', featureType)
      .eq('period_start', periodStart.toISOString())
      .eq('period_end', periodEnd.toISOString())
      .maybeSingle();

    let updatedRecord;

    if (existingRecord) {
      // Increment existing record
      const { data } = await supabaseClient
        .from('usage_tracking')
        .update({ 
          usage_count: existingRecord.usage_count + 1,
          updated_at: new Date().toISOString()
        })
        .eq('id', existingRecord.id)
        .select()
        .single();
      updatedRecord = data;
    } else {
      // Create new record with count of 1
      const { data } = await supabaseClient
        .from('usage_tracking')
        .insert({
          user_id: user.id,
          feature_type: featureType,
          usage_count: 1,
          period_start: periodStart.toISOString(),
          period_end: periodEnd.toISOString(),
        })
        .select()
        .single();
      updatedRecord = data;
    }

    return new Response(
      JSON.stringify({ success: true, usage: updatedRecord }),
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