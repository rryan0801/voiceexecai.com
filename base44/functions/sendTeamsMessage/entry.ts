import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { webhook_url, message, title, color } = await req.json();

    if (!webhook_url || !message) {
      return Response.json({ error: 'Missing required fields: webhook_url, message' }, { status: 400 });
    }

    // Microsoft Teams incoming webhook (Adaptive Card format)
    const teamsRes = await fetch(webhook_url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        "@type": "MessageCard",
        "@context": "http://schema.org/extensions",
        themeColor: color || "0076D7",
        summary: title || "VoiceExec AI Update",
        sections: [{
          activityTitle: title || "VoiceExec AI Update",
          activitySubtitle: `From ${user.full_name || user.email}`,
          text: message,
          markdown: true
        }]
      })
    });

    if (!teamsRes.ok) {
      const errorText = await teamsRes.text();
      return Response.json({ error: 'Failed to send Teams message', details: errorText }, { status: 400 });
    }

    return Response.json({
      success: true,
      message: 'Teams message sent successfully'
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});