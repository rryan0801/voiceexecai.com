import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { deal_id, prospect_id, client_id } = await req.json();

    // Get deal and interactions
    const [deal, interactions] = await Promise.all([
      base44.entities.DealScore.get(deal_id),
      base44.entities.ProspectInteraction.filter({ prospect_id })
    ]);

    if (!deal) return Response.json({ error: 'Deal not found' }, { status: 404 });

    // Calculate velocity: interactions per day over last 30 days
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const recentInteractions = interactions.filter(i => new Date(i.created_date) > thirtyDaysAgo);
    const velocity = recentInteractions.length / 30;

    // Calculate momentum: is velocity accelerating or decelerating
    const fifteenDaysAgo = new Date(Date.now() - 15 * 24 * 60 * 60 * 1000);
    const last15Days = recentInteractions.filter(i => new Date(i.created_date) > fifteenDaysAgo).length / 15;
    const momentum = last15Days > velocity ? 0.5 : last15Days < velocity ? -0.5 : 0;

    // Identify friction points
    const frictionPoints = [];
    if (deal.win_probability < 25) {
      frictionPoints.push({ factor: 'Low win probability', impact: 90 });
    }
    if (recentInteractions.length === 0) {
      frictionPoints.push({ factor: 'No recent activity', impact: 80 });
    }
    if (!deal.reply_detected) {
      frictionPoints.push({ factor: 'No prospect engagement', impact: 70 });
    }

    // Predict close date based on velocity and momentum
    const daysToClose = velocity > 0 ? Math.round(30 / velocity) : 999;
    const predictedClose = new Date(Date.now() + daysToClose * 24 * 60 * 60 * 1000);

    // Determine acceleration stage
    let accelerationStage = 'stalled';
    if (velocity === 0) accelerationStage = 'stalled';
    else if (momentum > 0.3) accelerationStage = 'hyperdrive';
    else if (momentum > 0) accelerationStage = 'accelerating';
    else if (momentum === 0) accelerationStage = 'moderate';
    else accelerationStage = 'slow';

    // Store physics
    const physics = await base44.entities.DealPhysics.create({
      deal_id,
      prospect_id,
      client_id,
      prospect_name: deal.prospect_name,
      velocity,
      momentum,
      friction_points: frictionPoints,
      predicted_close_date: predictedClose.toISOString().split('T')[0],
      close_confidence: Math.min(90, Math.max(20, 50 + (velocity * 10) + (momentum * 20))),
      acceleration_stage: accelerationStage,
      days_at_current_velocity: recentInteractions.length,
      last_calculated: new Date().toISOString()
    });

    return Response.json({
      success: true,
      physics: {
        velocity: velocity.toFixed(2),
        momentum: momentum.toFixed(2),
        stage: accelerationStage,
        predicted_close: predictedClose.toLocaleDateString(),
        confidence: physics.close_confidence
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});