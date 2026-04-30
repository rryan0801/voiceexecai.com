import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import { subDays } from 'npm:date-fns@3.6.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { client_id } = await req.json();

    if (!client_id) {
      return Response.json({ error: 'client_id required' }, { status: 400 });
    }

    // Fetch all prospects for this client
    const prospects = await base44.asServiceRole.entities.Prospect.filter(
      { client_id },
      '-updated_date',
      500
    );

    const sevenDaysAgo = subDays(new Date(), 7);
    const scores = [];

    for (const prospect of prospects) {
      // Get all interactions for this prospect
      const interactions = await base44.asServiceRole.entities.ProspectInteraction.filter(
        { prospect_id: prospect.id },
        '-created_date',
        100
      );

      // Get all AutoPilot sequences for this prospect
      const sequences = await base44.asServiceRole.entities.FollowUpSequence.filter(
        { prospect_id: prospect.id },
        '-created_date',
        100
      );

      // Calculate interaction score (0-30 points)
      const interactionScore = Math.min(interactions.length * 3, 30);

      // Calculate recency score (0-25 points) - boost if activity in last 7 days
      let recencyScore = 0;
      const recentInteractions = interactions.filter(
        i => new Date(i.created_date) > sevenDaysAgo
      );
      if (recentInteractions.length > 0) {
        recencyScore = Math.min(recentInteractions.length * 5, 25);
      }

      // Calculate AutoPilot progress score (0-25 points)
      let autopilotScore = 0;
      let totalAutopilotSteps = 0;
      let completedAutopilotSteps = 0;
      sequences.forEach(seq => {
        if (seq.status === 'active' || seq.status === 'paused') {
          totalAutopilotSteps += seq.total_steps || 0;
          completedAutopilotSteps += seq.completed_steps || 0;
        }
      });
      if (totalAutopilotSteps > 0) {
        const autopilotProgress = (completedAutopilotSteps / totalAutopilotSteps) * 100;
        autopilotScore = Math.min((autopilotProgress / 100) * 25, 25);
      }

      // Calculate engagement score (0-20 points) - bonus for replies or active sequences
      let engagementScore = 0;
      const activeSequences = sequences.filter(s => s.status === 'active').length;
      const replyDetected = sequences.some(s => s.reply_detected);

      if (replyDetected) engagementScore += 10;
      if (activeSequences > 0) engagementScore += 10;
      engagementScore = Math.min(engagementScore, 20);

      // Total win probability (0-100)
      const winProbability = Math.round(
        interactionScore + recencyScore + autopilotScore + engagementScore
      );

      // Determine recommended action
      let recommendedAction = 'nurture';
      const hasActiveSequence = sequences.some(s => s.status === 'active');
      const daysSinceLastInteraction = prospect.last_interaction_date
        ? Math.floor(
            (new Date() - new Date(prospect.last_interaction_date)) / (1000 * 60 * 60 * 24)
          )
        : 999;

      if (replyDetected && !hasActiveSequence) {
        recommendedAction = 'schedule_call';
      } else if (winProbability > 60 && daysSinceLastInteraction > 3) {
        recommendedAction = 'send_email';
      } else if (winProbability > 75 && daysSinceLastInteraction > 7) {
        recommendedAction = 'schedule_call';
      } else if (winProbability > 40 && daysSinceLastInteraction < 3) {
        recommendedAction = 'send_proposal';
      } else if (!hasActiveSequence && daysSinceLastInteraction > 5) {
        recommendedAction = 'check_in';
      }

      // Create or update DealScore
      const existingScores = await base44.asServiceRole.entities.DealScore.filter(
        { prospect_id: prospect.id },
        '-created_date',
        1
      );

      const scoreData = {
        prospect_id: prospect.id,
        client_id,
        prospect_name: prospect.prospect_name,
        company_name: prospect.company_name,
        win_probability: winProbability,
        interaction_count: interactions.length,
        recency_boost: recentInteractions.length,
        autopilot_progress: totalAutopilotSteps > 0
          ? Math.round((completedAutopilotSteps / totalAutopilotSteps) * 100)
          : 0,
        reply_detected: replyDetected,
        last_interaction_date: prospect.last_interaction_date,
        recommended_action: recommendedAction,
        score_factors: {
          interaction_score: interactionScore,
          recency_score: recencyScore,
          autopilot_score: autopilotScore,
          engagement_score: engagementScore
        },
        calculated_at: new Date().toISOString()
      };

      if (existingScores.length > 0) {
        await base44.asServiceRole.entities.DealScore.update(
          existingScores[0].id,
          scoreData
        );
      } else {
        await base44.asServiceRole.entities.DealScore.create(scoreData);
      }

      scores.push(scoreData);
    }

    return Response.json({
      success: true,
      client_id,
      scores_calculated: scores.length,
      top_deals: scores.sort((a, b) => b.win_probability - a.win_probability).slice(0, 5)
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});