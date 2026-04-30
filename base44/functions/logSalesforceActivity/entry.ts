import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { opportunity_id, activity_type, subject, description, salesforce_instance_url, salesforce_access_token } = await req.json();

    if (!opportunity_id || !activity_type || !salesforce_instance_url || !salesforce_access_token) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const activityRes = await fetch(
      `${salesforce_instance_url}/services/data/v57.0/sobjects/Task/`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${salesforce_access_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          WhoId: opportunity_id,
          Subject: subject || activity_type,
          Description: description,
          ActivityDate: new Date().toISOString().split('T')[0],
          Type: activity_type
        })
      }
    );

    const activity = await activityRes.json();

    if (!activityRes.ok) {
      return Response.json({ error: 'Failed to log activity', details: activity }, { status: 400 });
    }

    return Response.json({
      success: true,
      activity_id: activity.id,
      message: `${activity_type} logged for opportunity`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});