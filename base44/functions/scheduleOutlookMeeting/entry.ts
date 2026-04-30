// Priority #2: Schedule meeting via Outlook Calendar (Microsoft Graph)
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

async function graphRequest(accessToken, path, options = {}) {
  const res = await fetch(`https://graph.microsoft.com/v1.0${path}`, {
    ...options,
    headers: { 'Authorization': `Bearer ${accessToken}`, 'Content-Type': 'application/json', ...(options.headers || {}) },
  });
  if (!res.ok) throw new Error(`Graph API error: ${res.status} ${await res.text()}`);
  const text = await res.text();
  return text ? JSON.parse(text) : null;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { subject, attendee_email, start_datetime, end_datetime, body, location } = await req.json();

    if (!subject || !start_datetime || !end_datetime) {
      return Response.json({ error: 'subject, start_datetime, and end_datetime required' }, { status: 400 });
    }

    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection('69efbb8b3d25346a6ed84481');

    const event = {
      subject,
      body: { contentType: 'HTML', content: body || '' },
      start: { dateTime: start_datetime, timeZone: 'UTC' },
      end: { dateTime: end_datetime, timeZone: 'UTC' },
      ...(location && { location: { displayName: location } }),
      ...(attendee_email && {
        attendees: [{ emailAddress: { address: attendee_email }, type: 'required' }]
      })
    };

    const result = await graphRequest(accessToken, '/me/events', {
      method: 'POST',
      body: JSON.stringify(event)
    });

    return Response.json({
      success: true,
      event_id: result.id,
      subject: result.subject,
      start: result.start,
      end: result.end,
      web_link: result.webLink
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});