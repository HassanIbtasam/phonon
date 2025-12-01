import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { url } = await req.json();

    if (!url) {
      return new Response(
        JSON.stringify({ error: 'URL is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are an expert cybersecurity analyst specializing in URL and link analysis. Analyze the provided URL for potential security threats, phishing attempts, malware, and suspicious patterns.

Consider:
1. Domain reputation and age
2. URL structure (suspicious subdomains, typosquatting, encoded characters)
3. Use of URL shorteners
4. Suspicious TLDs (top-level domains)
5. Phishing indicators (impersonating legitimate brands)
6. Malware distribution patterns
7. Social engineering tactics in URL structure
8. HTTPS vs HTTP usage
9. Known malicious patterns

Provide a detailed security analysis with:
- Risk level: "safe", "suspicious", or "dangerous"
- Specific concerns identified
- Confidence level in your assessment
- Recommendations for the user

Return your analysis in this JSON format:
{
  "risk": "safe" | "suspicious" | "dangerous",
  "confidence": "low" | "medium" | "high",
  "concerns": ["list of specific security concerns"],
  "analysis": "detailed explanation of findings",
  "recommendation": "clear action the user should take"
}`;

    console.log('Analyzing URL:', url);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze this URL for security threats: ${url}` }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again later.' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI service requires payment. Please contact support.' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error('AI service error');
    }

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    
    console.log('AI Response:', aiResponse);

    // Parse JSON from response
    let result;
    try {
      // Try to extract JSON from markdown code blocks
      const jsonMatch = aiResponse.match(/```json\n([\s\S]*?)\n```/) || aiResponse.match(/```\n([\s\S]*?)\n```/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[1]);
      } else {
        result = JSON.parse(aiResponse);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Fallback response
      result = {
        risk: 'suspicious',
        confidence: 'low',
        concerns: ['Unable to fully analyze the URL'],
        analysis: aiResponse,
        recommendation: 'Exercise caution when visiting this link. Verify its authenticity before proceeding.'
      };
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: any) {
    console.error('Error in analyze-link function:', error);
    return new Response(
      JSON.stringify({ error: error.message || 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
