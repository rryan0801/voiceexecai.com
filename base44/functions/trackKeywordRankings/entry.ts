import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';


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

    const { website_id } = await req.json();
    if (!website_id) {
      return Response.json({ error: 'website_id required' }, { status: 400 });
    }

    // Get all tracked keywords for this website
    const keywords = await base44.entities.KeywordTracker.filter({ website_id });
    
    if (keywords.length === 0) {
      return Response.json({ 
        message: 'No keywords being tracked. Run researchKeywords first.',
        keywords_tracked: 0 
      });
    }

    const updated = [];
    
    for (const keyword of keywords) {
      try {
        // Use AI to check current ranking (simulates rank checking)
        const rankCheck = await base44.integrations.Core.InvokeLLM({
          prompt: `Check the current Google ranking position for keyword "${keyword.keyword}" for website ${website_id}. Return JSON: {"current_rank": number, "url_ranking": "string URL or null", "previous_rank": ${keyword.current_rank || 100}}. If you can't check real rankings, estimate based on typical SEO patterns.`,
          response_json_schema: {
            type: "object",
            properties: {
              current_rank: { type: "number" },
              url_ranking: { type: "string" },
              previous_rank: { type: "number" }
            }
          },
          add_context_from_internet: true
        });

        const newRank = rankCheck.current_rank || 100;
        const previousRank = keyword.current_rank || 100;
        const rankChange = previousRank - newRank; // Positive = improvement

        await base44.entities.KeywordTracker.update(keyword.id, {
          previous_rank: previousRank,
          current_rank: newRank,
          rank_change: rankChange,
          url_ranking: rankCheck.url_ranking,
          last_checked: new Date().toISOString()
        });

        updated.push({
          keyword: keyword.keyword,
          previous_rank: previousRank,
          current_rank: newRank,
          change: rankChange
        });

        console.log(`Keyword "${keyword.keyword}": ${previousRank} → ${newRank} (${rankChange > 0 ? '+' : ''}${rankChange})`);
      } catch (err) {
        console.error(`Failed to check rank for "${keyword.keyword}":`, err.message);
      }
    }

    return Response.json({
      keywords_updated: updated.length,
      total_tracked: keywords.length,
      updates: updated,
      summary: {
        improved: updated.filter(k => k.change > 0).length,
        declined: updated.filter(k => k.change < 0).length,
        unchanged: updated.filter(k => k.change === 0).length
      }
    });
  } catch (error) {
    console.error('Rank tracking error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});