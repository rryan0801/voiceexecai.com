import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    const { deal_id, prospect_id, client_id, prospect_name, collaborators = [] } = await req.json();

    const room = await base44.entities.DealRoom.create({
      deal_id,
      prospect_id,
      client_id,
      prospect_name,
      room_name: `${prospect_name} - Deal Room`,
      owner_email: user.email,
      collaborators: [user.email, ...collaborators],
      timeline: {
        target_close: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        current_stage: 'Negotiation',
        estimated_days_to_close: 30
      },
      strategy: 'Multi-threaded approach with key decision makers',
      key_contacts: [
        { name: 'Primary Contact', title: 'VP Sales', engagement_level: 'high' },
        { name: 'Technical Lead', title: 'CTO', engagement_level: 'medium' }
      ],
      notes: [
        { author: user.email, text: 'Room created', created_at: new Date().toISOString() }
      ],
      action_items: [
        { task: 'Send technical proposal', owner: user.email, due: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], status: 'pending' }
      ],
      created_at: new Date().toISOString()
    });

    return Response.json({ success: true, room });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});