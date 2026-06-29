import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { website_id, page_url, page_title, page_content } = await req.json();
    if (!website_id || !page_url) {
      return Response.json({ error: 'website_id and page_url required' }, { status: 400 });
    }

    const website = await base44.entities.Website.get(website_id);
    if (!website) {
      return Response.json({ error: 'Website not found' }, { status: 404 });
    }

    // Generate optimized meta tags using AI
    const metaTags = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate SEO-optimized meta tags for this webpage:
      
      Website: ${website.name} (${website.url})
      Industry: ${website.industry || 'General'}
      Target Keywords: ${website.target_keywords?.join(', ') || 'Not specified'}
      
      Page URL: ${page_url}
      Page Title: ${page_title || 'Not provided'}
      Page Content: ${page_content?.substring(0, 2000) || 'Not provided'}
      
      Create:
      1. Meta title (50-60 characters, include primary keyword, compelling)
      2. Meta description (150-160 characters, include keywords, call-to-action)
      3. OG title (Open Graph)
      4. OG description
      5. OG image suggestion (describe what image would work best)
      6. Twitter card title
      7. Twitter card description
      8. Canonical URL
      9. 5-10 relevant meta keywords
      
      Return as JSON with fields: meta_title, meta_description, og_title, og_description, og_image_suggestion, twitter_title, twitter_description, canonical_url, keywords (array)`,
      response_json_schema: {
        type: "object",
        properties: {
          meta_title: { type: "string" },
          meta_description: { type: "string" },
          og_title: { type: "string" },
          og_description: { type: "string" },
          og_image_suggestion: { type: "string" },
          twitter_title: { type: "string" },
          twitter_description: { type: "string" },
          canonical_url: { type: "string" },
          keywords: { type: "array", items: { type: "string" } }
        },
        required: ["meta_title", "meta_description", "og_title", "og_description", "canonical_url"]
      }
    });

    // Save optimizations
    const optimizations = await Promise.all([
      base44.entities.SEOOptimization.create({
        website_id,
        page_url,
        optimization_type: "meta_title",
        original_value: page_title || '',
        optimized_value: metaTags.meta_title,
        impact_score: 85,
        status: "pending"
      }),
      base44.entities.SEOOptimization.create({
        website_id,
        page_url,
        optimization_type: "meta_description",
        original_value: '',
        optimized_value: metaTags.meta_description,
        impact_score: 80,
        status: "pending"
      }),
      base44.entities.SEOOptimization.create({
        website_id,
        page_url,
        optimization_type: "og_tags",
        original_value: '',
        optimized_value: JSON.stringify({
          og_title: metaTags.og_title,
          og_description: metaTags.og_description,
          twitter_title: metaTags.twitter_title,
          twitter_description: metaTags.twitter_description
        }),
        impact_score: 70,
        status: "pending"
      })
    ]);

    return Response.json({
      success: true,
      meta_tags: metaTags,
      optimizations_created: optimizations.length,
      implementation_code: `<!-- Add to <head> section of ${page_url} -->
<title>${metaTags.meta_title}</title>
<meta name="description" content="${metaTags.meta_description}" />
<meta name="keywords" content="${metaTags.keywords?.join(', ')}" />
<link rel="canonical" href="${metaTags.canonical_url}" />

<!-- Open Graph / Facebook -->
<meta property="og:title" content="${metaTags.og_title}" />
<meta property="og:description" content="${metaTags.og_description}" />
<meta property="og:type" content="website" />
<meta property="og:url" content="${page_url}" />

<!-- Twitter -->
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${metaTags.twitter_title}" />
<meta name="twitter:description" content="${metaTags.twitter_description}" />`
    });
  } catch (error) {
    console.error('Meta tags generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});