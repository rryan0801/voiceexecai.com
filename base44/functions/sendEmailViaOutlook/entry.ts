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
    const { to, subject, body, cc, bcc } = await req.json();

    if (!to || !subject || !body) {
      return Response.json({ error: 'to, subject, body required' }, { status: 400 });
    }

    // Get app user's Outlook connection
    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection('69efbb8b3d25346a6ed84481');

    // Send email via Microsoft Graph
    const result = await graphRequest(accessToken, '/me/sendMail', {
      method: 'POST',
      body: JSON.stringify({
        message: {
          subject: subject,
          body: { contentType: 'HTML', content: body },
          toRecipients: [{ emailAddress: { address: to } }],
          ...(cc && { ccRecipients: [{ emailAddress: { address: cc } }] }),
          ...(bcc && { bccRecipients: [{ emailAddress: { address: bcc } }] })
        },
        saveToSentItems: true
      })
    });

    return Response.json({
      success: true,
      action: 'send_email',
      recipient: to,
      subject: subject
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});