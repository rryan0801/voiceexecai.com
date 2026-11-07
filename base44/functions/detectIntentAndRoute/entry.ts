import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY');


// ---- Access gates (audit 2026-11-07, second pass) ----
async function __me(req) {
  try { return await createClientFromRequest(req).auth.me(); } catch (_e) { return null; }
}
async function __gateAdmin(req) {
  const u = await __me(req);
  if (!u) return Response.json({ error: 'Please sign in.' }, { status: 401 });
  if (u.role !== 'admin') return Response.json({ error: 'Admins only.' }, { status: 403 });
  return null;
}
async function __gateUser(req) {
  const u = await __me(req);
  if (!u) return Response.json({ error: 'Please sign in.' }, { status: 401 });
  return null;
}
async function __gatePaid(req) {
  const u = await __me(req);
  if (!u) return Response.json({ error: 'Please sign in.' }, { status: 401 });
  if (u.role === 'admin') return null;
  const email = String(u.email || '').toLowerCase();
  try {
    const subs = await createClientFromRequest(req).asServiceRole.entities.Subscription.filter({ user_email: email });
    if (subs.some((s) => ['active', 'past_due'].includes(s.status))) return null;
  } catch (_e) { /* fall through */ }
  try {
    const key = Deno.env.get('STRIPE_SECRET_KEY');
    if (key) {
      const h = { Authorization: `Bearer ${key}` };
      const c = await (await fetch(`https://api.stripe.com/v1/customers?email=${encodeURIComponent(email)}&limit=3`, { headers: h })).json();
      for (const cu of c?.data || []) {
        const s = await (await fetch(`https://api.stripe.com/v1/subscriptions?customer=${cu.id}&status=active&limit=1`, { headers: h })).json();
        if ((s?.data || []).length > 0) return null;
      }
    }
  } catch (_e) { /* not subscribed */ }
  return Response.json({ error: 'A paid plan is needed. See voiceexecai.com/pricing.', needs_plan: true }, { status: 402 });
}

Deno.serve(async (req) => {
  { const __denied = await __gateAdmin(req); if (__denied) return __denied; } // audit 2026-11-07, second pass

  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { voice_command, user_crm_type, user_email } = await req.json();

    if (!voice_command) {
      return Response.json({ error: 'Missing voice_command' }, { status: 400 });
    }

    // Use Claude to detect intent and extract parameters
    const detectionPrompt = `Analyze this voice command and extract intent + parameters.

Voice Command: "${voice_command}"

Respond ONLY with valid JSON (no markdown, no code blocks):
{
  "intent": "create_crm_deal|log_crm_activity|send_sms|send_slack|send_teams|send_email|update_deal_status|other",
  "confidence": 0.0-1.0,
  "crm_type": "salesforce|pipedrive|hubspot|other|null",
  "channel_type": "sms|slack|teams|email|whatsapp|null",
  "extracted_params": {
    "company_name": "string|null",
    "prospect_name": "string|null",
    "contact_email": "string|null",
    "phone_number": "string|null",
    "opportunity_name": "string|null",
    "deal_value": "number|null",
    "message_text": "string|null",
    "recipient": "string|null",
    "action_type": "string|null"
  },
  "reasoning": "brief explanation"
}`;

    const detectionRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        messages: [{ role: 'user', content: detectionPrompt }]
      })
    });

    const detectionData = await detectionRes.json();
    const responseText = detectionData.content[0].text;

    // Parse Claude's JSON response
    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch (e) {
      // Try to extract JSON if Claude returned markdown
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    }

    if (!parsed || parsed.confidence < 0.6) {
      return Response.json({
        success: false,
        error: 'Could not understand command with confidence',
        reasoning: parsed?.reasoning || 'Low confidence detection'
      }, { status: 400 });
    }

    // Route to appropriate handler
    let result;
    const { intent, extracted_params } = parsed;

    if (intent === 'create_crm_deal') {
      result = await base44.asServiceRole.functions.invoke('crmRouter', {
        crm_type: user_crm_type || parsed.crm_type,
        action: 'create_deal',
        ...extracted_params
      });
    } else if (intent === 'log_crm_activity') {
      result = await base44.asServiceRole.functions.invoke('crmRouter', {
        crm_type: user_crm_type || parsed.crm_type,
        action: 'log_activity',
        ...extracted_params
      });
    } else if (intent === 'update_deal_status') {
      result = await base44.asServiceRole.functions.invoke('crmRouter', {
        crm_type: user_crm_type || parsed.crm_type,
        action: 'update_status',
        ...extracted_params
      });
    } else if (['send_sms', 'send_slack', 'send_teams', 'send_email'].includes(intent)) {
      result = await base44.asServiceRole.functions.invoke('commsRouter', {
        channel_type: parsed.channel_type || intent.replace('send_', ''),
        message: extracted_params.message_text,
        ...extracted_params
      });
    } else {
      return Response.json({
        success: false,
        error: `Unknown intent: ${intent}`
      }, { status: 400 });
    }

    return Response.json({
      success: true,
      intent,
      confidence: parsed.confidence,
      reasoning: parsed.reasoning,
      result: result.data || result,
      original_command: voice_command
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});