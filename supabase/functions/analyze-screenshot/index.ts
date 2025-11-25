import "https://deno.land/x/xhr@0.1.0/mod.ts";
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
    const { image, language = 'en' } = await req.json();
    
    if (!image) {
      return new Response(
        JSON.stringify({ error: 'No image provided' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ error: 'AI service not configured' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const systemPrompt = `You are an expert scam detection AI specializing in analyzing conversation screenshots for fraudulent activity worldwide. You have comprehensive knowledge of scam patterns across all regions and countries.

CRITICAL ANALYSIS FRAMEWORK:
Analyze the screenshot for:
1. **Sender Legitimacy**: Check phone numbers, usernames, and profile details
2. **Message Content**: Look for urgency tactics, threats, promises of rewards
3. **Language Patterns**: Identify suspicious grammar, spelling, or phrasing
4. **Regional Context**: Adapt detection to the specific country/region visible in the conversation
5. **Visual Indicators**: Check for fake logos, edited images, or impersonation

GLOBAL SCAM TYPES TO DETECT:
- Government/Authority impersonation (police, immigration, tax agencies, customs, social security)
- Banking fraud (local and international banks, payment services)
- Delivery scams (postal services, courier companies: USPS, FedEx, DHL, Royal Mail, Aramex, etc.)
- Telecom fraud (mobile operators, internet providers)
- Prize/lottery/sweepstakes scams
- Investment and cryptocurrency schemes
- Romance and relationship scams
- Job offer and employment fraud
- Real estate and rental scams
- Tech support scams
- IRS/tax scams
- Social media account takeover attempts
- Grandparent/family emergency scams
- Charity and donation fraud

RESPONSE FORMAT (JSON):
{
  "riskLevel": "low" | "medium" | "high",
  "confidence": 0-100,
  "scamType": "specific type or 'legitimate'",
  "reasoning": "detailed explanation of your analysis",
  "redFlags": ["flag1", "flag2"],
  "recommendations": ["action1", "action2"]
}

Language: ${language === 'ar' ? 'Respond in Arabic' : 'Respond in English'}`;

    console.log('Sending image to AI for analysis...');
    
    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { 
            role: 'system', 
            content: systemPrompt 
          },
          { 
            role: 'user', 
            content: [
              {
                type: 'text',
                text: 'Analyze this conversation screenshot for any signs of scam or fraudulent activity. Provide a detailed analysis following the specified JSON format.'
              },
              {
                type: 'image_url',
                image_url: {
                  url: image
                }
              }
            ]
          }
        ],
        temperature: 0.3,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      return new Response(
        JSON.stringify({ error: 'AI analysis failed' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
      );
    }

    const data = await response.json();
    const analysisText = data.choices[0].message.content;
    
    console.log('AI Analysis result:', analysisText);

    // Try to parse JSON from the response
    let analysis;
    try {
      // Extract JSON from markdown code blocks if present
      const jsonMatch = analysisText.match(/```json\n([\s\S]*?)\n```/) || 
                       analysisText.match(/\{[\s\S]*\}/);
      const jsonStr = jsonMatch ? (jsonMatch[1] || jsonMatch[0]) : analysisText;
      analysis = JSON.parse(jsonStr);
    } catch (parseError) {
      console.error('Failed to parse AI response as JSON:', parseError);
      // Fallback: return the text analysis
      analysis = {
        riskLevel: 'medium',
        confidence: 70,
        scamType: 'unknown',
        reasoning: analysisText,
        redFlags: [],
        recommendations: ['Verify through official channels']
      };
    }

    return new Response(
      JSON.stringify(analysis),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in analyze-screenshot function:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    );
  }
});
