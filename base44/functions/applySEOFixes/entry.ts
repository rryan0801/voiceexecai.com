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

    const { website_id, auto_apply = false } = await req.json();
    if (!website_id) {
      return Response.json({ error: 'website_id required' }, { status: 400 });
    }

    // Get latest audit for this website
    const audits = await base44.entities.SEOAudit.filter({ website_id }, '-audited_at', 1);
    if (audits.length === 0) {
      return Response.json({ 
        error: 'No SEO audit found. Run analyzeWebsiteSEO first.' 
      }, { status: 400 });
    }

    const audit = audits[0];
    const fixableIssues = audit.issues.filter(i => i.auto_fixable);

    if (fixableIssues.length === 0) {
      return Response.json({
        message: 'No auto-fixable issues found',
        total_issues: audit.issues.length,
        manual_review_needed: audit.issues.filter(i => !i.auto_fixable).length
      });
    }

    const optimizationsCreated = [];

    for (const issue of fixableIssues) {
      // Generate optimized value based on issue type
      const optimization = await base44.integrations.Core.InvokeLLM({
        prompt: `Generate an SEO optimization for this issue: ${issue.title} - ${issue.description}. Issue type: ${issue.category}. Suggested fix: ${issue.fix_suggestion}. Return JSON with: {"optimization_type": "meta_title|meta_description|og_tags|structured_data|heading|content|image_alt", "optimized_value": "the actual optimized content", "impact_score": number 0-100}`,
        response_json_schema: {
          type: "object",
          properties: {
            optimization_type: { type: "string" },
            optimized_value: { type: "string" },
            impact_score: { type: "number" }
          }
        }
      });

      const optimizationRecord = await base44.entities.SEOOptimization.create({
        website_id,
        page_url: issue.url || 'homepage',
        optimization_type: optimization.optimization_type,
        original_value: issue.description,
        optimized_value: optimization.optimized_value,
        status: auto_apply ? 'applied' : 'pending',
        impact_score: optimization.impact_score,
        applied_at: auto_apply ? new Date().toISOString() : null,
        applied_by: auto_apply ? 'auto' : null
      });

      optimizationsCreated.push({
        issue: issue.title,
        type: optimization.optimization_type,
        impact: optimization.impact_score,
        status: auto_apply ? 'applied' : 'pending'
      });
    }

    return Response.json({
      fixes_generated: optimizationsCreated.length,
      auto_applied: auto_apply,
      optimizations: optimizationsCreated,
      next_steps: auto_apply 
        ? 'Fixes have been automatically applied. Monitor performance in OrganicTraffic.'
        : `Review ${optimizationsCreated.length} pending optimizations in the dashboard and approve them.`
    });
  } catch (error) {
    console.error('SEO fixes error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});