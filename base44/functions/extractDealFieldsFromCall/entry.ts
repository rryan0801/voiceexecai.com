import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const CLAUDE_API_KEY = Deno.env.get('CLAUDE_API_KEY');

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { transcript, current_deal_data } = await req.json();

    if (!transcript) {
      return Response.json({ error: 'Missing transcript' }, { status: 400 });
    }

    const extractPrompt = `Extract and infer deal fields from this sales call transcript.

Transcript: "${transcript}"

Current data: ${JSON.stringify(current_deal_data || {})}

Extract or infer:
- Deal value/amount (currency amounts mentioned)
- Deal stage (prospect seems at what stage?)
- Decision timeline (when will they decide?)
- Key stakeholders mentioned
- Competitive threats
- Budget confirmed (yes/no/partial)
- Pain points mentioned
- Success criteria they mentioned
- Next meeting/call date mentioned

Respond ONLY with valid JSON (no markdown):
{
  "deal_value": "number|null",
  "deal_stage": "prospecting|qualification|proposal|negotiation|closing|null",
  "decision_timeline": "string|null",
  "stakeholders": ["name1", "name2"],
  "competitors_mentioned": ["competitor1"],
  "budget_confirmed": true|false|null,
  "pain_points": ["pain1", "pain2"],
  "success_criteria": ["criteria1", "criteria2"],
  "next_meeting_date": "YYYY-MM-DD|null",
  "confidence_level": 0.0-1.0,
  "fields_to_update": {
    "field_name": "new_value"
  }
}`;

    const extractRes = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'x-api-key': CLAUDE_API_KEY,
        'anthropic-version': '2023-06-01',
        'content-type': 'application/json'
      },
      body: JSON.stringify({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1000,
        messages: [{ role: 'user', content: extractPrompt }]
      })
    });

    const extractData = await extractRes.json();
    const responseText = extractData.content[0].text;

    let parsed;
    try {
      parsed = JSON.parse(responseText);
    } catch (e) {
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      parsed = jsonMatch ? JSON.parse(jsonMatch[0]) : null;
    }

    if (!parsed) {
      return Response.json({ error: 'Failed to parse extraction' }, { status: 500 });
    }

    return Response.json({
      success: true,
      extracted_fields: parsed,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});