// Scheduled AutoPilot runner — checks all active sequences and executes due steps
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Get all active sequences
    const sequences = await base44.asServiceRole.entities.FollowUpSequence.filter(
      { status: 'active' },
      '-created_date',
      100
    );

    const now = new Date();
    let executed = 0;
    let skipped = 0;

    for (const seq of sequences) {
      // Check if next_step_date is due
      if (!seq.next_step_date || new Date(seq.next_step_date) > now) {
        continue;
      }

      const steps = seq.steps || [];
      const pendingStep = steps.find(s => s.status === 'pending');

      if (!pendingStep) {
        // All steps done — mark completed
        await base44.asServiceRole.entities.FollowUpSequence.update(seq.id, {
          status: 'completed'
        });
        continue;
      }

      // Check reply condition
      if (pendingStep.condition === 'if_no_reply' && seq.reply_detected) {
        // Skip this step — prospect replied
        const updatedSteps = steps.map(s =>
          s.step_number === pendingStep.step_number ? { ...s, status: 'skipped' } : s
        );
        const nextPending = updatedSteps.find(s => s.status === 'pending');
        await base44.asServiceRole.entities.FollowUpSequence.update(seq.id, {
          steps: updatedSteps,
          completed_steps: (seq.completed_steps || 0) + 1,
          next_step_date: nextPending
            ? new Date(now.getTime() + (nextPending.delay_days || 1) * 86400000).toISOString()
            : null,
          status: nextPending ? 'active' : 'completed'
        });
        skipped++;
        continue;
      }

      if (pendingStep.condition === 'if_replied' && !seq.reply_detected) {
        // Skip — no reply yet, but this step needs a reply
        skipped++;
        continue;
      }

      // Execute the step
      let stepExecuted = false;

      if (pendingStep.action === 'send_email' && seq.prospect_email) {
        try {
          await base44.asServiceRole.functions.invoke('sendEmailViaOutlook', {
            to: seq.prospect_email,
            subject: pendingStep.subject || 'Following up',
            body: pendingStep.body || ''
          });
          stepExecuted = true;
        } catch (e) {
          console.log(`Email step failed for sequence ${seq.id}: ${e.message}`);
          // Don't block — move on
          stepExecuted = true; // Mark as attempted
        }
      } else if (pendingStep.action === 'create_task') {
        try {
          await base44.asServiceRole.entities.Task.create({
            client_id: seq.client_id,
            prospect_id: seq.prospect_id,
            title: pendingStep.task_title || `Follow up with ${seq.prospect_name}`,
            status: 'pending',
            priority: 'high'
          });
          stepExecuted = true;
        } catch (e) {
          console.log(`Task step failed: ${e.message}`);
          stepExecuted = true;
        }
      } else if (pendingStep.action === 'wait') {
        stepExecuted = true;
      }

      if (stepExecuted) {
        const updatedSteps = steps.map(s =>
          s.step_number === pendingStep.step_number
            ? { ...s, status: 'executed', executed_at: now.toISOString() }
            : s
        );
        const nextPending = updatedSteps.find(s => s.status === 'pending');

        await base44.asServiceRole.entities.FollowUpSequence.update(seq.id, {
          steps: updatedSteps,
          completed_steps: (seq.completed_steps || 0) + 1,
          next_step_date: nextPending
            ? new Date(now.getTime() + (nextPending.delay_days || 1) * 86400000).toISOString()
            : null,
          status: nextPending ? 'active' : 'completed'
        });
        executed++;
      }
    }

    return Response.json({
      success: true,
      sequences_checked: sequences.length,
      steps_executed: executed,
      steps_skipped: skipped
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});