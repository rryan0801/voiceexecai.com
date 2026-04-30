import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { deal_id, prospect_id, client_id } = await req.json();

    if (!deal_id || !prospect_id || !client_id) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get deal score and conversation history
    const scores = await base44.entities.DealScore.filter(
      { id: deal_id },
      '-created_date',
      1
    );

    if (!scores || scores.length === 0) {
      return Response.json({ error: 'Deal not found' }, { status: 404 });
    }

    const score = scores[0];

    // Get conversation thread for signals
    const threadRes = await base44.functions.invoke('getConversationThread', {
      prospect_id,
      client_id
    });

    const thread = threadRes.data?.thread;

    // Get prospect context
    const prospects = await base44.entities.Prospect.filter(
      { id: prospect_id },
      '-created_date',
      1
    );

    const prospect = prospects?.[0];

    // Build data for AI prediction
    const interactionData = {
      interaction_count: score.interaction_count,
      recency_boost: score.recency_boost,
      autopilot_progress: score.autopilot_progress,
      reply_detected: score.reply_detected,
      last_interaction: score.last_interaction_date
    };

    const conversationSignals = {
      total_turns: thread?.total_turns || 0,
      sentiment_trajectory: thread?.sessions?.[0]?.sentiment_trajectory,
      deal_signals: thread?.sessions?.[0]?.deal_signals || [],
      pain_points: thread?.sessions?.[0]?.extraction_context?.pain_points || []
    };

    // Use Claude to predict outcome
    const prompt = `Analyze this sales deal and predict the win probability.

Deal Information:
- Prospect: ${prospect?.prospect_name}
- Company: ${prospect?.company_name}
- Current Win Score: ${score.win_probability}%
- Interactions: ${interactionData.interaction_count}
- Recent Activity Boost: ${interactionData.recency_boost}
- AutoPilot Progress: ${interactionData.autopilot_progress}%
- Reply Detected: ${interactionData.reply_detected}

Conversation Signals:
- Total Discussion Turns: ${conversationSignals.total_turns}
- Sentiment Trend: ${conversationSignals.sentiment_trajectory}
- Deal Signals Found: ${conversationSignals.deal_signals.join(', ') || 'None'}
- Pain Points Identified: ${conversationSignals.pain_points.join(', ') || 'None'}

Provide a detailed prediction with:
1. Win probability (0-100)
2. Confidence score (0-1)
3. Top 3 key drivers (factor, impact, evidence)
4. Risk factors
5. Next best action to increase win probability
6. Recommended close timeline

Return as JSON.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          win_prediction: { type: 'number' },
          confidence_score: { type: 'number' },
          key_drivers: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                factor: { type: 'string' },
                impact: { type: 'number' },
                evidence: { type: 'string' }
              }
            }
          },
          risk_factors: {
            type: 'array',
            items: { type: 'string' }
          },
          next_best_action: { type: 'string' },
          recommended_timeline: { type: 'string' }
        }
      }
    });

    // Save prediction
    const prediction = await base44.entities.PredictionModel.create({
      deal_id,
      prospect_id,
      client_id,
      prospect_name: prospect?.prospect_name,
      ...response,
      predicted_at: new Date().toISOString()
    });

    return Response.json({
      success: true,
      prediction
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});