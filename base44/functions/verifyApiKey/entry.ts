import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { api_key } = await req.json();

    if (!api_key) {
      return Response.json({ error: 'API key required' }, { status: 400 });
    }

    // Find client by API key
    const clients = await base44.asServiceRole.entities.Client.filter({ api_key });
    
    if (!clients || clients.length === 0) {
      return Response.json({ error: 'Invalid API key' }, { status: 401 });
    }

    const client = clients[0];

    if (client.status !== 'active') {
      return Response.json({ error: 'Client account suspended or inactive' }, { status: 403 });
    }

    return Response.json({
      valid: true,
      client_id: client.id,
      company_name: client.company_name,
      enabled_tools: client.widget_config?.enabled_tools || [],
      widget_config: client.widget_config
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});