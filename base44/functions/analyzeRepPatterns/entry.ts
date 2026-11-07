import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Anthropic from 'npm:@anthropic-ai/sdk@0.39.0';

const anthropic = new Anthropic({ apiKey: Deno.env.get('CLAUDE_API_KEY') });


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
    const { rep_email, client_id } = await req.json();

    if (!rep_email || !client_id) {
      return Response.json({ error: 'rep_email and client_id required' }, { status: 400 });
    }

    // Get all commands from this rep
    const commands = await base44.asServiceRole.entities.Command.filter(
      { client_id, created_by: rep_email },
      '-created_date',
      100
    );

    if (commands.length === 0) {
      return Response.json({ patterns: [], message: 'No commands found for this rep' });
    }

    // Extract successful email/call patterns
    const successfulCommands = commands.filter(c => c.status === 'completed' && c.execution_result);
    const emailCommands = successfulCommands.filter(c => c.detected_intent === 'send_email');

    const emailBodies = emailCommands
      .map(c => c.execution_result?.body || '')
      .filter(b => b)
      .join('\n---\n');

    if (!emailBodies) {
      return Response.json({ patterns: [], message: 'No email patterns to analyze' });
    }

    const prompt = `Analyze these successful sales emails and identify patterns that drive closes.
    
Emails:
${emailBodies}

Return JSON with:
{
  "closing_phrases": [{"phrase": "...", "frequency": 3, "success_indicator": "..."}, ...],
  "opening_approaches": [{"approach": "...", "frequency": 2}, ...],
  "keywords": [{"keyword": "ROI", "frequency": 5, "impact": "high"}, ...],
  "tone_characteristics": {"formality": "semi-formal", "urgency": "moderate", ...},
  "overall_recommendation": "What this rep should do more of"
}`;

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    });

    let patterns;
    try {
      const jsonMatch = message.content[0].text.match(/\{[\s\S]*\}/);
      patterns = JSON.parse(jsonMatch ? jsonMatch[0] : message.content[0].text);
    } catch {
      patterns = { error: 'Could not parse patterns', raw: message.content[0].text };
    }

    return Response.json({ success: true, rep_email, patterns });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});