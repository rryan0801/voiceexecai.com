import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prospect_id, client_id } = await req.json();

    if (!prospect_id || !client_id) {
      return Response.json({ error: 'Missing prospect_id or client_id' }, { status: 400 });
    }

    // Get all sessions for this prospect
    const sessions = await base44.entities.ConversationSession.filter(
      {
        prospect_id,
        client_id
      },
      '-created_date',
      100
    );

    if (!sessions || sessions.length === 0) {
      return Response.json({
        success: true,
        thread: {
          prospect_id,
          total_sessions: 0,
          sessions: [],
          conversation_history: []
        }
      });
    }

    // Build conversation history across all sessions
    const conversationHistory = [];
    const sessionsData = [];

    for (const session of sessions) {
      const turns = session.conversation_turns || [];
      turns.forEach(turn => {
        conversationHistory.push({
          session_id: session.id,
          channel: session.channel,
          ...turn
        });
      });

      sessionsData.push({
        session_id: session.id,
        channel: session.channel,
        status: session.session_status,
        turns: turns.length,
        started_at: session.started_at,
        ended_at: session.ended_at,
        sentiment_trajectory: session.conversation_flow?.sentiment_trajectory,
        deal_signals: session.extracted_context?.deal_signals || []
      });
    }

    return Response.json({
      success: true,
      thread: {
        prospect_id,
        prospect_name: sessions[0].prospect_name,
        total_sessions: sessions.length,
        total_turns: conversationHistory.length,
        sessions: sessionsData,
        conversation_history: conversationHistory.sort((a, b) => 
          new Date(a.timestamp) - new Date(b.timestamp)
        )
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});