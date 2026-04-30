import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prospect_id, client_id, linkedin_url, signal_type } = await req.json();

    if (!prospect_id || !client_id || !linkedin_url) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Get prospect data
    const prospects = await base44.entities.Prospect.filter(
      { id: prospect_id },
      '-created_date',
      1
    );

    if (!prospects || prospects.length === 0) {
      return Response.json({ error: 'Prospect not found' }, { status: 404 });
    }

    const prospect = prospects[0];

    // Get prediction to determine buying intent
    const predictions = await base44.entities.PredictionModel.filter(
      { prospect_id },
      '-predicted_at',
      1
    );

    const prediction = predictions?.[0];

    // Map signal types to strength and intent scores
    const signalConfig = {
      job_change: { strength: 'critical', intent: 90, detail: 'Prospect changed jobs - new buying authority' },
      company_growth: { strength: 'high', intent: 80, detail: 'Company experienced growth - budget likely available' },
      profile_view: { strength: 'medium', intent: 40, detail: 'Viewed your profile' },
      connection_request: { strength: 'medium', intent: 50, detail: 'Sent connection request' },
      message: { strength: 'high', intent: 75, detail: 'Sent direct message' },
      content_engagement: { strength: 'medium', intent: 60, detail: 'Engaged with your content' },
      headline_change: { strength: 'high', intent: 70, detail: 'Updated profile headline' },
      endorsement: { strength: 'low', intent: 30, detail: 'Endorsed your skills' }
    };

    const config = signalConfig[signal_type] || { strength: 'medium', intent: 50, detail: 'LinkedIn activity detected' };

    // Create signal record
    const signal = await base44.entities.LinkedInSignal.create({
      prospect_id,
      client_id,
      prospect_name: prospect.prospect_name,
      linkedin_url,
      signal_type,
      signal_detail: config.detail,
      signal_strength: config.strength,
      occurred_at: new Date().toISOString(),
      buying_intent_score: config.intent,
      metadata: {
        company_name: prospect.company_name,
        current_prediction: prediction?.win_prediction || 'N/A'
      }
    });

    // Update prospect's last interaction
    await base44.entities.Prospect.update(prospect_id, {
      last_interaction_date: new Date().toISOString(),
      interaction_count: (prospect.interaction_count || 0) + 1
    });

    // If critical signal, trigger automation
    if (config.strength === 'critical') {
      await base44.functions.invoke('triggerWorkflowAutomation', {
        prospect_id,
        client_id,
        trigger_event: 'linkedin_critical_signal'
      });
    }

    return Response.json({
      success: true,
      signal_id: signal.id,
      prospect_name: prospect.prospect_name,
      signal_type,
      signal_strength: config.strength,
      buying_intent_score: config.intent,
      action_recommended: config.strength === 'critical' ? 'Immediate outreach suggested' : 'Monitor'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});