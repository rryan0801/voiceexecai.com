import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { client_id, report_type } = await req.json();

    if (!client_id) {
      return Response.json({ error: 'Missing client_id' }, { status: 400 });
    }

    // Fetch all deals and predictions
    const scores = await base44.entities.DealScore.filter(
      { client_id },
      '-win_probability',
      200
    );

    const predictions = await base44.entities.PredictionModel.filter(
      { client_id },
      '-predicted_at',
      200
    );

    const reps = await base44.entities.Rep.filter(
      { client_id },
      '-total_commands',
      100
    );

    // Calculate metrics
    const totalDeals = scores.length;
    const highProbability = scores.filter(s => s.win_probability >= 75).length;
    const avgWinProb = scores.length > 0 ? Math.round(scores.reduce((a, s) => a + s.win_probability, 0) / scores.length) : 0;
    const topRep = reps[0];

    // Get recent activity
    const recentCommands = await base44.entities.Command.filter(
      { client_id },
      '-created_date',
      100
    );

    const completedRate = recentCommands.length > 0
      ? Math.round((recentCommands.filter(c => c.status === 'completed').length / recentCommands.length) * 100)
      : 0;

    // Build AI summary
    const prompt = `Generate an executive pipeline report:

Pipeline Overview:
- Total Deals: ${totalDeals}
- High Probability (75%+): ${highProbability}
- Average Win Probability: ${avgWinProb}%
- Command Execution Rate: ${completedRate}%

Top Rep: ${topRep?.full_name} (${topRep?.total_commands} commands, ${topRep?.hours_saved}h saved)

Provide:
1. Pipeline health score (0-100)
2. Key risks to address
3. Opportunities to accelerate deals
4. Rep performance insights
5. 30-day forecast
6. Top 3 strategic recommendations

Format as JSON.`;

    const response = await base44.integrations.Core.InvokeLLM({
      prompt,
      response_json_schema: {
        type: 'object',
        properties: {
          health_score: { type: 'number' },
          key_risks: {
            type: 'array',
            items: { type: 'string' }
          },
          acceleration_opportunities: {
            type: 'array',
            items: { type: 'string' }
          },
          rep_insights: {
            type: 'array',
            items: { type: 'string' }
          },
          forecast_30day: {
            type: 'object',
            properties: {
              expected_closes: { type: 'number' },
              expected_revenue: { type: 'number' }
            }
          },
          strategic_recommendations: {
            type: 'array',
            items: { type: 'string' }
          }
        }
      }
    });

    return Response.json({
      success: true,
      report_type: report_type || 'pipeline',
      timestamp: new Date().toISOString(),
      metrics: {
        total_deals: totalDeals,
        high_probability: highProbability,
        avg_win_probability: avgWinProb,
        execution_rate: completedRate,
        top_rep: topRep?.full_name
      },
      analysis: response
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});