import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { deal_id, status, value, pipedrive_api_key } = await req.json();

    if (!deal_id || !pipedrive_api_key) {
      return Response.json({ error: 'Missing required fields: deal_id, pipedrive_api_key' }, { status: 400 });
    }

    const updatePayload = {
      status: status || 'open'
    };

    if (value) {
      updatePayload.value = value;
    }

    const updateRes = await fetch(
      `https://api.pipedrive.com/v1/deals/${deal_id}?api_token=${pipedrive_api_key}`,
      {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updatePayload)
      }
    );

    const result = await updateRes.json();

    if (!result.success) {
      return Response.json({ error: 'Failed to update deal', details: result }, { status: 400 });
    }

    return Response.json({
      success: true,
      deal_id: result.data.id,
      message: `Deal status updated to "${status}"`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});