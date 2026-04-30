import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

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

    // Get session
    const sessions = await base44.entities.ConversationSession.filter(
      { id: session_id },
      '-created_date',
      1
    );

    if (!sessions || sessions.length === 0) {
      return Response.json({ error: 'Session not found' }, { status: 404 });
    }

    const session = sessions[0];
    const startedAt = new Date(session.started_at);
    const endedAt = new Date();
    const durationSeconds = Math.round((endedAt - startedAt) / 1000);

    // Close session
    await base44.entities.ConversationSession.update(session_id, {
      session_status: 'closed',
      ended_at: endedAt.toISOString(),
      total_duration_seconds: durationSeconds
    });

    return Response.json({
      success: true,
      session_id,
      duration_seconds: durationSeconds,
      total_turns: session.total_turns
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});