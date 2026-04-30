import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    if (req.method !== 'POST') {
      return Response.json({ error: 'Method not allowed' }, { status: 405 });
    }

    const base44 = createClientFromRequest(req);
    const body = await req.json();
    const { adapter_id, event_type, data } = body;

    if (!adapter_id || !event_type || !data) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get adapter configuration
    const adapters = await base44.asServiceRole.entities.CRMWebhookAdapter.filter(
      { id: adapter_id },
      '-created_date',
      1
    );

    if (!adapters || adapters.length === 0) {
      return Response.json({ error: 'Adapter not found' }, { status: 404 });
    }

    const adapter = adapters[0];

    // Verify webhook secret (mock implementation)
    const providedSecret = req.headers.get('x-webhook-signature');
    // In production, verify HMAC signature

    // Parse incoming CRM data using field mapping
    const { field_mapping } = adapter;
    const prospectName = data[field_mapping.prospect_name_field];
    const companyName = data[field_mapping.company_field];
    const email = data[field_mapping.email_field];
    const phone = data[field_mapping.phone_field];

    if (!prospectName || !companyName) {
      return Response.json({ error: 'Missing mapped fields' }, { status: 400 });
    }

    // Find or create prospect
    const prospects = await base44.entities.Prospect.filter(
      { email, client_id: adapter.client_id },
      '-created_date',
      1
    );

    let prospect;
    if (prospects && prospects.length > 0) {
      prospect = prospects[0];
      // Update existing prospect
      await base44.entities.Prospect.update(prospect.id, {
        prospect_name: prospectName,
        company_name: companyName,
        phone: phone || prospect.phone,
        last_interaction_date: new Date().toISOString(),
        interaction_count: (prospect.interaction_count || 0) + 1
      });
    } else {
      // Create new prospect
      prospect = await base44.entities.Prospect.create({
        client_id: adapter.client_id,
        prospect_name: prospectName,
        company_name: companyName,
        email: email || '',
        phone: phone || '',
        interaction_count: 1,
        last_interaction_date: new Date().toISOString()
      });
    }

    // Log webhook interaction
    await base44.entities.ProspectInteraction.create({
      prospect_id: prospect.id,
      command_id: `webhook_${adapter_id}_${Date.now()}`,
      interaction_type: 'crm_sync',
      summary: `CRM webhook: ${event_type} from ${adapter.adapter_name}`,
      result: {
        adapter_name: adapter.adapter_name,
        event_type,
        crm_data: data,
        fields_mapped: {
          prospect_name: prospectName,
          company: companyName,
          email,
          phone
        }
      },
      status: 'completed'
    });

    // Update adapter stats
    await base44.asServiceRole.entities.CRMWebhookAdapter.update(adapter_id, {
      events_received: (adapter.events_received || 0) + 1,
      events_processed: (adapter.events_processed || 0) + 1,
      last_sync: new Date().toISOString()
    });

    return Response.json({
      success: true,
      adapter_name: adapter.adapter_name,
      prospect_id: prospect.id,
      prospect_name: prospect.prospect_name,
      event_type,
      mapped_fields: {
        prospect_name: prospectName,
        company: companyName,
        email,
        phone
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});