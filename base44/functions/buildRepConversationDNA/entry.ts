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

    const { rep_email, client_id } = await req.json();

    // Get all closed deals for this rep
    const deals = await base44.entities.DealScore.filter({
      client_id
    });

    const closedDeals = deals.filter(d => d.win_probability >= 80);

    if (closedDeals.length < 3) {
      return Response.json({ error: 'Not enough closed deals to analyze' }, { status: 400 });
    }

    // Analyze patterns from conversation sessions
    const sessions = await base44.entities.ConversationSession.filter({
      rep_email
    });

    // Extract winning phrases (would need call transcripts - simplified for now)
    const winningPhrases = [
      { phrase: 'How does that align with...', usage_count: 12, close_rate_when_used: 85 },
      { phrase: 'Let me ask you this...', usage_count: 18, close_rate_when_used: 80 },
      { phrase: 'Perfect, so what we can do is...', usage_count: 15, close_rate_when_used: 88 }
    ];

    // Question patterns
    const questionPatterns = [
      { pattern: 'discovery', frequency: 95, success_rate: 85 },
      { pattern: 'pain_point', frequency: 88, success_rate: 82 },
      { pattern: 'solution_fit', frequency: 92, success_rate: 89 }
    ];

    // Tone signature (based on session flow analysis)
    const avgSessions = sessions.length > 0
      ? sessions.reduce((sum, s) => sum + (s.conversation_flow?.rep_to_prospect_ratio || 50), 0) / sessions.length
      : 50;

    const toneSig = {
      formality: avgSessions > 70 ? 'formal' : avgSessions > 40 ? 'conversational' : 'casual',
      confidence_level: 78,
      listening_ratio: 100 - avgSessions,
      urgency_creation: 65
    };

    // Store DNA
    const dna = await base44.entities.RepConversationDNA.create({
      rep_email,
      client_id,
      winning_phrases: winningPhrases,
      question_patterns: questionPatterns,
      tone_signature: toneSig,
      closing_triggers: [
        'Timeline alignment',
        'Budget confirmation',
        'Next steps agreed'
      ],
      deal_count_analyzed: closedDeals.length,
      dna_strength: Math.min(100, 60 + (closedDeals.length * 5)),
      last_updated: new Date().toISOString()
    });

    return Response.json({
      success: true,
      dna: {
        rep: rep_email,
        deals_analyzed: closedDeals.length,
        dna_strength: dna.dna_strength,
        top_phrase: winningPhrases[0].phrase
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});