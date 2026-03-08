import "https://deno.land/std@0.168.0/dotenv/load.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { imageBase64, declaredAmount, groupId, contributionId } = await req.json();

    if (!imageBase64) {
      return new Response(JSON.stringify({ error: 'No image provided' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'AI not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Call Lovable AI Gateway with vision model
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
            role: 'user',
            content: [
              {
                type: 'text',
                text: `Analyze this receipt/bank statement/investment proof image. Extract the following information:

Return ONLY a JSON object with these fields:
- "amount": the main total amount as a number (no currency symbols, no commas for thousands). If multiple amounts, pick the largest/total.
- "currency": the detected currency code (e.g., "BRL", "USD", "EUR", "CAD") or null if not detected
- "date": the transaction date in ISO format (YYYY-MM-DD) or null if not detected
- "transaction_type": one of "deposit", "transfer", "pix", "payment", "investment", "other" based on the document content
- "description": a short 1-line description of what this receipt is for (in the same language as the document)
- "confidence": a number 0-100 representing how confident you are in the amount extraction

Example response: {"amount": 150.50, "currency": "BRL", "date": "2026-03-08", "transaction_type": "pix", "description": "Depósito bancário via Pix", "confidence": 95}

If you cannot detect any amount, return: {"amount": 0, "currency": null, "date": null, "transaction_type": "other", "description": "Could not detect amount", "confidence": 0}`,
              },
              {
                type: 'image_url',
                image_url: {
                  url: imageBase64.startsWith('data:') ? imageBase64 : `data:image/jpeg;base64,${imageBase64}`,
                },
              },
            ],
          },
        ],
        max_tokens: 300,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', errorText);
      return new Response(JSON.stringify({ error: 'AI processing failed' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const aiResult = await response.json();
    const content = aiResult.choices?.[0]?.message?.content || '';

    // Parse the JSON from AI response
    let parsed;
    try {
      const jsonMatch = content.match(/\{[\s\S]*?\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : { amount: 0, currency: null, date: null, transaction_type: 'other', description: 'Parse error', confidence: 0 };
    } catch {
      parsed = { amount: 0, currency: null, date: null, transaction_type: 'other', description: 'Could not process', confidence: 0 };
    }

    // Validate amount match if declaredAmount is provided
    let validationStatus = 'pending';
    let amountMatch = null;

    if (declaredAmount != null && parsed.amount > 0) {
      const tolerance = 0.05; // 5%
      const lowerBound = declaredAmount * (1 - tolerance);
      const upperBound = declaredAmount * (1 + tolerance);
      amountMatch = parsed.amount >= lowerBound && parsed.amount <= upperBound;
      validationStatus = amountMatch ? 'approved' : 'flagged';
    }

    // Store validation record if we have contribution context
    if (contributionId && groupId) {
      try {
        const authHeader = req.headers.get('Authorization');
        const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
        const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY')!;
        const supabase = createClient(supabaseUrl, supabaseKey, {
          global: { headers: { Authorization: authHeader || '' } },
        });

        // Get user ID from auth
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          await supabase.from('receipt_validations').insert({
            contribution_id: contributionId,
            user_id: user.id,
            group_id: groupId,
            declared_amount: declaredAmount || 0,
            extracted_amount: parsed.amount,
            extracted_date: parsed.date,
            extracted_type: parsed.transaction_type,
            extracted_description: parsed.description,
            validation_status: validationStatus,
            amount_match: amountMatch,
          });
        }
      } catch (dbErr) {
        console.error('DB insert error:', dbErr);
        // Don't fail the whole request for a DB error
      }
    }

    return new Response(JSON.stringify({
      ...parsed,
      validation_status: validationStatus,
      amount_match: amountMatch,
      declared_amount: declaredAmount,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('Error:', err);
    return new Response(JSON.stringify({ error: String(err) }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
