import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { insight_type, prospect_id, client_id, channels } = await req.json();

    if (!insight_type || !prospect_id || !client_id) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get prospect and prediction data
    const prospects = await base44.entities.Prospect.filter(
      { id: prospect_id },
      '-created_date',
      1
    );

    if (!prospects || prospects.length === 0) {
      return Response.json({ error: 'Prospect not found' }, { status: 404 });
    }

    const prospect = prospects[0];

    // Get latest prediction
    const predictions = await base44.entities.PredictionModel.filter(
      { prospect_id },
      '-predicted_at',
      1
    );

    const prediction = predictions?.[0];

    // Get rep patterns for coaching
    const patterns = await base44.entities.RepPattern.filter(
      { rep_email: user.email },
      '-success_rate',
      10
    );

    // Build insight message
    let insightMessage = '';

    if (insight_type === 'coaching') {
      insightMessage = buildCoachingInsight(prospect, prediction, patterns, user.full_name);
    } else if (insight_type === 'deal_update') {
      insightMessage = buildDealUpdate(prospect, prediction, user.full_name);
    } else if (insight_type === 'objection_handling') {
      insightMessage = buildObjectionInsight(prospect, prediction, user.full_name);
    }

    // Share to channels
    const targetChannels = channels || ['slack', 'teams'];
    const shareResults = {};

    if (targetChannels.includes('slack')) {
      try {
        const slackRes = await base44.functions.invoke('sendSlackMessage', {
          channel: 'sales-insights',
          message: insightMessage,
          blocks: buildSlackBlocks(prospect, prediction, insight_type)
        });
        shareResults.slack = { success: true, response: slackRes.data };
      } catch (e) {
        shareResults.slack = { success: false, error: e.message };
      }
    }

    if (targetChannels.includes('teams')) {
      try {
        const teamsRes = await base44.functions.invoke('sendTeamsMessage', {
          webhook_url: 'teams_webhook',
          title: `${insight_type.replace(/_/g, ' ')} - ${prospect.prospect_name}`,
          message: insightMessage
        });
        shareResults.teams = { success: true, response: teamsRes.data };
      } catch (e) {
        shareResults.teams = { success: false, error: e.message };
      }
    }

    if (targetChannels.includes('email')) {
      try {
        const emailRes = await base44.functions.invoke('sendEmailViaOutlook', {
          to: 'sales-team@company.com',
          subject: `${insight_type.replace(/_/g, ' ')}: ${prospect.prospect_name}`,
          body: insightMessage
        });
        shareResults.email = { success: true, response: emailRes.data };
      } catch (e) {
        shareResults.email = { success: false, error: e.message };
      }
    }

    return Response.json({
      success: true,
      insight_type,
      prospect_name: prospect.prospect_name,
      share_results: shareResults
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function buildCoachingInsight(prospect, prediction, patterns, repName) {
  return `🎯 Coaching Tip for ${repName}

Deal: ${prospect.prospect_name} @ ${prospect.company_name}
Win Probability: ${prediction?.win_prediction || 'N/A'}%

Key Focus:
${prediction?.next_best_action || 'No specific action yet'}

Your Winning Patterns:
${patterns.slice(0, 3).map(p => `• ${p.pattern_value} (${p.success_rate}% success)`).join('\n')}

Risks to Watch:
${prediction?.risk_factors?.slice(0, 2).map(r => `• ${r}`).join('\n') || '• Monitor response time'}`;
}

function buildDealUpdate(prospect, prediction, repName) {
  return `📊 Deal Update: ${prospect.prospect_name}

Current Status: ${estimateStage(prediction?.win_prediction)} 
Win Probability: ${prediction?.win_prediction || 'Pending'}%
Confidence: ${prediction?.confidence_score ? Math.round(prediction.confidence_score * 100) : 'N/A'}%

Key Drivers:
${prediction?.key_drivers?.slice(0, 3).map(d => `• ${d.factor}: ${d.evidence}`).join('\n') || '• Gathering insights'}

Recommended Next: ${prediction?.next_best_action || 'Continue engagement'}`;
}

function buildObjectionInsight(prospect, prediction, repName) {
  return `🛡️ Objection Handling Guide: ${prospect.prospect_name}

Common Objections for Similar Deals:
${prediction?.risk_factors?.slice(0, 3).map(r => `• ${r}`).join('\n') || '• Monitor for concerns'}

Recommended Responses:
• Focus on ROI and business impact
• Address timeline concerns early
• Emphasize customer success stories`;
}

function buildSlackBlocks(prospect, prediction, type) {
  return [
    {
      type: 'section',
      text: {
        type: 'mrkdwn',
        text: `*${type.toUpperCase()}: ${prospect.prospect_name}*\nWin Probability: ${prediction?.win_prediction || 'N/A'}%`
      }
    }
  ];
}

function estimateStage(probability) {
  if (probability >= 75) return 'Negotiation';
  if (probability >= 50) return 'Proposal';
  if (probability >= 25) return 'Qualification';
  return 'Prospecting';
}