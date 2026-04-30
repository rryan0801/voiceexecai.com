import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const base44Service = base44.asServiceRole;

    const { sequence_id, prospect_id, client_id } = await req.json();

    // Get the sequence
    const sequence = await base44Service.entities.FollowUpSequence.get(sequence_id);
    if (!sequence) {
      return Response.json({ error: 'Sequence not found' }, { status: 404 });
    }

    // Get prospect engagement signals
    const [emailEvents, smsThreads] = await Promise.all([
      base44Service.entities.EmailTrackingEvent.filter({ prospect_id }),
      base44Service.entities.SMSThread.filter({ prospect_id })
    ]);

    // Analyze engagement
    const recentEmail = emailEvents[0];
    const recentSMS = smsThreads[0];

    let nextStepIndex = sequence.steps.findIndex(s => s.status === 'pending');
    if (nextStepIndex === -1) return Response.json({ error: 'No pending steps' }, { status: 400 });

    const nextStep = sequence.steps[nextStepIndex];

    // Smart branching based on engagement
    let skipStep = false;
    let alternateAction = null;

    // If email opened but not clicked, send email again (skip wait)
    if (recentEmail?.open_count > 0 && recentEmail?.click_count === 0 && nextStep.delay_days > 2) {
      skipStep = true;
      alternateAction = 'send_email'; // Send now instead of waiting
    }

    // If SMS reply detected, skip automated emails and move to manual touch
    if (recentSMS?.last_message_from === 'prospect') {
      skipStep = nextStep.action === 'send_email'; // Skip email if SMS is active
      alternateAction = 'create_task'; // Create manual follow-up task instead
    }

    // Execute the step or alternate
    let stepStatus = 'executed';
    const actionToTake = alternateAction || nextStep.action;

    if (actionToTake === 'send_email') {
      // Send email
      await base44Service.functions.invoke('sendEmailViaOutlook', {
        prospect_email: sequence.prospect_email,
        subject: nextStep.subject,
        body: nextStep.body
      });
    } else if (actionToTake === 'create_task') {
      // Create task
      await base44Service.entities.Task.create({
        client_id,
        prospect_id,
        title: nextStep.task_title || 'Manual follow-up',
        description: `Smart sequence branching: ${alternateAction ? 'Engagement-based alternate action' : 'Standard sequence step'}`,
        due_date: new Date(),
        priority: 'high'
      });
    }

    // Update sequence with new step status
    sequence.steps[nextStepIndex].status = stepStatus;
    sequence.steps[nextStepIndex].executed_at = new Date().toISOString();
    sequence.completed_steps = (sequence.completed_steps || 0) + 1;

    await base44Service.entities.FollowUpSequence.update(sequence_id, {
      steps: sequence.steps,
      completed_steps: sequence.completed_steps
    });

    return Response.json({
      success: true,
      action_taken: actionToTake,
      was_intelligent_branch: !!alternateAction,
      reason: alternateAction ? 'Engagement signal detected - branched to alternate action' : 'Standard sequence execution'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});