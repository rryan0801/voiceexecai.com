import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { phone_number, message, twilio_account_sid, twilio_auth_token, from_number } = await req.json();

    if (!phone_number || !message || !twilio_account_sid || !twilio_auth_token || !from_number) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const smsRes = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${twilio_account_sid}/Messages.json`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Basic ${btoa(`${twilio_account_sid}:${twilio_auth_token}`)}`,
          'Content-Type': 'application/x-www-form-urlencoded'
        },
        body: new URLSearchParams({
          To: phone_number,
          From: from_number,
          Body: message
        })
      }
    );

    const smsData = await smsRes.json();

    if (!smsRes.ok) {
      return Response.json({ error: 'Failed to send SMS', details: smsData }, { status: 400 });
    }

    return Response.json({
      success: true,
      sms_id: smsData.sid,
      to: phone_number,
      message: 'SMS sent successfully'
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});