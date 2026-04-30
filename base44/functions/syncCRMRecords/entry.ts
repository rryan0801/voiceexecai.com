import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { crm_type, prospect_id, client_id, action } = await req.json();

    if (!crm_type || !prospect_id || !client_id || !action) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get prospect and deal data
    const prospects = await base44.entities.Prospect.filter(
      { id: prospect_id },
      '-created_date',
      1
    );

    if (!prospects || prospects.length === 0) {
      return Response.json({ error: 'Prospect not found' }, { status: 404 });
    }

    const prospect = prospects[0];

    // Get deal score for context
    const scores = await base44.entities.DealScore.filter(
      { prospect_id },
      '-created_date',
      1
    );

    const dealScore = scores?.[0];

    // Get conversation insights
    const threadRes = await base44.functions.invoke('getConversationThread', {
      prospect_id,
      client_id
    });

    const thread = threadRes.data?.thread;

    // Build sync payload
    const syncData = {
      prospect_name: prospect.prospect_name,
      company_name: prospect.company_name,
      email: prospect.email,
      phone: prospect.phone,
      interaction_count: prospect.interaction_count,
      last_interaction: prospect.last_interaction_date,
      deal_probability: dealScore?.win_probability || 0,
      conversation_summary: thread?.sessions?.[0]?.extracted_context?.main_topics?.join('; ') || '',
      deal_signals: thread?.sessions?.[0]?.extracted_context?.deal_signals || [],
      next_steps: thread?.sessions?.[0]?.extracted_context?.next_steps || [],
      updated_at: new Date().toISOString()
    };

    let result;

    if (crm_type === 'hubspot') {
      result = await base44.functions.invoke('createHubspotDeal', {
        prospect_name: prospect.prospect_name,
        company_name: prospect.company_name,
        email: prospect.email,
        deal_value: dealScore?.win_probability ? Math.round(dealScore.win_probability * 100000) : 100000,
        deal_stage: estimateDealStage(dealScore?.win_probability)
      });
    } else if (crm_type === 'salesforce') {
      result = await base44.functions.invoke('createSalesforceOpportunity', {
        prospect_name: prospect.prospect_name,
        company_name: prospect.company_name,
        email: prospect.email,
        deal_value: dealScore?.win_probability ? Math.round(dealScore.win_probability * 100000) : 100000,
        stage: estimateDealStage(dealScore?.win_probability)
      });
    } else if (crm_type === 'pipedrive') {
      result = await base44.functions.invoke('createPipedriveDeal', {
        prospect_name: prospect.prospect_name,
        company_name: prospect.company_name,
        email: prospect.email,
        deal_value: dealScore?.win_probability ? Math.round(dealScore.win_probability * 100000) : 100000
      });
    }

    // Log sync activity
    await base44.entities.ProspectInteraction.create({
      prospect_id,
      command_id: 'sync_' + Date.now(),
      interaction_type: 'crm_sync',
      summary: `Synced ${prospect.prospect_name} to ${crm_type}`,
      result: { crm_type, sync_data: syncData, status: 'completed' },
      status: 'completed'
    });

    return Response.json({
      success: true,
      crm_type,
      prospect_name: prospect.prospect_name,
      sync_data: syncData,
      crm_result: result.data
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});

function estimateDealStage(winProbability) {
  if (winProbability >= 75) return 'negotiation';
  if (winProbability >= 50) return 'proposal';
  if (winProbability >= 25) return 'qualification';
  return 'prospecting';
}