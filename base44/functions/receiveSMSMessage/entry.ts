import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    // Parse Twilio webhook (no auth required for webhooks)
    const base44 = createClientFromRequest(req);
    const formData = await req.formData();

    const fromNumber = formData.get('From');
    const messageBody = formData.get('Body');
    const messageSid = formData.get('MessageSid');

    if (!fromNumber || !messageBody) {
      return Response.json({ error: 'Missing From or Body' }, { status: 400 });
    }

    // Find prospect by phone number
    const prospects = await base44.asServiceRole.entities.Prospect.filter({
      phone: fromNumber
    });

    if (prospects.length === 0) {
      // Create quick prospect record if not found
      const newProspect = await base44.asServiceRole.entities.Prospect.create({
        prospect_name: `SMS Contact ${fromNumber}`,
        company_name: 'Unknown',
        phone: fromNumber,
        client_id: 'default'
      });

      // Create thread
      await base44.asServiceRole.entities.SMSThread.create({
        prospect_id: newProspect.id,
        client_id: 'default',
        prospect_name: newProspect.prospect_name,
        prospect_phone: fromNumber,
        messages: [{
          id: messageSid,
          direction: 'inbound',
          content: messageBody,
          timestamp: new Date().toISOString(),
          status: 'delivered',
          twilio_sid: messageSid
        }],
        total_messages: 1,
        last_message_at: new Date().toISOString(),
        last_message_from: 'prospect',
        status: 'active'
      });
    } else {
      const prospect = prospects[0];

      // Find or create SMS thread
      const threads = await base44.asServiceRole.entities.SMSThread.filter({
        prospect_id: prospect.id
      });

      const thread = threads.length > 0 ? threads[0] : null;

      if (thread) {
        const updatedMessages = thread.messages || [];
        updatedMessages.push({
          id: messageSid,
          direction: 'inbound',
          content: messageBody,
          timestamp: new Date().toISOString(),
          status: 'delivered',
          twilio_sid: messageSid
        });

        await base44.asServiceRole.entities.SMSThread.update(thread.id, {
          messages: updatedMessages,
          total_messages: updatedMessages.length,
          last_message_at: new Date().toISOString(),
          last_message_from: 'prospect'
        });
      } else {
        await base44.asServiceRole.entities.SMSThread.create({
          prospect_id: prospect.id,
          client_id: prospect.client_id,
          prospect_name: prospect.prospect_name,
          prospect_phone: fromNumber,
          messages: [{
            id: messageSid,
            direction: 'inbound',
            content: messageBody,
            timestamp: new Date().toISOString(),
            status: 'delivered',
            twilio_sid: messageSid
          }],
          total_messages: 1,
          last_message_at: new Date().toISOString(),
          last_message_from: 'prospect',
          status: 'active'
        });
      }
    }

    return Response.json({ success: true });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});