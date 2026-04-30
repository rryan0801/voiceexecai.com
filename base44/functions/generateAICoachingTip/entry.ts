import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY');

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { transcript, rep_name, call_outcome } = await req.json();

    if (!transcript) {
      return Response.json({ error: 'Missing transcript' }, { status: 400 });
    }

    const coachingPrompt = `Provide actionable coaching tips for this sales rep based on their call.

Transcript: "${transcript}"
Rep: ${rep_name || 'Unknown'}
Call Outcome: ${call_outcome || 'Unknown'}

Analyze their:
- Opening approach
- Listening vs talking ratio
- Objection handling
- Closing attempt
- Overall pacing and tone

Respond ONLY with valid JSON (no markdown):
{
  "overall_score": 1-10,
  "strengths": ["strength1", "strength2"],
  "areas_for_improvement": ["area1", "area2"],
  "specific_coaching_tips": [
    {
      "moment": "When they did X",
      "issue": "What went wrong/could be better",
      "suggested_approach": "Try saying/doing this instead"
    }
  ],
  "best_moment": "When they did well and why",
  "next_call_focus": "1-2 things to focus on in next call"
}`;

    const coachingRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [{ role: 'user', content: coachingPrompt }]
      })
    });

    const coachingData = await coachingRes.json();
    const responseText = coachingData.content[0].text;

    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch (e) {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    }

    if (!parsed) {
      return Response.json({ error: 'Failed to parse coaching tips' }, { status: 500 });
    }

    return Response.json({
      success: true,
      coaching: parsed,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});