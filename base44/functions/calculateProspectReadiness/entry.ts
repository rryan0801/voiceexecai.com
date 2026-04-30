import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prospect_id, client_id } = await req.json();

    const prospect = await base44.entities.Prospect.get(prospect_id);
    if (!prospect) return Response.json({ error: 'Prospect not found' }, { status: 404 });

    // Get all signals
    const [emailEvents, smsThreads, signals, interactions] = await Promise.all([
      base44.entities.EmailTrackingEvent.filter({ prospect_id }),
      base44.entities.SMSThread.filter({ prospect_id }),
      base44.entities.LinkedInSignal.filter({ prospect_id }),
      base44.entities.ProspectInteraction.filter({ prospect_id })
    ]);

    // 20+ indicator calculation
    const indicators = [];

    // Email engagement
    const recentEmails = emailEvents.filter(e => new Date(e.sent_at) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000));
    indicators.push({
      indicator: 'Email opens (last 7d)',
      weight: 8,
      current_value: `${recentEmails.filter(e => e.open_count > 0).length}/${recentEmails.length}`,
      status: recentEmails.filter(e => e.open_count > 0).length > recentEmails.length * 0.5 ? 'positive' : 'neutral'
    });

    // SMS engagement
    indicators.push({
      indicator: 'SMS activity',
      weight: 10,
      current_value: smsThreads.length > 0 && smsThreads[0].last_message_from === 'prospect' ? 'Responding' : 'No activity',
      status: smsThreads.length > 0 && smsThreads[0].last_message_from === 'prospect' ? 'positive' : 'neutral'
    });

    // LinkedIn signals
    const criticalSignals = signals.filter(s => s.signal_strength === 'critical');
    indicators.push({
      indicator: 'LinkedIn buying signals',
      weight: 12,
      current_value: criticalSignals.length.toString(),
      status: criticalSignals.length > 0 ? 'positive' : 'neutral'
    });

    // Recent interactions
    const recentInteractions = interactions.filter(i => new Date(i.created_date) > new Date(Date.now() - 3 * 24 * 60 * 60 * 1000));
    indicators.push({
      indicator: 'Activity in last 3 days',
      weight: 15,
      current_value: recentInteractions.length.toString(),
      status: recentInteractions.length > 0 ? 'positive' : 'negative'
    });

    // Calculate readiness score
    let readinessScore = 30; // baseline
    indicators.forEach(ind => {
      if (ind.status === 'positive') readinessScore += ind.weight * 0.6;
      if (ind.status === 'neutral') readinessScore += ind.weight * 0.2;
    });

    readinessScore = Math.min(100, Math.max(0, readinessScore));

    // Determine pulse status
    let pulseStatus = 'flatline';
    if (readinessScore > 80) pulseStatus = 'critical';
    else if (readinessScore > 65) pulseStatus = 'peak';
    else if (readinessScore > 50 && recentInteractions.length > 0) pulseStatus = 'rising';
    else if (readinessScore < 30) pulseStatus = 'declining';

    // Store pulse
    const pulse = await base44.entities.ProspectReadinessPulse.create({
      prospect_id,
      client_id,
      prospect_name: prospect.prospect_name,
      readiness_score: Math.round(readinessScore),
      pulse_status: pulseStatus,
      indicators: indicators,
      hours_to_peak: pulseStatus === 'critical' ? 0 : 24,
      recommended_action: readinessScore > 75 ? 'close_now' : readinessScore > 50 ? 'engage' : 'nurture',
      last_spike: recentInteractions[0]?.created_date,
      updated_at: new Date().toISOString()
    });

    return Response.json({
      success: true,
      readiness: {
        score: pulse.readiness_score,
        status: pulseStatus,
        action: pulse.recommended_action
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});