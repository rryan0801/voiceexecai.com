import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { client_id, rep_email } = await req.json();

    // Fetch all relevant data in parallel
    const [dealScores, smsThreads, emailEvents, linkedInSignals] = await Promise.all([
      base44.entities.DealScore.filter({ client_id, recommended_action: { $nin: ['nurture'] } }),
      base44.entities.SMSThread.filter({ status: 'active' }),
      base44.entities.EmailTrackingEvent.filter({ status: 'opened' }),
      base44.entities.LinkedInSignal.filter({ signal_strength: { $in: ['high', 'critical'] } })
    ]);

    // Build action matrix
    const actions = [];

    // High-probability deals needing attention
    dealScores.forEach(deal => {
      if (deal.win_probability >= 75 && deal.recommended_action === 'send_proposal') {
        actions.push({
          type: 'high_value_action',
          prospect: deal.prospect_name,
          action: 'Send Proposal',
          deal_probability: deal.win_probability,
          urgency: 'critical',
          icon: '📄'
        });
      }
      if (deal.win_probability < 25) {
        actions.push({
          type: 'at_risk',
          prospect: deal.prospect_name,
          action: 'Check In',
          deal_probability: deal.win_probability,
          urgency: 'high',
          icon: '⚠️'
        });
      }
    });

    // Recent SMS replies that need responses
    smsThreads.forEach(thread => {
      if (thread.last_message_from === 'prospect') {
        actions.push({
          type: 'engagement',
          prospect: thread.prospect_name,
          action: 'Reply to SMS',
          channel: 'sms',
          urgency: 'high',
          icon: '💬'
        });
      }
    });

    // Email opens without clicks
    emailEvents.forEach(email => {
      if (email.open_count > 0 && email.click_count === 0) {
        actions.push({
          type: 'engagement',
          prospect: email.prospect_email,
          action: 'Follow up - Opened but No Click',
          channel: 'email',
          urgency: 'medium',
          icon: '📧'
        });
      }
    });

    // Critical LinkedIn signals
    linkedInSignals.forEach(signal => {
      if (signal.signal_strength === 'critical') {
        actions.push({
          type: 'signal',
          prospect: signal.prospect_name,
          action: `${signal.signal_type.replace(/_/g, ' ')} - High Intent`,
          urgency: 'critical',
          icon: '🎯'
        });
      }
    });

    // Prioritize and deduplicate
    const uniqueActions = Array.from(
      new Map(actions.map(a => [a.prospect + a.action, a])).values()
    ).sort((a, b) => {
      const urgencyMap = { critical: 3, high: 2, medium: 1 };
      return urgencyMap[b.urgency] - urgencyMap[a.urgency];
    }).slice(0, 10);

    return Response.json({
      actions: uniqueActions,
      total_actions: uniqueActions.length,
      critical_count: uniqueActions.filter(a => a.urgency === 'critical').length,
      summary: `${uniqueActions.length} actions to take right now`
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});