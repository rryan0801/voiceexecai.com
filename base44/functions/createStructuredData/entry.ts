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

    const { website_id, page_type, page_data } = await req.json();
    if (!website_id || !page_type) {
      return Response.json({ error: 'website_id and page_type required' }, { status: 400 });
    }

    const website = await base44.entities.Website.get(website_id);
    if (!website) {
      return Response.json({ error: 'Website not found' }, { status: 404 });
    }

    // Generate structured data based on page type
    const structuredData = await base44.integrations.Core.InvokeLLM({
      prompt: `Generate JSON-LD structured data for this ${page_type} page:
      
      Website: ${website.name} (${website.url})
      Industry: ${website.industry || 'General'}
      
      Page Data: ${JSON.stringify(page_data || {}, null, 2)}
      
      Create appropriate schema.org JSON-LD markup for a ${page_type} page.
      
      Common types:
      - homepage: Organization or WebSite schema
      - about: Organization schema
      - product: Product schema with offers
      - service: Service schema
      - article/blog: Article or BlogPosting schema
      - contact: LocalBusiness or ContactPage schema
      - pricing: Product or Service schema with offers
      - testimonial: Review schema
      - faq: FAQPage schema
      - local business: LocalBusiness schema with address, hours, geo
      
      Include all relevant properties:
      - @context: https://schema.org
      - @type: appropriate type
      - name, description, url
      - image (if applicable)
      - contact info (if applicable)
      - social profiles (if applicable)
      - reviews/ratings (if applicable)
      - offers/pricing (if applicable)
      
      STRICT RULE: use only facts given in Website and Page Data above. Never invent reviews,
      ratings, review counts, prices, addresses, phone numbers or social profiles. If a value
      is not provided, leave that property out.

      Return ONLY the JSON-LD object (no markdown, no explanation).`,
      response_json_schema: {
        type: "object",
        properties: {
          "@context": { type: "string" },
          "@type": { type: "string" },
          "name": { type: "string" },
          "description": { type: "string" },
          "url": { type: "string" },
          "image": { type: "string" },
          "telephone": { type: "string" },
          "address": { type: "object" },
          "geo": { type: "object" },
          "openingHours": { type: "string" },
          "priceRange": { type: "string" },
          "aggregateRating": { type: "object" },
          "review": { type: "array" },
          "offers": { type: "object" },
          "sameAs": { type: "array", items: { type: "string" } }
        }
      }
    });

    // Save optimization
    const optimization = await base44.entities.SEOOptimization.create({
      website_id,
      page_url: page_data?.url || website.url,
      optimization_type: "structured_data",
      original_value: '',
      optimized_value: JSON.stringify(structuredData, null, 2),
      impact_score: 90,
      status: "pending"
    });

    return Response.json({
      success: true,
      structured_data: structuredData,
      optimization_id: optimization.id,
      implementation_code: `<script type="application/ld+json">
${JSON.stringify(structuredData, null, 2)}
</script>`,
      schema_type: structuredData["@type"],
      validation_note: 'Test this structured data at: https://search.google.com/test/rich-results'
    });
  } catch (error) {
    console.error('Structured data error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});