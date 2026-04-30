import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { session_id, latest_sentiment, latest_turn } = await req.json();

    // Get the session to understand context
    const session = await base44.entities.ConversationSession.get(session_id);
    if (!session) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    // Analyze for coaching triggers
    const triggers = [];

    // Check for sentiment drops
    if (session.conversation_flow?.sentiment_trajectory === 'declining') {
      triggers.push({
        type: 'sentiment_shift',
        title: '⚠️ Sentiment Dropping',
        content: 'Prospect sentiment has shifted negative. Consider addressing concerns proactively.',
        suggested_response: 'I sense there may be some concerns. What specific areas would you like to dive deeper on?',
        urgency: 'high'
      });
    }

    // Check for objections
    if (session.extracted_context?.objections_raised?.length > 0) {
      const objection = session.extracted_context.objections_raised[session.extracted_context.objections_raised.length - 1];
      triggers.push({
        type: 'objection_detected',
        title: '🛑 Objection Raised',
        content: `Prospect raised objection: "${objection}". Use your objection playbook.`,
        suggested_response: 'I understand your concern about that. Here\'s how we typically solve this...',
        urgency: 'high'
      });
    }

    // Check for long silence (1+ minute without prospect speaking)
    if (session.conversation_flow?.rep_to_prospect_ratio > 70) {
      triggers.push({
        type: 'silence',
        title: '💬 You\'re Talking Too Much',
        content: 'The prospect hasn\'t spoken much lately. Pause and ask for their input.',
        suggested_response: 'What are your thoughts on this? How does that align with your current setup?',
        urgency: 'medium'
      });
    }

    // Check for positive signals (buying indicators)
    if (session.extracted_context?.deal_signals?.length > 0) {
      triggers.push({
        type: 'positive_signal',
        title: '🎉 Buying Signal Detected!',
        content: 'Prospect just mentioned something positive. This is a good time to move forward.',
        suggested_response: 'I\'m glad that resonates. Shall we move to the next step?',
        urgency: 'high'
      });
    }

    // Check for closing opportunity
    if (session.conversation_flow?.engagement_level > 80 && session.extracted_context?.decision_timeline) {
      triggers.push({
        type: 'closing_opportunity',
        title: '🏁 Closing Moment',
        content: 'Engagement is high and timeline is clear. Time to ask for the deal.',
        suggested_response: 'Perfect. Let\'s get you set up to get started. What\'s the best next step for you?',
        urgency: 'high'
      });
    }

    // Store coaching feedback
    const feedback = [];
    for (const trigger of triggers) {
      const coaching = await base44.entities.CoachingFeedback.create({
        rep_email: session.rep_email,
        client_id: session.client_id,
        session_id,
        trigger_type: trigger.type,
        feedback_title: trigger.title,
        feedback_content: trigger.content,
        suggested_response: trigger.suggested_response,
        urgency: trigger.urgency,
        sentiment_context: latest_sentiment,
        delivered_at: new Date().toISOString()
      });
      feedback.push(coaching);
    }

    return Response.json({
      success: true,
      coaching_delivered: feedback.length,
      triggers: feedback.map(f => ({
        id: f.id,
        title: f.feedback_title,
        urgency: f.urgency,
        suggested_response: f.suggested_response
      }))
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});