import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY');

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { transcript, prospect_name, company_name } = await req.json();

    if (!transcript) {
      return Response.json({ error: 'Missing transcript' }, { status: 400 });
    }

    const analysisPrompt = `Analyze this sales call transcript and extract insights:

Transcript: "${transcript}"
Prospect: ${prospect_name || 'Unknown'}
Company: ${company_name || 'Unknown'}

Respond ONLY with valid JSON (no markdown):
{
  "sentiment": "positive|neutral|negative",
  "engagement_level": 1-10,
  "deal_signals": ["signal1", "signal2"],
  "objections_raised": ["objection1", "objection2"],
  "next_steps_mentioned": ["step1", "step2"],
  "closing_readiness": 1-10,
  "key_topics": ["topic1", "topic2"],
  "rep_performance_score": 1-10,
  "recommended_actions": ["action1", "action2"],
  "summary": "Brief summary of the call"
}`;

    const analysisRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 800,
        messages: [{ role: 'user', content: analysisPrompt }]
      })
    });

    const analysisData = await analysisRes.json();
    const responseText = analysisData.content[0].text;

    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch (e) {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    }

    if (!parsed) {
      return Response.json({ error: 'Failed to parse analysis' }, { status: 500 });
    }

    return Response.json({
      success: true,
      analysis: parsed,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});