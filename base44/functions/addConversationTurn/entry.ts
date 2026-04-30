import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { session_id, speaker, message, intent, sentiment, key_topics } = await req.json();

    if (!session_id || !speaker || !message) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get current session
    const session = await base44.entities.ConversationSession.filter(
      { id: session_id },
      '-created_date',
      1
    );

    if (!session || session.length === 0) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    const currentSession = session[0];
    const turns = currentSession.conversation_turns || [];
    const newTurn = {
      turn_number: turns.length + 1,
      speaker,
      message,
      timestamp: new Date().toISOString(),
      intent,
      sentiment,
      key_topics: key_topics || []
    };

    turns.push(newTurn);

    // Update session with new turn
    await base44.entities.ConversationSession.update(session_id, {
      conversation_turns: turns,
      total_turns: turns.length
    });

    return Response.json({ success: true, turn_number: newTurn.turn_number });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});