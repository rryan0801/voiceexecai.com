import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { crm_type, action, ...params } = await req.json();

    if (!crm_type || !action) {
      return Response.json({ error: 'Missing required fields: crm_type, action' }, { status: 400 });
    }

    let functionName;

    // Route based on CRM type and action
    if (crm_type === 'salesforce') {
      if (action === 'create_opportunity') functionName = 'createSalesforceOpportunity';
      else if (action === 'log_activity') functionName = 'logSalesforceActivity';
    } else if (crm_type === 'pipedrive') {
      if (action === 'create_deal') functionName = 'createPipedriveDeal';
      else if (action === 'update_status') functionName = 'updatePipedriveStatus';
    } else if (crm_type === 'hubspot') {
      if (action === 'create_deal') functionName = 'createHubspotDeal';
    }

    if (!functionName) {
      return Response.json({ error: `Unsupported CRM: ${crm_type} or action: ${action}` }, { status: 400 });
    }

    // Invoke the appropriate function
    const result = await base44.asServiceRole.functions.invoke(functionName, params);

    return Response.json({
      success: true,
      crm_type,
      action,
      result: result.data || result
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});