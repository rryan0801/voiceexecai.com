// Priority #4: Internal task creation
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
  { const __denied = await __gateUser(req); if (__denied) return __denied; } // audit 2026-11-07, second pass

  try {
    const base44 = createClientFromRequest(req);
    const { client_id, prospect_id, command_id, title, description, due_date, priority, assigned_to } = await req.json();

    if (!client_id || !title) {
      return Response.json({ error: 'client_id and title required' }, { status: 400 });
    }

    const task = await base44.entities.Task.create({
      client_id,
      prospect_id: prospect_id || null,
      command_id: command_id || null,
      title,
      description: description || '',
      due_date: due_date || null,
      priority: priority || 'medium',
      assigned_to: assigned_to || null,
      status: 'pending'
    });

    return Response.json({ success: true, task_id: task.id, task });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});