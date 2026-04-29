import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { prospect_id, command_id, interaction_type, summary, result } = await req.json();

    if (!prospect_id || !command_id || !interaction_type) {
      return Response.json(
        { error: 'prospect_id, command_id, interaction_type required' },
        { status: 400 }
      );
    }

    // Save interaction
    const interaction = await base44.asServiceRole.entities.ProspectInteraction.create({
      prospect_id,
      command_id,
      interaction_type,
      summary: summary || 'Voice command executed',
      result: result || {},
      status: 'completed'
    });

    // Update prospect record
    const prospect = await base44.asServiceRole.entities.Prospect.update(prospect_id, {
      interaction_count: {
        $inc: 1
      },
      last_interaction_date: new Date().toISOString()
    });

    return Response.json({
      success: true,
      interaction_id: interaction.id
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});