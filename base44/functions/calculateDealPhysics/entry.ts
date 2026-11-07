import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';


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

    const { deal_id, prospect_id, client_id } = await req.json();

    // Get deal and interactions
    const [deal, interactions] = await Promise.all([
      base44.entities.DealScore.get(deal_id),
      base44.entities.ProspectInteraction.filter({ prospect_id })
    ]);

    if (!deal) return Response.json({ error: 'Deal not found' }, { status: 404 });

    // Calculate velocity: interactions per day over last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentInteractions = interactions.filter(i => new Date(i.created_date) > thirtyDaysAgo);
    const velocity = recentInteractions.length / 30;

    // Calculate momentum: is velocity accelerating or decelerating
    const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
    const last15Days = recentInteractions.filter(i => new Date(i.created_date) > fifteenDaysAgo).length / 15;
    const momentum = last15Days > velocity ? 0.5 : last15Days < velocity ? -0.5 : 0;

    // Identify friction points
    const frictionPoints = [];
    if (deal.win_probability < 25) {
      frictionPoints.push({ factor: 'Low win probability', impact: 90 });
    }
    if (recentInteractions.length === 0) {
      frictionPoints.push({ factor: 'No recent activity', impact: 80 });
    }
    if (!deal.reply_detected) {
      frictionPoints.push({ factor: 'No prospect engagement', impact: 70 });
    }

    // Predict close date based on velocity and momentum
    const daysToClose = velocity > 0 ? Math.round(30 / velocity) : 999;
    const predictedClose = new Date(Date.now() + daysToClose * 24 * 60 * 60 * 1000);

    // Determine acceleration stage
    let accelerationStage = 'stalled';
    if (velocity === 0) accelerationStage = 'stalled';
    else if (momentum > 0.3) accelerationStage = 'hyperdrive';
    else if (momentum > 0) accelerationStage = 'accelerating';
    else if (momentum === 0) accelerationStage = 'moderate';
    else accelerationStage = 'slow';

    // Store physics
    const physics = await base44.entities.DealPhysics.create({
      deal_id,
      prospect_id,
      client_id,
      prospect_name: deal.prospect_name,
      velocity,
      momentum,
      friction_points: frictionPoints,
      predicted_close_date: predictedClose.toISOString().split('T')[0],
      close_confidence: Math.min(90, Math.max(20, 50 + (velocity * 10) + (momentum * 20))),
      acceleration_stage: accelerationStage,
      days_at_current_velocity: recentInteractions.length,
      last_calculated: new Date().toISOString()
    });

    return Response.json({
      success: true,
      physics: {
        velocity: velocity.toFixed(2),
        momentum: momentum.toFixed(2),
        stage: accelerationStage,
        predicted_close: predictedClose.toLocaleDateString(),
        confidence: physics.close_confidence
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});