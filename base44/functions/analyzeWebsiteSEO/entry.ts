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

    // Get website
    const website = await base44.entities.Website.get(website_id);
    if (!website) {
      return Response.json({ error: 'Website not found' }, { status: 404 });
    }

    // Analyze website using AI
    const analysisResult = await base44.integrations.Core.InvokeLLM({
      prompt: `Analyze this website for SEO: ${website.url}
      
      Website Name: ${website.name}
      Industry: ${website.industry || 'Not specified'}
      Target Keywords: ${website.target_keywords?.join(', ') || 'None specified'}
      
      Perform a comprehensive SEO audit covering:
      1. Technical SEO (site speed, mobile-friendliness, SSL, sitemap, robots.txt)
      2. On-page SEO (title tags, meta descriptions, headings, URL structure)
      3. Content quality (keyword usage, content depth, readability)
      4. Structured data (JSON-LD, schema.org markup)
      5. Performance (Core Web Vitals, page load time)
      
      Return a detailed JSON analysis with:
      - overall_score (0-100)
      - technical_score (0-100)
      - content_score (0-100)
      - on_page_score (0-100)
      - issues: array of {type: "critical"|"warning"|"info", category, title, description, url, fix_suggestion, auto_fixable}
      - recommendations: array of priority action items
      - pages_analyzed: number
      
      Be specific and actionable. Identify real issues and provide concrete fixes.`,
      add_context_from_internet: true,
      response_json_schema: {
        type: "object",
        properties: {
          overall_score: { type: "number" },
          technical_score: { type: "number" },
          content_score: { type: "number" },
          on_page_score: { type: "number" },
          issues: {
            type: "array",
            items: {
              type: "object",
              properties: {
                type: { type: "string" },
                category: { type: "string" },
                title: { type: "string" },
                description: { type: "string" },
                url: { type: "string" },
                fix_suggestion: { type: "string" },
                auto_fixable: { type: "boolean" }
              }
            }
          },
          recommendations: { type: "array", items: { type: "string" } },
          pages_analyzed: { type: "number" }
        },
        required: ["overall_score", "technical_score", "content_score", "on_page_score", "issues", "recommendations"]
      }
    });

    // Save audit to database
    const audit = await base44.entities.SEOAudit.create({
      website_id: website.id,
      overall_score: analysisResult.overall_score,
      technical_score: analysisResult.technical_score,
      content_score: analysisResult.content_score,
      on_page_score: analysisResult.on_page_score,
      issues: analysisResult.issues,
      recommendations: analysisResult.recommendations,
      pages_analyzed: analysisResult.pages_analyzed,
      audited_at: new Date().toISOString()
    });

    // Update website with new score
    await base44.entities.Website.update(website_id, {
      seo_health_score: analysisResult.overall_score,
      last_audit_date: new Date().toISOString()
    });

    return Response.json({ 
      success: true, 
      audit_id: audit.id,
      scores: {
        overall: analysisResult.overall_score,
        technical: analysisResult.technical_score,
        content: analysisResult.content_score,
        on_page: analysisResult.on_page_score
      },
      issues_count: analysisResult.issues.length,
      recommendations: analysisResult.recommendations
    });
  } catch (error) {
    console.error('SEO analysis error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});