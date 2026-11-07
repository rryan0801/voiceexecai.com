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

    const website = await base44.entities.Website.get(website_id);
    if (!website) {
      return Response.json({ error: 'Website not found' }, { status: 404 });
    }

    if (!website.competitors || website.competitors.length === 0) {
      return Response.json({ 
        message: 'No competitors specified. Add competitor URLs to the website.',
        competitors_count: 0 
      });
    }

    const analyses = [];

    for (const competitorUrl of website.competitors) {
      // Use AI to analyze competitor
      const competitorAnalysis = await base44.integrations.Core.InvokeLLM({
        prompt: `Analyze this competitor website: ${competitorUrl}
        
        My website: ${website.name} (${website.url})
        Industry: ${website.industry || 'General'}
        My target keywords: ${website.target_keywords?.join(', ') || 'Not specified'}
        
        Perform competitive intelligence analysis:
        1. Estimate their monthly organic traffic
        2. Assess domain authority (0-100)
        3. Identify their top 10 ranking keywords (with search volume and position)
        4. Find content gaps - keywords they rank for that I should target
        5. Estimate their backlink count
        6. Identify their top referring domains
        
        Return JSON with:
        - competitor_name: string
        - estimated_monthly_traffic: number
        - domain_authority: number (0-100)
        - total_keywords: number
        - top_keywords: array of {keyword, position, search_volume, url}
        - content_gaps: array of {keyword, their_position, our_position (estimate), opportunity_score (0-100), recommended_action}
        - backlinks_count: number
        - top_referring_domains: array of strings (top 5)`,
        add_context_from_internet: true,
        response_json_schema: {
          type: "object",
          properties: {
            competitor_name: { type: "string" },
            estimated_monthly_traffic: { type: "number" },
            domain_authority: { type: "number" },
            total_keywords: { type: "number" },
            top_keywords: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  keyword: { type: "string" },
                  position: { type: "number" },
                  search_volume: { type: "number" },
                  url: { type: "string" }
                }
              }
            },
            content_gaps: {
              type: "array",
              items: {
                type: "object",
                properties: {
                  keyword: { type: "string" },
                  their_position: { type: "number" },
                  our_position: { type: "number" },
                  opportunity_score: { type: "number" },
                  recommended_action: { type: "string" }
                }
              }
            },
            backlinks_count: { type: "number" },
            top_referring_domains: { type: "array", items: { type: "string" } }
          }
        }
      });

      // Save analysis
      const analysis = await base44.entities.CompetitorAnalysis.create({
        website_id,
        competitor_url: competitorUrl,
        competitor_name: competitorAnalysis.competitor_name || competitorUrl,
        estimated_monthly_traffic: competitorAnalysis.estimated_monthly_traffic,
        domain_authority: competitorAnalysis.domain_authority,
        total_keywords: competitorAnalysis.total_keywords,
        top_keywords: competitorAnalysis.top_keywords,
        content_gaps: competitorAnalysis.content_gaps,
        backlinks_count: competitorAnalysis.backlinks_count,
        top_referring_domains: competitorAnalysis.top_referring_domains,
        analyzed_at: new Date().toISOString()
      });

      // Save content gap keywords to tracker
      const gapKeywords = competitorAnalysis.content_gaps
        .filter(gap => gap.opportunity_score >= 70)
        .slice(0, 10);

      for (const gap of gapKeywords) {
        await base44.entities.KeywordTracker.create({
          website_id,
          keyword: gap.keyword,
          search_volume: gap.search_volume || 500,
          difficulty: gap.their_position < 10 ? 70 : 50,
          intent: 'commercial',
          opportunity_score: gap.opportunity_score,
          current_rank: gap.our_position || 100,
          tracked_since: new Date().toISOString(),
          last_checked: new Date().toISOString()
        });
      }

      analyses.push({
        competitor: competitorAnalysis.competitor_name,
        traffic: competitorAnalysis.estimated_monthly_traffic,
        authority: competitorAnalysis.domain_authority,
        gaps_found: gapKeywords.length
      });
    }

    return Response.json({
      success: true,
      competitors_analyzed: analyses.length,
      analyses,
      total_content_gaps: analyses.reduce((sum, a) => sum + (a.gaps_found || 0), 0),
      message: `Analyzed ${analyses.length} competitors and found ${analyses.reduce((sum, a) => sum + (a.gaps_found || 0), 0)} keyword opportunities`
    });
  } catch (error) {
    console.error('Competitor analysis error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});