import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY');

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { session_id } = await req.json();

    if (!session_id) {
      return Response.json({ error: 'Missing session_id' }, { status: 400 });
    }

    // Fetch full conversation session
    const sessions = await base44.entities.ConversationSession.filter(
      { id: session_id },
      '-created_date',
      1
    );

    if (!sessions || sessions.length === 0) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    const session = sessions[0];
    const turns = session.conversation_turns || [];

    // Build conversation transcript
    const transcript = turns.map(t => `${t.speaker === 'rep' ? 'Rep' : t.speaker === 'prospect' ? 'Prospect' : 'System'}: ${t.message}`).join('\n');

    const analysisPrompt = `Analyze this multi-turn conversation and provide structured insights.

CONVERSATION:
${transcript}

Respond ONLY with valid JSON (no markdown):
{
  "opening_sentiment": "positive|neutral|negative",
  "closing_sentiment": "positive|neutral|negative",
  "sentiment_trajectory": "improving|declining|stable|volatile",
  "engagement_level": 0-100,
  "rep_to_prospect_ratio": 0-100,
  "conversation_depth": number_of_distinct_topics,
  "main_topics": ["topic1", "topic2"],
  "pain_points": ["pain1", "pain2"],
  "deal_signals": ["signal1", "signal2"],
  "objections": ["objection1", "objection2"],
  "next_steps": ["step1", "step2"],
  "decision_timeline": "immediate|week|month|quarter",
  "conversation_quality": 0-100,
  "strengths": ["strength1"],
  "areas_for_improvement": ["area1"]
}`;

    const analysisRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1500,
        messages: [{ role: 'user', content: analysisPrompt }]
      })
    });

    const analysisData = await analysisRes.json();
    const responseText = analysisData.content[0].text;

    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch (e) {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    }

    if (!parsed) {
      return Response.json({ error: 'Failed to parse analysis' }, { status: 500 });
    }

    // Update session with analysis
    await base44.entities.ConversationSession.update(session_id, {
      conversation_flow: {
        opening_sentiment: parsed.opening_sentiment,
        closing_sentiment: parsed.closing_sentiment,
        sentiment_trajectory: parsed.sentiment_trajectory,
        engagement_level: parsed.engagement_level,
        rep_to_prospect_ratio: parsed.rep_to_prospect_ratio,
        conversation_depth: parsed.conversation_depth
      },
      extracted_context: {
        main_topics: parsed.main_topics,
        pain_points: parsed.pain_points,
        deal_signals: parsed.deal_signals,
        objections_raised: parsed.objections,
        next_steps: parsed.next_steps,
        decision_timeline: parsed.decision_timeline
      }
    });

    return Response.json({
      success: true,
      analysis: parsed
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});