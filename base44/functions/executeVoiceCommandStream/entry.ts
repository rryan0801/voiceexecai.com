import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { client_id, command_id, transcription, context } = await req.json();

    if (!command_id || !transcription) {
      return Response.json({ error: 'command_id and transcription required' }, { status: 400 });
    }

    // Fetch prospect context if prospect name provided
    let prospectContext = {};
    if (context?.prospect_name) {
      const getContextRes = await base44.asServiceRole.functions.invoke('getProspectContext', {
        client_id,
        prospect_name: context.prospect_name,
        company_name: context.prospect_company
      });
      prospectContext = getContextRes.context || {};
    }

    // Update to reasoning status with enriched context
    await base44.asServiceRole.entities.Command.update(command_id, {
      status: 'reasoning',
      context: {
        ...context,
        prospect_context: prospectContext
      }
    });

    // TODO: Replace with real Claude streaming API
    // const response = await fetch('https://api.anthropic.com/v1/messages', {
    //   method: 'POST',
    //   headers: {
    //     'anthropic-version': '2023-06-01',
    //     'content-type': 'application/json',
    //     'x-api-key': Deno.env.get('CLAUDE_API_KEY')
    //   },
    //   body: JSON.stringify({
    //     model: 'claude-3-5-sonnet-20241022',
    //     max_tokens: 1024,
    //     stream: true,
    //     system: `You are a voice command executor. Given user context and a voice command, determine:
// 1. What action needs to be taken
// 2. What system/platform (email, CRM, document, etc.)
// 3. The exact output/result

// User context: ${JSON.stringify(context)}
// 
// Respond with:
// REASONING: [your step-by-step thinking]
// ACTION: [what to do]
// RESULT: [the output]`,
    //     messages: [
    //       {
    //         role: 'user',
    //         content: transcription
    //       }
    //     ]
    //   })
    // });

    // MOCK STREAMING (replace with real Claude above)
    const mockReasoning = [
      "The user wants to send a follow-up email...",
      "This is an email system action...",
      "Context: John at TechCorp, Q2 partnership...",
      "I should generate a professional follow-up email..."
    ];

    let fullReasoning = '';
    for (const chunk of mockReasoning) {
      fullReasoning += chunk + ' ';

      await base44.asServiceRole.entities.Command.update(command_id, {
        streaming_output: [
          {
            type: 'reasoning_chunk',
            content: chunk,
            timestamp: new Date().toISOString()
          }
        ]
      });

      await new Promise(resolve => setTimeout(resolve, 150));
    }

    // Execution phase
    await base44.asServiceRole.entities.Command.update(command_id, {
      status: 'executing',
      claude_reasoning: fullReasoning,
      detected_intent: 'send_email'
    });

    // Send email via Outlook if prospect has email
    let mockResult = {
      action: 'send_email',
      recipient: `${context?.prospect_name || 'John'} at ${context?.prospect_company || 'TechCorp'}`,
      subject: 'Q2 Partnership Proposal Follow-Up',
      body: `Hi ${context?.prospect_name || 'John'},\n\nFollowing up on our Q2 partnership proposal discussion. I believe our solution could significantly streamline your operations.\n\nWould you have time next week for a brief call?\n\nBest regards`
    };

    // Execute email if prospect context has email
    if (prospectContext?.email) {
      try {
        const emailRes = await base44.asServiceRole.functions.invoke('sendEmailViaOutlook', {
          to: prospectContext.email,
          subject: mockResult.subject,
          body: mockResult.body
        });
        mockResult.sent = true;
        mockResult.sent_to = prospectContext.email;
      } catch (emailError) {
        mockResult.email_error = emailError.message;
      }
    }

    await base44.asServiceRole.entities.Command.update(command_id, {
      status: 'completed',
      execution_result: mockResult,
      processing_time_ms: Date.now()
    });

    // Save interaction record if prospect context exists
    if (context?.prospect_name && prospectContext?.prospect_id) {
      await base44.asServiceRole.functions.invoke('saveProspectInteraction', {
        prospect_id: prospectContext.prospect_id,
        command_id,
        interaction_type: context?.system_type || 'other',
        summary: context?.prospect_name ? `Action: ${mockResult.action} for ${context.prospect_name}` : mockResult.action,
        result: mockResult
      });
    }

    return Response.json({
      success: true,
      reasoning: fullReasoning,
      result: mockResult,
      prospect_id: prospectContext?.prospect_id
    });
  } catch (error) {
    if (command_id) {
      await base44.asServiceRole.entities.Command.update(command_id, {
        status: 'failed',
        error_message: error.message
      });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
});