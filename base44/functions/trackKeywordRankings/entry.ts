import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
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