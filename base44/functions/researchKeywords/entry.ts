import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { website_id, seed_keywords, competitor_urls } = await req.json();
    if (!website_id) {
      return Response.json({ error: 'website_id required' }, { status: 400 });
    }

    const website = await base44.entities.Website.get(website_id);
    if (!website) {
      return Response.json({ error: 'Website not found' }, { status: 404 });
    }

    // Research keywords using AI with internet context
    const keywordResearch = await base44.integrations.Core.InvokeLLM({
      prompt: `Research high-value keywords for this website:
      
      Website: ${website.name} (${website.url})
      Industry: ${website.industry || 'General'}
      Seed Keywords: ${seed_keywords?.join(', ') || website.target_keywords?.join(', ') || 'Not specified'}
      Competitors: ${competitor_urls?.join(', ') || website.competitors?.join(', ') || 'None specified'}
      
      Find 20-30 keyword opportunities across these categories:
      1. Primary keywords (high volume, core business terms)
      2. Long-tail keywords (specific, lower competition)
      3. Question keywords (what/how/why queries)
      4. Commercial intent keywords (buy/best/review)
      5. Local keywords (if applicable, with location)
      
      For each keyword, estimate:
      - Monthly search volume
      - Difficulty (0-100)
      - CPC (cost per click)
      - Intent (informational/commercial/navigational/transactional)
      - Opportunity score (0-100, based on volume vs difficulty)
      
      Return as JSON array of keywords with: keyword, search_volume, difficulty, cpc, intent, opportunity_score, category`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          keywords: {
            type: "array",
            items: {
              type: "object",
              properties: {
                keyword: { type: "string" },
                search_volume: { type: "number" },
                difficulty: { type: "number" },
                cpc: { type: "number" },
                intent: { type: "string" },
                opportunity_score: { type: "number" },
                category: { type: "string" }
              }
            }
          }
        },
        required: ["keywords"]
      }
    });

    // Save top keywords to tracker
    const topKeywords = keywordResearch.keywords
      .sort((a, b) => b.opportunity_score - a.opportunity_score)
      .slice(0, 20);

    const savedKeywords = await Promise.all(
      topKeywords.map(kw =>
        base44.entities.KeywordTracker.create({
          website_id,
          keyword: kw.keyword,
          search_volume: kw.search_volume,
          difficulty: kw.difficulty,
          cpc: kw.cpc,
          intent: kw.intent,
          opportunity_score: kw.opportunity_score,
          tracked_since: new Date().toISOString(),
          last_checked: new Date().toISOString()
        })
      )
    );

    // Update website target keywords
    const primaryKeywords = topKeywords
      .filter(k => k.intent === 'transactional' || k.intent === 'commercial')
      .slice(0, 10)
      .map(k => k.keyword);

    if (primaryKeywords.length > 0) {
      await base44.entities.Website.update(website_id, {
        target_keywords: primaryKeywords
      });
    }

    return Response.json({
      success: true,
      keywords_researched: keywordResearch.keywords.length,
      keywords_saved: savedKeywords.length,
      top_opportunities: topKeywords.map(k => ({
        keyword: k.keyword,
        volume: k.search_volume,
        difficulty: k.difficulty,
        opportunity_score: k.opportunity_score
      })),
      summary: {
        avg_search_volume: Math.round(topKeywords.reduce((sum, k) => sum + k.search_volume, 0) / topKeywords.length),
        avg_difficulty: Math.round(topKeywords.reduce((sum, k) => sum + k.difficulty, 0) / topKeywords.length),
        total_potential_traffic: topKeywords.reduce((sum, k) => sum + k.search_volume, 0)
      }
    });
  } catch (error) {
    console.error('Keyword research error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});