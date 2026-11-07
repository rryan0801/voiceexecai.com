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

    const { website_id, topic, content_brief } = await req.json();
    if (!website_id || !topic) {
      return Response.json({ error: 'website_id and topic required' }, { status: 400 });
    }

    const website = await base44.entities.Website.get(website_id);
    if (!website) {
      return Response.json({ error: 'Website not found' }, { status: 404 });
    }

    // Generate full SEO-optimized content
    const content = await base44.integrations.Core.InvokeLLM({
      prompt: `Write a complete, SEO-optimized article for: "${topic}"
      
      Website: ${website.name} (${website.url})
      Industry: ${website.industry || 'General'}
      
      Content Brief:
      ${JSON.stringify(content_brief || {}, null, 2)}
      
      Write a comprehensive, engaging, SEO-optimized article that will rank #1 on Google.
      
      Requirements:
      - Use the suggested title as H1
      - Follow the outline structure exactly (H2/H3 headings)
      - Cover all key points thoroughly
      - Write ${content_brief?.word_count || 1500} words
      - Include the target keywords naturally (don't keyword stuff)
      - Write in a conversational, engaging tone
      - Add actionable insights and examples
      - Include a compelling introduction and conclusion
      - Add a call-to-action at the end
      - Format with proper HTML (h2, h3, p, ul, li tags)
      
      Return the full article content as HTML (not markdown).`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          title: { type: "string" },
          content_html: { type: "string" },
          word_count: { type: "number" },
          meta_description: { type: "string" },
          focus_keywords: { type: "array", items: { type: "string" } }
        }
      }
    });

    // Update the content opportunity
    if (content_brief?.id) {
      await base44.entities.ContentOpportunity.update(content_brief.id, {
        ai_generated_content: content.content_html,
        status: 'content_created'
      });
    }

    return Response.json({
      success: true,
      article: {
        title: content.title,
        content_html: content.content_html,
        word_count: content.word_count,
        meta_description: content.meta_description,
        focus_keywords: content.focus_keywords
      },
      implementation_code: `
<!-- Add to your CMS or website -->
<html>
<head>
  <title>${content.title}</title>
  <meta name="description" content="${content.meta_description}" />
</head>
<body>
  ${content.content_html}
</body>
</html>
      `.trim(),
      next_steps: [
        'Review and edit the content if needed',
        'Add images or media to enhance engagement',
        'Publish to your website',
        'Submit URL to Google Search Console',
        'Share on social media for initial traction',
        'Monitor rankings in the Keywords tab'
      ]
    });
  } catch (error) {
    console.error('Content writing error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});