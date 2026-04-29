import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { audio_url, command_id } = await req.json();

    if (!audio_url || !command_id) {
      return Response.json({ error: 'audio_url and command_id required' }, { status: 400 });
    }

    // Update command status
    await base44.asServiceRole.entities.Command.update(command_id, {
      status: 'transcribing'
    });

    // TODO: Replace with real Google Gemini streaming API
    // Using streaming via fetch with response.body for Server-Sent Events

    const mockTranscription = "Generate a follow-up email to John at TechCorp about our Q2 partnership proposal";

    // Simulate streaming chunks (word by word)
    const chunks = mockTranscription.split(' ');
    let fullTranscription = '';

    for (const chunk of chunks) {
      fullTranscription += (fullTranscription ? ' ' : '') + chunk;

      // Add streaming output entry
      await base44.asServiceRole.entities.Command.update(command_id, {
        streaming_output: [
          {
            type: 'transcription_chunk',
            content: chunk,
            timestamp: new Date().toISOString()
          }
        ]
      });

      // Small delay to simulate streaming
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Final update with complete transcription
    await base44.asServiceRole.entities.Command.update(command_id, {
      transcription: fullTranscription,
      status: 'reasoning'
    });

    return Response.json({
      success: true,
      transcription: fullTranscription
    });
  } catch (error) {
    if (command_id) {
      await base44.asServiceRole.entities.Command.update(command_id, {
        status: 'failed',
        error_message: error.message
      });
    }
    return Response.json({ error: error.message }, { status: 500 });
  }
});