import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { thread_id, message_content, prospect_linkedin_url } = await req.json();

    if (!message_content || !prospect_linkedin_url) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Since LinkedIn Messaging API is limited, we'll log the message intent and store it
    // In production, you'd integrate with LinkedIn's official API or a service like Clearbit

    if (thread_id) {
      const thread = await base44.entities.LinkedInMessage.get(thread_id);
      const updatedMessages = thread.messages || [];
      
      updatedMessages.push({
        id: `msg_${Date.now()}`,
        direction: 'outbound',
        content: message_content,
        timestamp: new Date().toISOString(),
        status: 'sent'
      });

      await base44.entities.LinkedInMessage.update(thread_id, {
        messages: updatedMessages,
        total_messages: updatedMessages.length,
        last_message_at: new Date().toISOString(),
        last_message_from: 'rep'
      });
    }

    return Response.json({
      success: true,
      message_id: `msg_${Date.now()}`,
      status: 'sent',
      note: 'Message logged. Manual send via LinkedIn.com required due to API limitations.'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});