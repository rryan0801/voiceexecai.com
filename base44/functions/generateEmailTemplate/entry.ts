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

    const { rep_email, prospect_id, prospect_name, client_id, template_type } = await req.json();

    // Get rep DNA for tone
    const dnaRecords = await base44.entities.RepConversationDNA.filter({ rep_email });
    const dna = dnaRecords[0];

    const templates = {
      initial_outreach: {
        subject: `Quick thought on how we could help ${prospect_name}`,
        body: `Hi there,\n\nI was thinking about ${prospect_name} and wanted to reach out. Given what I know about your focus on ${template_type}, I thought we might be able to help.\n\nWould be great to grab 15 minutes to explore?\n\nBest,\n[Rep Name]`
      },
      follow_up: {
        subject: `Following up on our conversation`,
        body: `Hi ${prospect_name},\n\nJust wanted to circle back on what we discussed. I think there's real potential here.\n\nDoes next week work for a quick call?\n\nThanks`
      }
    };

    const template = templates[template_type] || templates.initial_outreach;

    const emailTemplate = await base44.entities.EmailTemplate.create({
      client_id,
      rep_email,
      prospect_id,
      prospect_name,
      template_type,
      subject: template.subject,
      body: template.body,
      tone: dna?.tone_signature?.formality || 'conversational',
      personalization_factors: [`Prospect name: ${prospect_name}`, 'Industry context', 'Recent activity'],
      inspired_by_rep_dna: dna?.winning_phrases?.map(p => p.phrase) || [],
      generated_at: new Date().toISOString()
    });

    return Response.json({ success: true, template: emailTemplate });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});