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

    const { deal_title, company_name, deal_value, contact_name, contact_email, pipedrive_api_key } = await req.json();

    if (!deal_title || !pipedrive_api_key) {
      return Response.json({ error: 'Missing required fields: deal_title, pipedrive_api_key' }, { status: 400 });
    }

    // Step 1: Find or create organization
    const orgRes = await fetch(`https://api.pipedrive.com/v1/organizations/search?term=${encodeURIComponent(company_name)}&api_token=${pipedrive_api_key}`);
    const orgData = await orgRes.json();

    let orgId;
    if (orgData.data?.items?.length > 0) {
      orgId = orgData.data.items[0].id;
    } else {
      // Create new organization
      const createOrgRes = await fetch(
        `https://api.pipedrive.com/v1/organizations?api_token=${pipedrive_api_key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name: company_name })
        }
      );
      const newOrg = await createOrgRes.json();
      orgId = newOrg.data.id;
    }

    // Step 2: Create deal
    const dealRes = await fetch(
      `https://api.pipedrive.com/v1/deals?api_token=${pipedrive_api_key}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: deal_title,
          org_id: orgId,
          value: deal_value || 0,
          currency: 'USD',
          status: 'open'
        })
      }
    );

    const deal = await dealRes.json();

    if (!deal.success) {
      return Response.json({ error: 'Failed to create deal', details: deal }, { status: 400 });
    }

    // Step 3: Create person if contact provided
    if (contact_name) {
      await fetch(
        `https://api.pipedrive.com/v1/persons?api_token=${pipedrive_api_key}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: contact_name,
            email: contact_email,
            org_id: orgId
          })
        }
      );
    }

    return Response.json({
      success: true,
      deal_id: deal.data.id,
      org_id: orgId,
      message: `Deal "${deal_title}" created for ${company_name}`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});