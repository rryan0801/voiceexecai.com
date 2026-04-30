// Fix #1: Transcription with quality validation
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const GARBAGE_PHRASES = [
  'you', 'the', 'a', 'thank you', 'thanks', 'bye', 'okay', 'ok', 'um', 'uh', 'hmm'
];

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

    // Fix: Check audio is not too short (< 1KB = silence/noise)
    if (audioBuffer.byteLength < 1000) {
      const msg = 'Audio too short — please hold the button and speak clearly before releasing.';
      await base44.asServiceRole.entities.Command.update(command_id, {
        status: 'failed',
        error_message: msg
      });
      return Response.json({ error: msg, user_message: msg }, { status: 422 });
    }

    const audioBlob = new Blob([audioBuffer], { type: 'audio/webm' });

    // Send to OpenAI Whisper
    const formData = new FormData();
    formData.append('file', audioBlob, 'audio.webm');
    formData.append('model', 'whisper-1');
    formData.append('language', 'en');

    const whisperRes = await fetch('https://api.openai.com/v1/audio/transcriptions', {
      method: 'POST',
      headers: { 'Authorization': `Bearer ${Deno.env.get('OPENAI_API_KEY')}` },
      body: formData
    });

    if (!whisperRes.ok) {
      const err = await whisperRes.text();
      throw new Error(`Transcription service error: ${err}`);
    }

    const { text: transcription } = await whisperRes.json();

    // Fix #1: Validate transcription quality
    if (!transcription || transcription.trim().length === 0) {
      const msg = 'No speech detected — please speak clearly and try again.';
      await base44.asServiceRole.entities.Command.update(command_id, {
        status: 'failed',
        error_message: msg
      });
      return Response.json({ error: msg, user_message: msg }, { status: 422 });
    }

    const cleaned = transcription.trim().toLowerCase();
    const isGarbage = GARBAGE_PHRASES.includes(cleaned) || cleaned.length < 5;
    if (isGarbage) {
      const msg = `We heard "${transcription}" — that's too short to act on. Please describe what you'd like to do in more detail.`;
      await base44.asServiceRole.entities.Command.update(command_id, {
        status: 'failed',
        error_message: msg
      });
      return Response.json({ error: msg, user_message: msg }, { status: 422 });
    }

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
    return Response.json({ error: error.message, user_message: 'Transcription failed — please try again.' }, { status: 500 });
  }
});