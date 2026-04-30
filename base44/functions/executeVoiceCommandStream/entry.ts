import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Anthropic from 'npm:@anthropic-ai/sdk@0.39.0';

const anthropic = new Anthropic({ apiKey: Deno.env.get('CLAUDE_API_KEY') });

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  let command_id;

  try {
    const { client_id, command_id: cmdId, transcription, context } = await req.json();
    command_id = cmdId;

    if (!command_id || !transcription) {
      return Response.json({ error: 'command_id and transcription required' }, { status: 400 });
    }

    // Fetch prospect context if provided
    let prospectContext = {};
    if (context?.prospect_name) {
      const getContextRes = await base44.asServiceRole.functions.invoke('getProspectContext', {
        client_id,
        prospect_name: context.prospect_name,
        company_name: context.prospect_company
      });
      prospectContext = getContextRes.context || {};
    }

    await base44.asServiceRole.entities.Command.update(command_id, {
      status: 'reasoning',
      context: { ...context, prospect_context: prospectContext }
    });

    // Build system prompt with full prospect context
    const systemPrompt = `You are a sales assistant AI that interprets voice commands from sales reps and takes action.

Given a voice command transcription and prospect context, you must:
1. Determine the intent (send_email, create_task, log_call, schedule_meeting, other)
2. If intent is send_email, draft a professional, personalized email
3. Return a JSON response

Prospect context:
- Name: ${prospectContext.prospect_name || context?.prospect_name || 'Unknown'}
- Company: ${prospectContext.company_name || context?.prospect_company || 'Unknown'}
- Email: ${prospectContext.email || 'Not available'}
- Past interactions: ${prospectContext.interaction_count || 0}
- Recent history: ${JSON.stringify(prospectContext.recent_interactions || [])}
- Notes: ${prospectContext.notes || 'None'}

Respond with valid JSON only:
{
  "reasoning": "brief explanation of what you understood and why",
  "intent": "send_email | create_task | log_call | schedule_meeting | other",
  "action": "description of what action to take",
  "email_subject": "subject line (if send_email)",
  "email_body": "full email body in plain text (if send_email)",
  "summary": "one line summary of what was done"
}`;

    // Call Claude
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1024,
      messages: [{ role: 'user', content: transcription }],
      system: systemPrompt
    });

    const rawContent = message.content[0].text;

    // Parse Claude's JSON response
    let claudeResponse;
    try {
      const jsonMatch = rawContent.match(/\{[\s\S]*\}/);
      claudeResponse = JSON.parse(jsonMatch ? jsonMatch[0] : rawContent);
    } catch {
      claudeResponse = {
        reasoning: rawContent,
        intent: 'other',
        action: 'Unable to parse structured response',
        summary: 'Voice command processed'
      };
    }

    // Update command with Claude's reasoning
    await base44.asServiceRole.entities.Command.update(command_id, {
      status: 'executing',
      claude_reasoning: claudeResponse.reasoning,
      detected_intent: claudeResponse.intent
    });

    // Build result
    let result = {
      action: claudeResponse.intent,
      summary: claudeResponse.summary,
      recipient: prospectContext.prospect_name || context?.prospect_name,
      subject: claudeResponse.email_subject,
      body: claudeResponse.email_body
    };

    // Send real email via Outlook if intent is email and prospect has email
    if (claudeResponse.intent === 'send_email' && prospectContext?.email) {
      try {
        await base44.asServiceRole.functions.invoke('sendEmailViaOutlook', {
          to: prospectContext.email,
          subject: claudeResponse.email_subject,
          body: claudeResponse.email_body
        });
        result.sent = true;
        result.sent_to = prospectContext.email;
      } catch (emailError) {
        result.email_error = emailError.message;
      }
    }

    await base44.asServiceRole.entities.Command.update(command_id, {
      status: 'completed',
      execution_result: result,
      processing_time_ms: Date.now()
    });

    // Save interaction if prospect exists
    if (prospectContext?.prospect_id) {
      await base44.asServiceRole.functions.invoke('saveProspectInteraction', {
        prospect_id: prospectContext.prospect_id,
        command_id,
        interaction_type: claudeResponse.intent === 'send_email' ? 'email' : context?.system_type || 'other',
        summary: claudeResponse.summary || result.action,
        result
      });
    }

    return Response.json({
      success: true,
      reasoning: claudeResponse.reasoning,
      result,
      prospect_context: prospectContext
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