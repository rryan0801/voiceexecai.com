import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { channel_type, message, ...params } = await req.json();

    if (!channel_type || !message) {
      return Response.json({ error: 'Missing required fields: channel_type, message' }, { status: 400 });
    }

    let functionName;

    // Route based on communication channel
    if (channel_type === 'sms') {
      functionName = 'sendSMSMessage';
    } else if (channel_type === 'slack') {
      functionName = 'sendSlackMessage';
    } else if (channel_type === 'teams') {
      functionName = 'sendTeamsMessage';
    } else if (channel_type === 'email') {
      functionName = 'sendEmailViaOutlook';
    } else if (channel_type === 'whatsapp') {
      functionName = 'sendWhatsAppMessage';
    }

    if (!functionName) {
      return Response.json({ error: `Unsupported channel type: ${channel_type}` }, { status: 400 });
    }

    // Invoke the appropriate function
    const result = await base44.asServiceRole.functions.invoke(functionName, {
      message,
      ...params
    });

    return Response.json({
      success: true,
      channel_type,
      result: result.data || result
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});