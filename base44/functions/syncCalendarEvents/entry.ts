import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { client_id } = await req.json();

    // Get Outlook connection (myOutlook connector)
    const connection = await base44.asServiceRole.connectors.getCurrentAppUserConnection('69efbb8b3d25346a6ed84481');
    const accessToken = connection.accessToken;

    // Fetch events from Outlook
    const eventsRes = await fetch(
      'https://graph.microsoft.com/v1.0/me/events?$filter=start/dateTime ge ' + 
      new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString() +
      '&$select=id,subject,start,end,attendees,bodyPreview,isReminderOn',
      {
        headers: { 'Authorization': `Bearer ${accessToken}` }
      }
    );

    const eventsData = await eventsRes.json();
    const events = eventsData.value || [];

    let synced = 0;

    // Process each event
    for (const event of events) {
      // Match to prospect by attendee email
      const attendeeEmails = event.attendees?.map(a => a.emailAddress?.address) || [];
      const prospects = await base44.entities.Prospect.filter({ email: attendeeEmails[0] });

      if (prospects.length > 0) {
        const prospect = prospects[0];

        // Check if event already exists
        const existing = await base44.entities.CalendarEvent.filter({
          outlook_event_id: event.id
        });

        const eventData = {
          client_id,
          prospect_id: prospect.id,
          prospect_name: prospect.prospect_name,
          company_name: prospect.company_name,
          event_title: event.subject,
          started_at: event.start.dateTime,
          ended_at: event.end.dateTime,
          duration_minutes: Math.round((new Date(event.end.dateTime) - new Date(event.start.dateTime)) / 60000),
          attendees: event.attendees?.map(a => ({
            email: a.emailAddress?.address,
            name: a.emailAddress?.name,
            response: a.status?.response
          })) || [],
          outlook_event_id: event.id,
          notes: event.bodyPreview || '',
          outcome: 'completed'
        };

        if (existing.length === 0) {
          await base44.entities.CalendarEvent.create(eventData);
          synced++;
        }
      }
    }

    return Response.json({ success: true, synced });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});