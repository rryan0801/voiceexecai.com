// Fix #1: Transcription with quality validation
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

const GARBAGE_PHRASES = [
  'you', 'the', 'a', 'thank you', 'thanks', 'bye', 'okay', 'ok', 'um', 'uh', 'hmm'
];

// ---- Paid-plan gate (audit 2026-11-07). Server-side only: reads the admin-only
// Subscription record written by stripeWebhook; falls back to a live Stripe lookup
// for subscribers from before that record existed. Admins always pass.
async function requirePaidPlan(base44) {
  let user = null;
  try { user = await base44.auth.me(); } catch (_e) { user = null; }
  if (!user) return Response.json({ error: 'Please sign in.' }, { status: 401 });
  if (user.role === 'admin') return null;
  const email = String(user.email || '').toLowerCase();
  const ACTIVE = ['active', 'past_due'];
  try {
    const subs = await base44.asServiceRole.entities.Subscription.filter({ user_email: email });
    if (subs.some((s) => ACTIVE.includes(s.status))) return null;
  } catch (_e) { /* fall through to Stripe */ }
  try {
    const key = Deno.env.get('STRIPE_SECRET_KEY');
    if (key) {
      const h = { Authorization: `Bearer ${key}` };
      const c = await (await fetch(`https://api.stripe.com/v1/customers?email=${encodeURIComponent(email)}&limit=3`, { headers: h })).json();
      for (const cu of c?.data || []) {
        const s = await (await fetch(`https://api.stripe.com/v1/subscriptions?customer=${cu.id}&status=active&limit=1`, { headers: h })).json();
        if ((s?.data || []).length > 0) return null;
      }
    }
  } catch (_e) { /* treat as not subscribed */ }
  return Response.json({ error: 'A paid plan is needed for voice commands. See voiceexecai.com/pricing.', needs_plan: true }, { status: 402 });
}

Deno.serve(async (req) => {
  const base44 = createClientFromRequest(req);
  { const denied = await requirePaidPlan(base44); if (denied) return denied; }
  let command_id;

  try {
    const { audio_url, command_id: cmdId } = await req.json();
    command_id = cmdId;

    if (!audio_url || !command_id) {
      return Response.json({ error: 'audio_url and command_id required' }, { status: 400 });
    }

    // Ownership (audit 2026-11-07): the caller must be able to see this command.
    try {
      const own = await base44.entities.Command.get(command_id);
      if (!own) throw new Error('not found');
    } catch (_e) {
      command_id = undefined;
      return Response.json({ error: 'Command not found' }, { status: 404 });
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