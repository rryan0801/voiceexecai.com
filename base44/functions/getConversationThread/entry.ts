import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';


// ---- Access gates (audit 2026-11-07, second pass) ----
async function __me(req) {
  try { return await createClientFromRequest(req).auth.me(); } catch (_e) { return null; }
}
async function __gateAdmin(req) {
  const u = await __me(req);
  if (!u) return Response.json({ error: 'Please sign in.' }, { status: 401 });
  if (u.role !== 'admin') return Response.json({ error: 'Admins only.' }, { status: 403 });
  return null;
}
async function __gateUser(req) {
  const u = await __me(req);
  if (!u) return Response.json({ error: 'Please sign in.' }, { status: 401 });
  return null;
}
async function __gatePaid(req) {
  const u = await __me(req);
  if (!u) return Response.json({ error: 'Please sign in.' }, { status: 401 });
  if (u.role === 'admin') return null;
  const email = String(u.email || '').toLowerCase();
  try {
    const subs = await createClientFromRequest(req).asServiceRole.entities.Subscription.filter({ user_email: email });
    if (subs.some((s) => ['active', 'past_due'].includes(s.status))) return null;
  } catch (_e) { /* fall through */ }
  try {
    const key = Deno.env.get('STRIPE_SECRET_KEY');
    if (key) {
      const h = { Authorization: `Bearer ${key}` };
      const c = await (await fetch(`https://api.stripe.com/v1/customers?email=${encodeURIComponent(email)}&limit=3`, { headers: h })).json();
      for (const cu of c?.data || []) {
        const s = await (await fetch(`https://api.stripe.com/v1/subscriptions?customer=${cu.id}&status=active&limit=1`, { headers: h })).json();
        if ((s?.data || []).length > 0) return null;
      }
    }
  } catch (_e) { /* not subscribed */ }
  return Response.json({ error: 'A paid plan is needed. See voiceexecai.com/pricing.', needs_plan: true }, { status: 402 });
}

Deno.serve(async (req) => {
  { const __denied = await __gateAdmin(req); if (__denied) return __denied; } // audit 2026-11-07, second pass

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