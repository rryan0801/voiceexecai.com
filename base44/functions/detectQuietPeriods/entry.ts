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

    const { client_id } = await req.json();

    // Get all prospects
    const prospects = await base44.entities.Prospect.filter({ client_id });

    const alerts = [];

    for (const prospect of prospects) {
      // Check all activity channels
      const [emails, sms, signals, interactions] = await Promise.all([
        base44.entities.EmailTrackingEvent.filter({ prospect_id: prospect.id }),
        base44.entities.SMSThread.filter({ prospect_id: prospect.id }),
        base44.entities.LinkedInSignal.filter({ prospect_id: prospect.id }),
        base44.entities.ProspectInteraction.filter({ prospect_id: prospect.id })
      ]);

      // Find last activity across all channels
      const lastEmail = emails[0]?.sent_at;
      const lastSMS = sms[0]?.last_message_at;
      const lastSignal = signals[0]?.occurred_at;
      const lastInteraction = interactions[0]?.created_date;

      const lastActivity = [lastEmail, lastSMS, lastSignal, lastInteraction]
        .filter(d => d)
        .map(d => new Date(d))
        .sort((a, b) => b - a)[0];

      if (lastActivity) {
        const daysSilent = Math.floor((Date.now() - lastActivity.getTime()) / (24 * 60 * 60 * 1000));

        if (daysSilent >= 5) {
          // Determine which channels are silent
          const channelsSilent = [];
          if (!lastEmail || daysSilent > 7) channelsSilent.push('email');
          if (!lastSMS || daysSilent > 7) channelsSilent.push('sms');
          if (!lastSignal || daysSilent > 5) channelsSilent.push('linkedin');

          alerts.push({
            prospect_id: prospect.id,
            prospect_name: prospect.prospect_name,
            silence_duration_days: daysSilent,
            channels_silent: channelsSilent.length > 0 ? channelsSilent : ['all'],
            alert_level: daysSilent > 14 ? 'critical' : 'warning',
            last_activity_type: lastInteraction ? 'interaction' : 'email'
          });
        }
      }
    }

    // Store alerts
    for (const alert of alerts) {
      try {
        await base44.entities.QuietPeriodAlert.create({
          prospect_id: alert.prospect_id,
          client_id,
          prospect_name: alert.prospect_name,
          rep_email: user.email,
          silence_started_at: new Date(Date.now() - alert.silence_duration_days * 24 * 60 * 60 * 1000).toISOString(),
          silence_duration_days: alert.silence_duration_days,
          channels_silent: alert.channels_silent,
          alert_level: alert.alert_level,
          created_at: new Date().toISOString()
        });
      } catch (e) {
        // Silently skip if alert already exists
      }
    }

    return Response.json({
      success: true,
      alerts_created: alerts.length,
      critical_count: alerts.filter(a => a.alert_level === 'critical').length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});