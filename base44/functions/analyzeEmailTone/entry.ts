import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Anthropic from 'npm:@anthropic-ai/sdk@0.39.0';

const anthropic = new Anthropic({ apiKey: Deno.env.get('CLAUDE_API_KEY') });

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { rep_email, client_id, draft_email } = await req.json();

    if (!draft_email) {
      return Response.json({ error: 'draft_email required' }, { status: 400 });
    }

    // Get rep's past emails to match tone
    const commands = await base44.asServiceRole.entities.Command.filter(
      { client_id, created_by: rep_email, detected_intent: 'send_email' },
      '-created_date',
      10
    );

    const pastEmails = commands
      .filter(c => c.execution_result?.body)
      .map(c => c.execution_result.body)
      .slice(0, 3)
      .join('\n---\n');

    const prompt = `The rep's typical tone (from 3 recent emails):
${pastEmails || 'No past emails available'}

Now analyze and rewrite this draft to match their style:
${draft_email}

Return JSON:
{
  "tone_analysis": "professional", 
  "rewritten_email": "...",
  "style_notes": "...",
  "casualness_level": 0-10
}`;

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 1000,
      messages: [{ role: 'user', content: prompt }]
    });

    let result;
    try {
      const jsonMatch = message.content[0].text.match(/\{[\s\S]*\}/);
      result = JSON.parse(jsonMatch ? jsonMatch[0] : message.content[0].text);
    } catch {
      result = { raw: message.content[0].text };
    }

    return Response.json({ success: true, result });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});