import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { client_id, prospect_name, company_name } = await req.json();

    if (!client_id || !prospect_name) {
      return Response.json({ error: 'client_id and prospect_name required' }, { status: 400 });
    }

    // Find or create prospect
    let prospects = await base44.asServiceRole.entities.Prospect.filter({
      client_id,
      prospect_name,
      company_name: company_name || null
    });

    let prospect = prospects.length > 0 ? prospects[0] : null;

    if (!prospect) {
      prospect = await base44.asServiceRole.entities.Prospect.create({
        client_id,
        prospect_name,
        company_name: company_name || 'Unknown',
        interaction_count: 0
      });
    }

    // Fetch recent interactions
    const interactions = await base44.asServiceRole.entities.ProspectInteraction.filter({
      prospect_id: prospect.id
    }, '-created_date', 5);

    // Build context summary
    const context = {
      prospect_id: prospect.id,
      prospect_name: prospect.prospect_name,
      company_name: prospect.company_name,
      email: prospect.email,
      phone: prospect.phone,
      interaction_count: prospect.interaction_count,
      last_interaction_date: prospect.last_interaction_date,
      notes: prospect.notes,
      recent_interactions: interactions.map(i => ({
        type: i.interaction_type,
        summary: i.summary,
        date: i.created_date
      }))
    };

    return Response.json({
      success: true,
      context
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});