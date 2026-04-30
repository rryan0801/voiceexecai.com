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
1. Determine the intent from: send_email, schedule_meeting, create_task, log_crm, generate_document, other
2. Draft the appropriate content based on intent
3. Extract relevant parameters

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
  "intent": "send_email | schedule_meeting | create_task | log_crm | generate_document | other",
  "action": "description of what action to take",
  "summary": "one line summary of what was done",

  // For send_email:
  "email_subject": "subject line",
  "email_body": "full email body in plain text",

  // For schedule_meeting:
  "meeting_subject": "meeting title",
  "meeting_start": "ISO datetime e.g. 2024-05-01T14:00:00Z",
  "meeting_end": "ISO datetime e.g. 2024-05-01T15:00:00Z",
  "meeting_location": "location or video link",
  "meeting_body": "meeting description",

  // For create_task:
  "task_title": "task title",
  "task_description": "details",
  "task_due_date": "ISO datetime or null",
  "task_priority": "low | medium | high",

  // For log_crm:
  "crm_note": "what to log in CRM",

  // For generate_document:
  "doc_type": "proposal | quote | follow_up | introduction | other",
  "doc_instructions": "specific instructions for the document"
}`;

    // Call Claude
    const message = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1500,
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

    let result = {
      action: claudeResponse.intent,
      summary: claudeResponse.summary,
      recipient: prospectContext.prospect_name || context?.prospect_name
    };

    // ── Intent Routing ──────────────────────────────────────────────────────

    // 1) Send Email via Outlook
    if (claudeResponse.intent === 'send_email' && prospectContext?.email) {
      try {
        await base44.asServiceRole.functions.invoke('sendEmailViaOutlook', {
          to: prospectContext.email,
          subject: claudeResponse.email_subject,
          body: claudeResponse.email_body
        });
        result.sent = true;
        result.sent_to = prospectContext.email;
        result.subject = claudeResponse.email_subject;
        result.body = claudeResponse.email_body;
      } catch (e) {
        result.email_error = e.message;
        result.subject = claudeResponse.email_subject;
        result.body = claudeResponse.email_body;
      }
    } else if (claudeResponse.intent === 'send_email') {
      // No email on file — just return drafted content
      result.subject = claudeResponse.email_subject;
      result.body = claudeResponse.email_body;
      result.note = 'Email drafted but not sent — no email address on file for this prospect.';
    }

    // 2) Schedule Meeting via Outlook Calendar
    if (claudeResponse.intent === 'schedule_meeting') {
      try {
        const meetingRes = await base44.asServiceRole.functions.invoke('scheduleOutlookMeeting', {
          subject: claudeResponse.meeting_subject || `Meeting with ${prospectContext.prospect_name || context?.prospect_name}`,
          attendee_email: prospectContext.email || null,
          start_datetime: claudeResponse.meeting_start,
          end_datetime: claudeResponse.meeting_end,
          body: claudeResponse.meeting_body || '',
          location: claudeResponse.meeting_location || ''
        });
        result.meeting_scheduled = true;
        result.event_id = meetingRes.event_id;
        result.web_link = meetingRes.web_link;
        result.meeting_start = claudeResponse.meeting_start;
        result.meeting_end = claudeResponse.meeting_end;
      } catch (e) {
        result.meeting_error = e.message;
      }
    }

    // 3) Create Internal Task
    if (claudeResponse.intent === 'create_task') {
      try {
        const taskRes = await base44.asServiceRole.functions.invoke('createTask', {
          client_id,
          prospect_id: prospectContext.prospect_id || null,
          command_id,
          title: claudeResponse.task_title || claudeResponse.summary,
          description: claudeResponse.task_description || '',
          due_date: claudeResponse.task_due_date || null,
          priority: claudeResponse.task_priority || 'medium'
        });
        result.task_created = true;
        result.task_id = taskRes.task_id;
        result.task_title = claudeResponse.task_title;
      } catch (e) {
        result.task_error = e.message;
      }
    }

    // 4) Log to HubSpot CRM
    if (claudeResponse.intent === 'log_crm') {
      try {
        const crmRes = await base44.asServiceRole.functions.invoke('logHubspotContact', {
          prospect_name: prospectContext.prospect_name || context?.prospect_name,
          prospect_email: prospectContext.email || null,
          company_name: prospectContext.company_name || context?.prospect_company,
          note: claudeResponse.crm_note || claudeResponse.summary,
          interaction_type: 'voice_command'
        });
        result.crm_logged = true;
        result.crm_contact_id = crmRes.contact_id;
      } catch (e) {
        result.crm_error = e.message;
      }
    }

    // 5) Generate Document
    if (claudeResponse.intent === 'generate_document') {
      try {
        const docRes = await base44.asServiceRole.functions.invoke('generateProposalDoc', {
          prospect_name: prospectContext.prospect_name || context?.prospect_name,
          company_name: prospectContext.company_name || context?.prospect_company,
          doc_type: claudeResponse.doc_type || 'proposal',
          custom_instructions: claudeResponse.doc_instructions || '',
          prospect_context: prospectContext
        });
        result.document_generated = true;
        result.doc_type = docRes.doc_type;
        result.html = docRes.html;
      } catch (e) {
        result.doc_error = e.message;
      }
    }

    // ── Finalize ────────────────────────────────────────────────────────────
    await base44.asServiceRole.entities.Command.update(command_id, {
      status: 'completed',
      execution_result: result,
      processing_time_ms: Date.now()
    });

    // Save interaction if prospect exists
    if (prospectContext?.prospect_id) {
      const interactionTypeMap = {
        send_email: 'email',
        schedule_meeting: 'meeting',
        create_task: 'task',
        log_crm: 'other',
        generate_document: 'document'
      };
      await base44.asServiceRole.functions.invoke('saveProspectInteraction', {
        prospect_id: prospectContext.prospect_id,
        command_id,
        interaction_type: interactionTypeMap[claudeResponse.intent] || 'other',
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