// AutoPilot — AI generates and launches a personalized follow-up sequence
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Anthropic from 'npm:@anthropic-ai/sdk@0.39.0';

const anthropic = new Anthropic({ apiKey: Deno.env.get('CLAUDE_API_KEY') });

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { prospect_id, prospect_name, prospect_email, company_name, client_id } = await req.json();

    if (!prospect_id || !prospect_email) {
      return Response.json({ error: 'prospect_id and prospect_email required' }, { status: 400 });
    }

    // Fetch recent interactions for context
    const interactions = await base44.asServiceRole.entities.ProspectInteraction.filter(
      { prospect_id },
      '-created_date',
      5
    );

    const today = new Date();

    const prompt = `You are an expert sales sequence strategist. Generate a 3-step autonomous follow-up sequence for a sales rep.

Prospect: ${prospect_name}
Company: ${company_name}
Email: ${prospect_email}
Recent interactions: ${JSON.stringify(interactions.map(i => ({ type: i.interaction_type, summary: i.summary })))}
Today: ${today.toISOString()}

Create a realistic, personalized 3-step sequence. Each step should feel human and natural — not salesy.

Respond with ONLY valid JSON:
{
  "steps": [
    {
      "step_number": 1,
      "action": "send_email",
      "delay_days": 0,
      "condition": "always",
      "subject": "email subject",
      "body": "full email body — friendly, concise, 3-4 sentences max"
    },
    {
      "step_number": 2,
      "action": "send_email",
      "delay_days": 3,
      "condition": "if_no_reply",
      "subject": "follow up subject",
      "body": "brief follow-up email body"
    },
    {
      "step_number": 3,
      "action": "create_task",
      "delay_days": 7,
      "condition": "if_no_reply",
      "task_title": "Call ${prospect_name} — final follow-up attempt"
    }
  ]
}`;

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1200,
      messages: [{ role: 'user', content: prompt }]
    });

    const raw = message.content[0].text;
    const jsonMatch = raw.match(/\{[\s\S]*\}/);
    const parsed = JSON.parse(jsonMatch ? jsonMatch[0] : raw);
    const steps = parsed.steps || [];

    // Set execution timestamps
    const stepsWithDates = steps.map(step => ({
      ...step,
      status: 'pending',
      executed_at: null
    }));

    const nextStepDate = new Date(today.getTime() + (steps[0]?.delay_days || 0) * 86400000);

    // Create the sequence record
    const sequence = await base44.asServiceRole.entities.FollowUpSequence.create({
      client_id,
      prospect_id,
      prospect_name,
      prospect_email,
      status: 'active',
      steps: stepsWithDates,
      total_steps: stepsWithDates.length,
      completed_steps: 0,
      next_step_date: nextStepDate.toISOString(),
      reply_detected: false
    });

    return Response.json({
      success: true,
      sequence_id: sequence.id,
      steps: stepsWithDates.length,
      message: `AutoPilot sequence created with ${stepsWithDates.length} steps for ${prospect_name}`
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});