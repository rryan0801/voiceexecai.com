import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const apiKey = req.headers.get('X-API-Key');
    const { audio_url, client_id } = await req.json();

    if (!apiKey || !audio_url || !client_id) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Verify client
    const client = await base44.asServiceRole.entities.Client.get(client_id);
    if (!client || client.api_key !== apiKey) {
      return Response.json({ error: 'Invalid client or API key' }, { status: 401 });
    }

    // Create command record
    const command = await base44.asServiceRole.entities.Command.create({
      client_id: client_id,
      audio_url: audio_url,
      status: 'pending'
    });

    // Step 1: Transcribe
    const startTime = Date.now();

    const transcribeResponse = await base44.functions.invoke('transcribeAudio', {
      client_id,
      audio_url,
      command_id: command.id
    });

    if (!transcribeResponse.data.success) {
      return Response.json({ error: 'Transcription failed' }, { status: 500 });
    }

    const transcription = transcribeResponse.data.transcription;

    // Step 2: Parse Intent
    const parseResponse = await base44.functions.invoke('parseIntent', {
      transcription,
      enabled_tools: client.widget_config?.enabled_tools || [],
      command_id: command.id
    });

    if (!parseResponse.data.success) {
      return Response.json({ error: 'Intent parsing failed' }, { status: 500 });
    }

    const { detected_intent, parameters, confidence } = parseResponse.data;

    // Step 3: Execute
    const executeResponse = await base44.functions.invoke('executeCommand', {
      client_id,
      detected_intent,
      parameters,
      command_id: command.id
    });

    if (!executeResponse.data.success) {
      return Response.json({ error: 'Execution failed' }, { status: 500 });
    }

    // Step 4: Track Usage
    await base44.functions.invoke('trackUsage', {
      client_id,
      command_id: command.id,
      request_type: 'transcription_requests'
    });

    const processingTime = Date.now() - startTime;

    // Final update with processing time
    await base44.asServiceRole.entities.Command.update(command.id, {
      processing_time_ms: processingTime
    });

    return Response.json({
      success: true,
      command_id: command.id,
      transcription,
      detected_intent,
      intent_confidence: confidence,
      parameters,
      result: executeResponse.data.result,
      processing_time_ms: processingTime
    });
  } catch (error) {
    console.error('Process command error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});