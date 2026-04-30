// Priority #1: Real Whisper transcription via OpenAI
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  let command_id;

  try {
    const { audio_url, command_id: cmdId } = await req.json();
    command_id = cmdId;

    if (!audio_url || !command_id) {
      return Response.json({ error: 'audio_url and command_id required' }, { status: 400 });
    }

    await base44.asServiceRole.entities.Command.update(command_id, { status: 'transcribing' });

    // Download the audio file
    const audioRes = await fetch(audio_url);
    if (!audioRes.ok) throw new Error(`Failed to fetch audio: ${audioRes.status}`);
    const audioBuffer = await audioRes.arrayBuffer();
    const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' });

    // Send to OpenAI Whisper
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');

    const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}`
      },
      body: formData
    });

    if (!whisperRes.ok) {
      const err = await whisperRes.text();
      throw new Error(`Whisper error: ${err}`);
    }

    const { text: transcription } = await whisperRes.json();

    await base44.asServiceRole.entities.Command.update(command_id, {
      transcription,
      status: 'reasoning'
    });

    return Response.json({ transcription });

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