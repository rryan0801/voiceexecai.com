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
    
    // Get all active websites
    const websites = await base44.entities.Website.filter({ status: 'active' });
    
    console.log(`Running SEO automation for ${websites.length} websites`);
    
    const results = [];
    
    for (const website of websites) {
      try {
        // Run SEO audit
        const auditResult = await base44.functions.invoke('analyzeWebsiteSEO', { 
          website_id: website.id 
        });
        
        // Track keyword rankings
        const rankingsResult = await base44.functions.invoke('trackKeywordRankings', { 
          website_id: website.id 
        });
        
        // Auto-apply critical fixes
        if (auditResult.data?.audit_id) {
          await base44.functions.invoke('applySEOFixes', { 
            website_id: website.id, 
            auto_apply: true 
          });
        }
        
        results.push({
          website_id: website.id,
          website_name: website.name,
          audit_success: true,
          rankings_updated: rankingsResult.data?.keywords_updated || 0
        });
        
        console.log(`✓ ${website.name}: Audit complete, ${rankingsResult.data?.keywords_updated || 0} keywords updated`);
      } catch (error) {
        console.error(`✗ ${website.name}: ${error.message}`);
        results.push({
          website_id: website.id,
          website_name: website.name,
          error: error.message
        });
      }
    }
    
    return Response.json({
      success: true,
      websites_processed: websites.length,
      results
    });
  } catch (error) {
    console.error('SEO automation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});