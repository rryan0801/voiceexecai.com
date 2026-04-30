// Priority #4: Internal task creation
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { client_id, prospect_id, command_id, title, description, due_date, priority, assigned_to } = await req.json();

    if (!client_id || !title) {
      return Response.json({ error: 'client_id and title required' }, { status: 400 });
    }

    const task = await base44.asServiceRole.entities.Task.create({
      client_id,
      prospect_id: prospect_id || null,
      command_id: command_id || null,
      title,
      description: description || '',
      due_date: due_date || null,
      priority: priority || 'medium',
      assigned_to: assigned_to || null,
      status: 'pending'
    });

    return Response.json({ success: true, task_id: task.id, task });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});