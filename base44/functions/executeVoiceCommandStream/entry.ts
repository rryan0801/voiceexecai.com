import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Anthropic from 'npm:@anthropic-ai/sdk@0.39.0';

const anthropic = new Anthropic({ apiKey: Deno.env.get('CLAUDE_API_KEY') });

// Fix #4: Validate and normalize datetime strings from Claude
function validateDatetime(dt, label) {
  if (!dt) return { valid: false, error: `No ${label} time provided. Please say a specific date and time (e.g. "tomorrow at 2pm").` };
  const date = new Date(dt);
  if (isNaN(date.getTime())) return { valid: false, error: `Couldn't understand the ${label} time "${dt}". Please say a specific date and time.` };
  if (date < new Date()) return { valid: false, error: `The ${label} time is in the past. Please provide a future date and time.` };
  return { valid: true };
}

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

    // Today's date helps Claude resolve relative times like "next Tuesday"
    const today = new Date().toISOString();

    const systemPrompt = `You are a sales assistant AI that interprets voice commands from sales reps and takes action.

Today's date/time (UTC): ${today}

Given a voice command transcription and prospect context, you must:
1. Determine the intent from: send_email, schedule_meeting, create_task, log_crm, generate_document, other
2. Draft the appropriate content based on intent
3. Extract relevant parameters. For ALL datetime fields, resolve relative terms like "tomorrow", "next Tuesday at 3pm", "this Friday" into full ISO 8601 UTC datetime strings.

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

  "email_subject": "subject line (for send_email)",
  "email_body": "full email body in plain text (for send_email)",

  "meeting_subject": "meeting title (for schedule_meeting)",
  "meeting_start": "ISO datetime UTC e.g. 2024-05-01T14:00:00Z (for schedule_meeting)",
  "meeting_end": "ISO datetime UTC e.g. 2024-05-01T15:00:00Z (for schedule_meeting — default 1 hour after start)",
  "meeting_location": "location or video link (for schedule_meeting)",
  "meeting_body": "meeting description (for schedule_meeting)",

  "task_title": "task title (for create_task)",
  "task_description": "details (for create_task)",
  "task_due_date": "ISO datetime or null (for create_task)",
  "task_priority": "low | medium | high (for create_task)",

  "crm_note": "what to log in CRM (for log_crm)",

  "doc_type": "proposal | quote | follow_up | introduction | other (for generate_document)",
  "doc_instructions": "specific instructions (for generate_document)"
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

    await base44.asServiceRole.entities.Command.update(command_id, {
      status: 'executing',
      claude_reasoning: claudeResponse.reasoning,
      detected_intent: claudeResponse.intent
    });

    let result = {
      action: claudeResponse.intent,
      summary: claudeResponse.summary,
      recipient: prospectContext.prospect_name || context?.prospect_name,
      warnings: []
    };

    // ── Intent Routing ──────────────────────────────────────────────────────

    // 1) Send Email via Outlook
    if (claudeResponse.intent === 'send_email') {
      result.subject = claudeResponse.email_subject;
      result.body = claudeResponse.email_body;

      // Fix #2: Check Outlook connected first
      let outlookConnected = false;
      try {
        await base44.asServiceRole.functions.invoke('checkOutlookConnection', {});
        outlookConnected = true;
      } catch {
        outlookConnected = false;
      }

      if (!outlookConnected) {
        result.sent = false;
        result.warnings.push('⚠️ Outlook is not connected. Your email has been drafted below but NOT sent. Go to the Prospects page and connect Outlook to enable sending.');
      } else if (!prospectContext?.email) {
        // Fix #3: No prospect email
        result.sent = false;
        result.warnings.push(`⚠️ No email address found for ${prospectContext.prospect_name || context?.prospect_name || 'this prospect'}. Your email has been drafted below. Open the Prospects page and add their email address, then try again.`);
      } else {
        try {
          await base44.asServiceRole.functions.invoke('sendEmailViaOutlook', {
            to: prospectContext.email,
            subject: claudeResponse.email_subject,
            body: claudeResponse.email_body
          });
          result.sent = true;
          result.sent_to = prospectContext.email;
        } catch (e) {
          result.sent = false;
          result.warnings.push(`⚠️ Email sending failed: ${e.message}. Your draft is saved below.`);
        }
      }
    }

    // 2) Schedule Meeting via Outlook Calendar
    if (claudeResponse.intent === 'schedule_meeting') {
      // Fix #2: Check Outlook connected
      let outlookConnected = false;
      try {
        await base44.asServiceRole.functions.invoke('checkOutlookConnection', {});
        outlookConnected = true;
      } catch {
        outlookConnected = false;
      }

      if (!outlookConnected) {
        result.meeting_scheduled = false;
        result.warnings.push('⚠️ Outlook is not connected. Connect Outlook on the Prospects page to schedule meetings.');
      } else {
        // Fix #4: Validate datetime before calling API
        const startCheck = validateDatetime(claudeResponse.meeting_start, 'start');
        const endCheck = validateDatetime(claudeResponse.meeting_end, 'end');

        if (!startCheck.valid) {
          result.meeting_scheduled = false;
          result.warnings.push(`⚠️ ${startCheck.error}`);
        } else if (!endCheck.valid) {
          // Auto-fix: default end = start + 1 hour
          const autoEnd = new Date(new Date(claudeResponse.meeting_start).getTime() + 3600000).toISOString();
          claudeResponse.meeting_end = autoEnd;
          result.warnings.push('ℹ️ No end time specified — defaulted to 1 hour meeting.');
        }

        if (result.meeting_scheduled !== false) {
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
            if (!prospectContext?.email) {
              result.warnings.push(`ℹ️ Meeting created but ${prospectContext.prospect_name || 'the prospect'} was not invited — no email address on file.`);
            }
          } catch (e) {
            result.meeting_scheduled = false;
            result.warnings.push(`⚠️ Meeting scheduling failed: ${e.message}`);
          }
        }
      }
    }

    // 3) Create Internal Task — Fix #5: Always works, but surface clear confirmation
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
        result.task_title = claudeResponse.task_title || claudeResponse.summary;
        result.task_priority = claudeResponse.task_priority || 'medium';
        result.task_due_date = claudeResponse.task_due_date || null;
      } catch (e) {
        result.task_created = false;
        result.warnings.push(`⚠️ Task creation failed: ${e.message}`);
      }
    }

    // 4) Log to HubSpot CRM — Fix #6: Edge case handling
    if (claudeResponse.intent === 'log_crm') {
      const prospectIdentifier = prospectContext.prospect_name || context?.prospect_name;
      if (!prospectIdentifier) {
        result.crm_logged = false;
        result.warnings.push('⚠️ No prospect name provided. Please say the prospect\'s name when logging to CRM.');
      } else {
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
          result.crm_logged = false;
          result.warnings.push(`⚠️ CRM logging failed: ${e.message}`);
        }
      }
    }

    // 5) Generate Document — Fix #6: Edge case handling
    if (claudeResponse.intent === 'generate_document') {
      const prospectName = prospectContext.prospect_name || context?.prospect_name;
      if (!prospectName) {
        result.document_generated = false;
        result.warnings.push('⚠️ No prospect name provided. Please specify who the document is for.');
      } else {
        try {
          const docRes = await base44.asServiceRole.functions.invoke('generateProposalDoc', {
            prospect_name: prospectName,
            company_name: prospectContext.company_name || context?.prospect_company,
            doc_type: claudeResponse.doc_type || 'proposal',
            custom_instructions: claudeResponse.doc_instructions || '',
            prospect_context: prospectContext
          });
          result.document_generated = true;
          result.doc_type = docRes.doc_type;
          result.html = docRes.html;
        } catch (e) {
          result.document_generated = false;
          result.warnings.push(`⚠️ Document generation failed: ${e.message}`);
        }
      }
    }

    // Remove empty warnings array
    if (result.warnings.length === 0) delete result.warnings;

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
    return Response.json({ error: error.message, user_message: 'Something went wrong processing your command. Please try again.' }, { status: 500 });
  }
});