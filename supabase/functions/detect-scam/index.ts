import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.84.0';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { message, phoneNumber, action, status } = await req.json();
    
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseAnonKey = Deno.env.get('SUPABASE_ANON_KEY')!;
    
    // Create client with forwarded auth for proper RLS enforcement
    const authHeader = req.headers.get('Authorization');
    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: {
        headers: authHeader ? { Authorization: authHeader } : {},
      },
    });

    // Handle flagging action
    if (action === 'flag' && phoneNumber) {
      // Validate phone number format (E.164)
      const phoneRegex = /^\+?[1-9]\d{1,14}$/;
      if (!phoneRegex.test(phoneNumber)) {
        return new Response(
          JSON.stringify({ error: 'Invalid phone number format' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Validate status
      if (!['scam', 'safe'].includes(status)) {
        return new Response(
          JSON.stringify({ error: 'Status must be "scam" or "safe"' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        );
      }

      // Try to get user ID from authenticated session
      let userId: string | null = null;
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        userId = user.id;
      }

      const { data, error } = await supabase
        .from('flagged_numbers')
        .upsert({ 
          phone_number: phoneNumber, 
          status: status,
          message_context: message?.substring(0, 500),
          user_id: userId
        }, {
          onConflict: 'phone_number'
        });

      if (error) {
        console.error('Error flagging number:', error);
        return new Response(
          JSON.stringify({ error: 'Failed to flag number' }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
        );
      }

      return new Response(
        JSON.stringify({ success: true, message: 'Number flagged successfully' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }
    
    // Validate message exists and has valid length
    if (!message || typeof message !== 'string') {
      return new Response(
        JSON.stringify({ error: "Message is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Limit message length to prevent resource exhaustion and high AI costs
    if (message.length > 10000) {
      return new Response(
        JSON.stringify({ error: "Message must be 10,000 characters or less" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check if phone number is already flagged
    let flaggedInfo = '';
    if (phoneNumber) {
      const { data: flaggedData } = await supabase
        .from('flagged_numbers')
        .select('status, flagged_at')
        .eq('phone_number', phoneNumber)
        .single();

      if (flaggedData) {
        flaggedInfo = `\n\nIMPORTANT: This phone number (${phoneNumber}) has been previously flagged as "${flaggedData.status}" by users on ${new Date(flaggedData.flagged_at).toLocaleDateString()}. Consider this in your analysis.`;
      }
    }

    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY is not configured");
    }

    const systemPrompt = `You are an expert scam detection AI with comprehensive knowledge of scam patterns worldwide. Analyze the given message and determine if it's likely a scam, regardless of the sender's or recipient's location.

UNIVERSAL SCAM INDICATORS:
- Urgent or threatening language
- Requests for personal information (passwords, bank details, ID numbers, SSN, etc.)
- Claims of prizes, winnings, lottery, or unexpected money
- Pressure tactics or time-limited offers
- Suspicious links or shortened URLs (cutt.ly, bit.ly, tinyurl, etc.)
- Impersonation of legitimate organizations
- Grammar/spelling errors from supposed official sources
- Requests to transfer money, wire transfers, or gift cards
- Cryptocurrency/investment schemes
- Phishing attempts
- Too-good-to-be-true offers
- Advance fee fraud

GLOBAL SCAM PATTERNS BY CATEGORY:

Government/Authority Impersonation (adapt to any country):
- Tax agencies (IRS, HMRC, tax departments worldwide)
- Police, immigration, customs agencies
- Social security/benefits departments
- Traffic violations and parking fines
- Visa/passport/ID expiration notices
- Court summons or legal threats
- Government portals and official apps

Banking & Financial Scams (worldwide):
- Major banks (Bank of America, Chase, Wells Fargo, HSBC, Barclays, QNB, Emirates NBD, etc.)
- Credit card fraud alerts
- Frozen accounts or suspended cards
- Payment gateway scams (PayPal, Stripe, Venmo, Cash App, etc.)
- Digital wallet scams
- Wire transfer requests

Delivery & E-commerce Scams (global):
- Postal services (USPS, Royal Mail, Australia Post, Canada Post, etc.)
- Courier companies (FedEx, DHL, UPS, Aramex, TNT)
- E-commerce platforms (Amazon, eBay, Alibaba, Noon, etc.)
- Cash-on-delivery scams
- Fake customs clearance fees
- Package tracking scams

Telecom Scams (any country):
- SIM card blocking threats
- Phone number verification requests
- Fake prize notifications from telecom companies
- Account suspension threats

Tech Support Scams:
- Microsoft, Apple, Google impersonation
- Antivirus/security software scams
- Computer virus warnings
- Remote access requests

Romance & Relationship Scams:
- Dating site/app scams
- Military romance scams
- Emergency money requests from online relationships

Employment & Business Scams:
- Fake job offers requiring upfront payment
- Work-from-home schemes
- Business opportunity scams
- Fake invoices or supplier fraud

Real Estate & Rental Scams:
- Too-good-to-be-true rental listings
- Advance payment requests before viewing
- Fake property investment opportunities

Charity & Emergency Scams:
- Disaster relief scams
- Fake fundraisers
- Religious/charitable organization impersonation

Regional Context Awareness:
- Detect language patterns (Arabic, Spanish, French, Chinese, etc.)
- Identify regional organizations and services
- Recognize local currency formats and customs
- Consider cultural context in communication style
${flaggedInfo}

Respond ONLY with a JSON object in this exact format:
{
  "risk": "low" | "medium" | "high",
  "reason": "Brief explanation of your assessment in the same language as the message"
}

Apply strict evaluation regardless of the user's location - prioritize user safety and err on the side of caution when patterns seem suspicious.`;

    console.log("Analyzing message:", message.substring(0, 100));

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: message }
        ],
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Rate limit exceeded. Please try again later." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Payment required. Please add credits to your workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      const errorText = await response.text();
      console.error("AI Gateway error:", response.status, errorText);
      throw new Error("AI Gateway error");
    }

    const data = await response.json();
    const aiResponse = data.choices?.[0]?.message?.content;
    
    console.log("AI Response:", aiResponse);

    // Parse the JSON response from AI
    let result;
    try {
      // Extract JSON from response (in case there's extra text)
      const jsonMatch = aiResponse.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        result = JSON.parse(jsonMatch[0]);
      } else {
        throw new Error("No JSON found in response");
      }
    } catch (parseError) {
      console.error("Failed to parse AI response:", parseError);
      // Fallback to safe default
      result = {
        risk: "medium",
        reason: "Unable to parse AI analysis. Please review the message carefully."
      };
    }

    // Validate the response format
    if (!result.risk || !["low", "medium", "high"].includes(result.risk)) {
      result.risk = "medium";
    }
    if (!result.reason) {
      result.reason = "Analysis completed.";
    }

    return new Response(
      JSON.stringify(result),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error in detect-scam function:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "An unknown error occurred",
        risk: "medium",
        reason: "Error analyzing message. Please review carefully."
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
