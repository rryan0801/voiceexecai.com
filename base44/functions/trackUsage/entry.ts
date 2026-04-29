import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { client_id, command_id, request_type } = await req.json();

    if (!client_id || !request_type) {
      return Response.json({ error: 'client_id and request_type required' }, { status: 400 });
    }

    // Get current month in YYYY-MM-01 format
    const now = new Date();
    const month = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-01`;

    // Find or create usage meter for this month
    const existingMeters = await base44.asServiceRole.entities.UsageMeter.filter({
      client_id,
      month
    });

    let usageMeter;
    const updateData = {
      total_requests: 0,
      [request_type]: 1
    };

    if (existingMeters && existingMeters.length > 0) {
      usageMeter = existingMeters[0];
      
      // Increment counters
      const currentCount = usageMeter[request_type] || 0;
      updateData[request_type] = currentCount + 1;
      updateData.total_requests = (usageMeter.total_requests || 0) + 1;
      
      await base44.asServiceRole.entities.UsageMeter.update(usageMeter.id, updateData);
    } else {
      // Create new usage meter
      updateData.client_id = client_id;
      updateData.month = month;
      updateData.total_requests = 1;
      
      usageMeter = await base44.asServiceRole.entities.UsageMeter.create(updateData);
    }

    // Check if client has exceeded monthly quota
    const client = await base44.asServiceRole.entities.Client.get(client_id);
    const currentUsage = usageMeter.total_requests;
    const monthlyQuota = client.monthly_quota || 10000;

    return Response.json({
      success: true,
      usage: {
        current_month: month,
        total_requests_this_month: currentUsage,
        monthly_quota: monthlyQuota,
        quota_exceeded: currentUsage > monthlyQuota,
        requests_remaining: Math.max(0, monthlyQuota - currentUsage)
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});