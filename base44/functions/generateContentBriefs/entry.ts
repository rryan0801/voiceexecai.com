import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { website_id, topic, target_keywords } = await req.json();
    if (!website_id || !topic) {
      return Response.json({ error: 'website_id and topic required' }, { status: 400 });
    }

    const website = await base44.entities.Website.get(website_id);
    if (!website) {
      return Response.json({ error: 'Website not found' }, { status: 404 });
    }

    // Generate comprehensive content brief using AI
    const brief = await base44.integrations.Core.InvokeLLM({
      prompt: `Create a comprehensive SEO content brief for: "${topic}"
      
      Website: ${website.name} (${website.url})
      Industry: ${website.industry || 'General'}
      Target keywords: ${target_keywords?.join(', ') || website.target_keywords?.join(', ') || 'Not specified'}
      
      Create a complete content brief that would rank #1 on Google:
      
      1. Suggested title (compelling, includes primary keyword, 50-60 characters)
      2. Meta description (150-160 characters, includes CTA)
      3. Detailed outline with H2/H3 headings
      4. Recommended word count based on SERP analysis
      5. Key points that must be covered
      6. Internal linking suggestions (what pages to link to)
      7. External references (authoritative sources to cite)
      8. Search intent (informational/commercial/transactional)
      9. Content type (blog post, guide, comparison, listicle, case study, etc.)
      10. Estimated traffic potential if ranking #1
      
      Return as JSON with all fields structured properly.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          suggested_title: { type: "string" },
          meta_description: { type: "string" },
          outline: { type: "array", items: { type: "string" } },
          word_count: { type: "number" },
          key_points: { type: "array", items: { type: "string" } },
          internal_links: { type: "array", items: { type: "string" } },
          external_references: { type: "array", items: { type: "string" } },
          intent: { type: "string" },
          content_type: { type: "string" },
          estimated_traffic_potential: { type: "number" }
        }
      }
    });

    // Calculate search volume estimate
    const searchVolume = target_keywords?.length > 0 
      ? target_keywords.length * 500 
      : 1000;

    // Save content opportunity
    const opportunity = await base44.entities.ContentOpportunity.create({
      website_id,
      topic,
      target_keywords: target_keywords || [],
      search_volume: searchVolume,
      difficulty: 45,
      intent: brief.intent || 'informational',
      content_type: brief.content_type || 'blog_post',
      estimated_traffic_potential: brief.estimated_traffic_potential || searchVolume * 0.3,
      content_brief: {
        suggested_title: brief.suggested_title,
        meta_description: brief.meta_description,
        outline: brief.outline,
        word_count: brief.word_count,
        key_points: brief.key_points,
        internal_links: brief.internal_links,
        external_references: brief.external_references
      },
      status: 'brief_ready',
      priority_score: 85,
      created_at: new Date().toISOString()
    });

    return Response.json({
      success: true,
      opportunity_id: opportunity.id,
      brief,
      implementation_guide: `
## How to Use This Brief:

1. **Title**: Use "${brief.suggested_title}" as your H1
2. **Meta**: Add the meta description to your page
3. **Structure**: Follow the outline exactly (H2/H3 hierarchy)
4. **Word Count**: Aim for ${brief.word_count || 1500} words
5. **Key Points**: Cover all ${brief.key_points?.length || 5} key points
6. **Links**: Add ${brief.internal_links?.length || 3} internal links and cite ${brief.external_references?.length || 2} external sources
7. **Publish**: Add to your blog and submit to Google Search Console

**Estimated Impact**: ${brief.estimated_traffic_potential || 300} monthly visitors if ranking #1
      `.trim()
    });
  } catch (error) {
    console.error('Content brief error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});