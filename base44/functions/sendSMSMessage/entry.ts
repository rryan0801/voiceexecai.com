import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const TWILIO_ACCOUNT_SID = Deno.env.get('TWILIO_ACCOUNT_SID');
const TWILIO_AUTH_TOKEN = Deno.env.get('TWILIO_AUTH_TOKEN');
const TWILIO_PHONE = Deno.env.get('TWILIO_WHATSAPP_NUMBER');

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { thread_id, message_content, prospect_phone } = await req.json();

    if (!message_content || !prospect_phone) {
      return Response.json({ error: 'Missing message_content or prospect_phone' }, { status: 400 });
    }

    // Send via Twilio
    const auth = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`);
    const smsRes = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${auth}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          From: TWILIO_PHONE,
          To: prospect_phone,
          Body: message_content
        }).toString()
      }
    );

    const smsData = await smsRes.json();

    if (!smsRes.ok) {
      return Response.json({ error: smsData.message }, { status: 400 });
    }

    // Update thread with new message
    if (thread_id) {
      const thread = await base44.entities.SMSThread.get(thread_id);
      const updatedMessages = thread.messages || [];
      updatedMessages.push({
        id: smsData.sid,
        direction: 'outbound',
        content: message_content,
        timestamp: new Date().toISOString(),
        status: 'sent',
        twilio_sid: smsData.sid
      });

      await base44.entities.SMSThread.update(thread_id, {
        messages: updatedMessages,
        total_messages: updatedMessages.length,
        last_message_at: new Date().toISOString(),
        last_message_from: 'rep'
      });
    }

    return Response.json({
      success: true,
      message_id: smsData.sid,
      status: smsData.status
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});