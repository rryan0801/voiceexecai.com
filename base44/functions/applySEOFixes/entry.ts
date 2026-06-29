import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
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