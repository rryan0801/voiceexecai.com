import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Anthropic from 'npm:@anthropic-ai/sdk@0.39.0';

const anthropic = new Anthropic({ apiKey: Deno.env.get('CLAUDE_API_KEY') });

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { objection, prospect_name, deal_context } = await req.json();

    if (!objection) {
      return Response.json({ error: 'objection required' }, { status: 400 });
    }

    const prompt = `Sales objection handler.

Prospect: ${prospect_name}
Objection: "${objection}"
Context: ${deal_context || 'Standard B2B SaaS deal'}

Generate immediate response strategies:
{
  "immediate_response": "What to say right now",
  "follow_up_actions": ["action1", "action2", "action3"],
  "reframe_approach": "How to reframe the objection",
  "escalation_path": "If this doesn't work, escalate to...",
  "time_to_follow_up": "How many days before following up"
}`;

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 700,
      messages: [{ role: 'user', content: prompt }]
    });

    let strategies;
    try {
      const jsonMatch = message.content[0].text.match(/\{[\s\S]*\}/);
      strategies = JSON.parse(jsonMatch ? jsonMatch[0] : message.content[0].text);
    } catch {
      strategies = { raw: message.content[0].text };
    }

    return Response.json({ success: true, objection, strategies });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});