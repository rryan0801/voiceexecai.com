import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

// ---- Paid-plan gate (audit 2026-11-07). Server-side only: reads the admin-only
// Subscription record written by stripeWebhook; falls back to a live Stripe lookup
// for subscribers from before that record existed. Admins always pass.
async function requirePaidPlan(base44) {
  let user = null;
  try { user = await base44.auth.me(); } catch (_e) { user = null; }
  if (!user) return Response.json({ error: 'Please sign in.' }, { status: 401 });
  if (user.role === 'admin') return null;
  const email = String(user.email || '').toLowerCase();
  const ACTIVE = ['active', 'past_due'];
  try {
    const subs = await base44.asServiceRole.entities.Subscription.filter({ user_email: email });
    if (subs.some((s) => ACTIVE.includes(s.status))) return null;
  } catch (_e) { /* fall through to Stripe */ }
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
  } catch (_e) { /* treat as not subscribed */ }
  return Response.json({ error: 'A paid plan is needed for voice commands. See voiceexecai.com/pricing.', needs_plan: true }, { status: 402 });
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
  { const denied = await requirePaidPlan(base44); if (denied) return denied; }
    const { client_id, audio_url, context } = await req.json();

    if (!client_id || !audio_url) {
      return Response.json({ error: 'client_id and audio_url required' }, { status: 400 });
    }

    // Create initial command record
    const command = await base44.asServiceRole.entities.Command.create({
      client_id,
      audio_url,
      context: context || {},
      status: 'pending',
      streaming_output: []
    });

    return Response.json({
      success: true,
      command_id: command.id,
      status: 'created'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});