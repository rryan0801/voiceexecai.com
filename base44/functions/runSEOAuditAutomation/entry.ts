import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

Deno.serve(async (req) => {
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