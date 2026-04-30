import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
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