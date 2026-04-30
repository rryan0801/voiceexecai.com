import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { session_id, trigger_event, prospect_id, client_id } = await req.json();

    if (!trigger_event || !prospect_id || !client_id) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const automationResults = [];

    // Get conversation data to check for triggers
    const threadRes = await base44.functions.invoke('getConversationThread', {
      prospect_id,
      client_id
    });

    const thread = threadRes.data?.thread;
    const latestSession = thread?.sessions?.[0];

    // 1. OBJECTION DETECTED → Send collateral
    if (trigger_event === 'objection_detected' && latestSession?.extracted_context?.objections_raised) {
      const objections = latestSession.extracted_context.objections_raised;
      
      // Generate and send objection handling collateral
      const prospectRes = await base44.entities.Prospect.filter(
        { id: prospect_id },
        '-created_date',
        1
      );

      const prospect = prospectRes?.[0];

      const proposalRes = await base44.functions.invoke('generateProposalDoc', {
        prospect_name: prospect?.prospect_name,
        company_name: prospect?.company_name,
        deal_value: 100000,
        doc_type: 'objection_response'
      });

      automationResults.push({
        trigger: 'objection_detected',
        action: 'send_collateral',
        objections: objections,
        document_sent: proposalRes.data?.file_url,
        status: 'completed'
      });

      // Send via email
      if (prospect?.email) {
        await base44.functions.invoke('sendEmailViaOutlook', {
          to: prospect.email,
          subject: `Quick Response to Your Questions - ${prospect.prospect_name}`,
          body: `Hi ${prospect.prospect_name},

Thank you for raising these important points. I've attached a document that addresses your concerns directly.

Objections addressed:
${objections.map(o => `• ${o}`).join('\n')}

Let's schedule a brief call to walk through this together.

Best regards`
        });
      }
    }

    // 2. POSITIVE MOMENTUM → Schedule follow-up call
    if (trigger_event === 'positive_sentiment' && latestSession?.conversation_flow?.sentiment_trajectory === 'improving') {
      const prospectRes = await base44.entities.Prospect.filter(
        { id: prospect_id },
        '-created_date',
        1
      );

      const prospect = prospectRes?.[0];

      const meetingRes = await base44.functions.invoke('scheduleOutlookMeeting', {
        prospect_email: prospect?.email,
        prospect_name: prospect?.prospect_name,
        duration_minutes: 30,
        title: `Follow-up Call: ${prospect?.prospect_name}`
      });

      automationResults.push({
        trigger: 'positive_sentiment',
        action: 'schedule_call',
        meeting_scheduled: meetingRes.data?.calendar_event_id,
        status: 'completed'
      });
    }

    // 3. DEAL SIGNAL DETECTED → Create task for next step
    if (trigger_event === 'deal_signal_detected' && latestSession?.extracted_context?.deal_signals?.length) {
      const signals = latestSession.extracted_context.deal_signals;
      
      const taskRes = await base44.entities.Task.create({
        client_id,
        prospect_id,
        command_id: 'auto_' + Date.now(),
        title: `Action: Deal Signal Detected - ${signals[0]}`,
        description: `Automated task created due to deal signals: ${signals.join(', ')}`,
        due_date: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        status: 'pending',
        priority: 'high',
        assigned_to: user.email
      });

      automationResults.push({
        trigger: 'deal_signal_detected',
        action: 'create_task',
        signals_detected: signals,
        task_id: taskRes.id,
        status: 'completed'
      });
    }

    // 4. NO REPLY → Auto-send follow-up email
    if (trigger_event === 'no_reply_detected') {
      const prospectRes = await base44.entities.Prospect.filter(
        { id: prospect_id },
        '-created_date',
        1
      );

      const prospect = prospectRes?.[0];
      const daysSinceLastInteraction = prospect?.last_interaction_date 
        ? Math.floor((Date.now() - new Date(prospect.last_interaction_date)) / (24 * 60 * 60 * 1000))
        : 0;

      if (daysSinceLastInteraction > 3) {
        const emailRes = await base44.functions.invoke('sendEmailViaOutlook', {
          to: prospect?.email,
          subject: `Quick Check-in: ${prospect?.prospect_name}`,
          body: `Hi ${prospect?.prospect_name},

I wanted to follow up on our previous conversation about how we can help ${prospect?.company_name}.

Are you available for a brief call this week?

Looking forward to connecting.`
        });

        automationResults.push({
          trigger: 'no_reply_detected',
          action: 'send_followup_email',
          days_since_contact: daysSinceLastInteraction,
          email_sent: true,
          status: 'completed'
        });
      }
    }

    // Log automation execution
    await base44.entities.ProspectInteraction.create({
      prospect_id,
      command_id: 'automation_' + Date.now(),
      interaction_type: 'automation',
      summary: `Triggered ${trigger_event} automation - ${automationResults.length} actions executed`,
      result: { automations_executed: automationResults },
      status: 'completed'
    });

    return Response.json({
      success: true,
      trigger_event,
      automations_executed: automationResults.length,
      results: automationResults
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});