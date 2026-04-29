import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { client_id, audio_url, context } = await req.json();

    if (!client_id || !audio_url) {
      return Response.json({ error: 'client_id and audio_url required' }, { status: 400 });
    }

    // Create initial command record
    const command = await base44.asServiceRole.entities.Command.create({
      client_id,
      audio_url,
      context: context || {},
      status: 'pending',
      streaming_output: []
    });

    return Response.json({
      success: true,
      command_id: command.id,
      status: 'created'
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});