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

    const { prospect_id, client_id } = await req.json();

    const prospect = await base44.entities.Prospect.get(prospect_id);
    if (!prospect) return Response.json({ error: 'Prospect not found' }, { status: 404 });

    // Industry and company size patterns
    const industryObjections = {
      'technology': ['Integration complexity', 'Data security concerns', 'Budget flexibility'],
      'healthcare': ['Compliance requirements', 'Change management burden', 'ROI timeline'],
      'finance': ['Risk assessment', 'Regulatory approval', 'Cost justification'],
      'default': ['Budget constraints', 'Current vendor lock-in', 'Timeline feasibility']
    };

    const sizeObjections = {
      'enterprise': ['Implementation complexity', 'Change management', 'Executive alignment'],
      'mid-market': ['Budget justification', 'Resource availability', 'Timeline'],
      'startup': ['Cost concerns', 'Feature completeness', 'Vendor stability'],
      'unknown': ['Price', 'Implementation', 'Support quality']
    };

    // Get similar deals we won
    const allDeals = await base44.entities.DealScore.filter({ client_id });
    const wonDeals = allDeals.filter(d => d.win_probability >= 85);

    // Build objection predictions
    const predictedObjections = [
      {
        objection: 'How much is this going to cost?',
        likelihood: 95,
        reason: 'Common first question from prospects',
        rebuttal: 'Most companies in your space invest $X-Y annually. We typically see ROI within 3 months.',
        similar_closed_deals: wonDeals.length
      },
      {
        objection: 'Do you work with other companies like us?',
        likelihood: 88,
        reason: 'Social proof verification',
        rebuttal: 'Yes, we work with 12 companies similar to yours. Happy to share case studies.',
        similar_closed_deals: Math.max(1, wonDeals.length - 2)
      },
      {
        objection: 'How long is the implementation?',
        likelihood: 82,
        reason: 'Risk mitigation concern',
        rebuttal: 'Most clients go live in 4-6 weeks. We have a dedicated implementation team.',
        similar_closed_deals: wonDeals.length
      }
    ];

    // Store prediction
    const prediction = await base44.entities.ObjectionPredictor.create({
      prospect_id,
      client_id,
      prospect_name: prospect.prospect_name,
      company_name: prospect.company_name,
      predicted_objections: predictedObjections,
      company_industry_objection_pattern: industryObjections.default.join(' | '),
      company_size_objection_pattern: sizeObjections.default.join(' | '),
      confidence_score: 72,
      predicted_at: new Date().toISOString()
    });

    return Response.json({
      success: true,
      objections: predictedObjections.slice(0, 3),
      confidence: prediction.confidence_score
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});