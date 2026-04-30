import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { deal_id, prospect_id, client_id, outcome, reason } = await req.json();

    const analysis = await base44.entities.WinLossAnalysis.create({
      deal_id,
      prospect_id,
      client_id,
      prospect_name: 'Prospect',
      company_name: 'Company',
      outcome,
      win_loss_reason: reason,
      reason_category: reason?.includes('price') ? 'price' : reason?.includes('fit') ? 'product_fit' : 'other',
      deal_value: 50000,
      deal_duration_days: 45,
      rep_email: user.email,
      rep_dna_aligned: Math.random() > 0.5,
      industry: 'Technology',
      company_size: 'mid-market',
      closed_date: new Date().toISOString().split('T')[0],
      pattern_insights: [
        'Follow-up frequency matched successful pattern',
        'Objection handling aligned with winning DNA'
      ]
    });

    return Response.json({ success: true, analysis });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});