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
    const { client_id, command_id, request_type } = await req.json();

    if (!client_id || !request_type) {
      return Response.json({ error: 'client_id and request_type required' }, { status: 400 });
    }

    // Get current month in YYYY-MM-01 format
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    // Find or create usage meter for this month
    const existingMeters = await base44.asServiceRole.entities.UsageMeter.filter({
      client_id,
      month
    });

    let usageMeter;
    const updateData = {
      total_requests: 0,
      [request_type]: 1
    };

    if (existingMeters && existingMeters.length > 0) {
      usageMeter = existingMeters[0];
      
      // Increment counters
      const currentCount = usageMeter[request_type] || 0;
      updateData[request_type] = currentCount + 1;
      updateData.total_requests = (usageMeter.total_requests || 0) + 1;
      
      await base44.asServiceRole.entities.UsageMeter.update(usageMeter.id, updateData);
    } else {
      // Create new usage meter
      updateData.client_id = client_id;
      updateData.month = month;
      updateData.total_requests = 1;
      
      usageMeter = await base44.asServiceRole.entities.UsageMeter.create(updateData);
    }

    // Check if client has exceeded monthly quota
    const client = await base44.asServiceRole.entities.Client.get(client_id);
    const currentUsage = usageMeter.total_requests;
    const monthlyQuota = client.monthly_quota || 10000;

    return Response.json({
      success: true,
      usage: {
        current_month: month,
        total_requests_this_month: currentUsage,
        monthly_quota: monthlyQuota,
        quota_exceeded: currentUsage > monthlyQuota,
        requests_remaining: Math.max(0, monthlyQuota - currentUsage)
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});