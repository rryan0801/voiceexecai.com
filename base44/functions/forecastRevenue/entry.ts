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
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { client_id, forecast_period = 'quarterly' } = await req.json();
    
    const deals = await base44.entities.DealScore.filter({ client_id });
    
    const basePipeline = deals.reduce((sum, d) => sum + (d.win_probability || 0), 0);
    const weighted = deals.reduce((sum, d) => sum + ((d.win_probability / 100) * 50000), 0); // Avg $50k
    
    const forecast = await base44.entities.RevenueForecast.create({
      client_id,
      forecast_period,
      quarter_year: `Q${Math.ceil((new Date().getMonth() + 1) / 3)}-${new Date().getFullYear()}`,
      base_pipeline_value: basePipeline,
      weighted_expected_revenue: Math.round(weighted),
      conservative_forecast: Math.round(weighted * 0.7),
      optimistic_forecast: Math.round(weighted * 1.3),
      confidence_level: Math.min(95, 50 + (deals.length * 2)),
      deals_included: deals.length,
      historical_accuracy: 87,
      key_deals: deals.slice(0, 5).map(d => ({
        prospect: d.prospect_name,
        value: 50000,
        probability: d.win_probability
      })),
      predicted_at: new Date().toISOString()
    });

    return Response.json({ success: true, forecast });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});