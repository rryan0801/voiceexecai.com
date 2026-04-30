import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { client_id, prospect_id, prospect_name, channel, rep_email, parent_session_id } = await req.json();

    if (!client_id || !prospect_id || !channel) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const session = await base44.entities.ConversationSession.create({
      client_id,
      prospect_id,
      prospect_name,
      channel,
      rep_email: rep_email || user.email,
      session_status: 'active',
      conversation_turns: [],
      conversation_flow: {
        engagement_level: 0,
        rep_to_prospect_ratio: 0,
        conversation_depth: 0
      },
      extracted_context: {
        main_topics: [],
        pain_points: [],
        deal_signals: [],
        objections_raised: [],
        next_steps: []
      },
      thread_metadata: {
        parent_session_id,
        related_sessions: [],
        thread_tags: []
      },
      total_turns: 0,
      started_at: new Date().toISOString()
    });

    return Response.json({ success: true, session_id: session.id });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});