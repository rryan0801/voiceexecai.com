import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { channel, message, slack_bot_token, thread_ts } = await req.json();

    if (!channel || !message || !slack_bot_token) {
      return Response.json({ error: 'Missing required fields: channel, message, slack_bot_token' }, { status: 400 });
    }

    const payload = {
      channel: channel,
      text: message
    };

    if (thread_ts) {
      payload.thread_ts = thread_ts;
    }

    const slackRes = await fetch(
      `https://slack.com/api/chat.postMessage`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${slack_bot_token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      }
    );

    const slackData = await slackRes.json();

    if (!slackData.ok) {
      return Response.json({ error: 'Failed to send Slack message', details: slackData }, { status: 400 });
    }

    return Response.json({
      success: true,
      message_ts: slackData.ts,
      channel: channel,
      message: 'Slack message sent successfully'
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});