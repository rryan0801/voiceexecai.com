import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Anthropic from 'npm:@anthropic-ai/sdk@0.39.0';

const anthropic = new Anthropic({ apiKey: Deno.env.get('CLAUDE_API_KEY') });

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { prospect_id, prospect_name, client_id } = await req.json();

    if (!prospect_id) {
      return Response.json({ error: 'prospect_id required' }, { status: 400 });
    }

    // Get prospect details
    const prospect = await base44.asServiceRole.entities.Prospect.filter(
      { id: prospect_id },
      '-created_date',
      1
    );

    if (!prospect || prospect.length === 0) {
      return Response.json({ error: 'Prospect not found' }, { status: 404 });
    }

    const p = prospect[0];

    // Get all interactions for this prospect
    const interactions = await base44.asServiceRole.entities.ProspectInteraction.filter(
      { prospect_id },
      '-created_date',
      20
    );

    // Get similar won deals (same industry/company size if possible)
    const similarDeals = await base44.asServiceRole.entities.Prospect.filter(
      { client_id, company_name: p.company_name },
      '-updated_date',
      5
    );

    const interactionSummary = interactions.map(i => `${i.interaction_type}: ${i.summary}`).join('\n');

    const prompt = `Rep is about to call ${p.prospect_name} at ${p.company_name}.

Past interactions:
${interactionSummary}

Similar company wins: ${similarDeals.length}

Create a brief meeting prep with:
{
  "key_talking_points": ["...", "..."],
  "objections_likely": ["...", "..."],
  "closing_approach": "...",
  "best_time_to_ask": "...",
  "win_indicators": ["...", "..."],
  "conversation_starter": "...",
  "deal_value_estimate": "..."
}`;

    const message = await anthropic.messages.create({
      model: 'claude-opus-4-5',
      max_tokens: 800,
      messages: [{ role: 'user', content: prompt }]
    });

    let intel;
    try {
      const jsonMatch = message.content[0].text.match(/\{[\s\S]*\}/);
      intel = JSON.parse(jsonMatch ? jsonMatch[0] : message.content[0].text);
    } catch {
      intel = { raw: message.content[0].text };
    }

    return Response.json({
      success: true,
      prospect_name: p.prospect_name,
      company_name: p.company_name,
      intel
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});