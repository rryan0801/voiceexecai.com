// WhatsApp webhook handler — receives voice notes from reps and executes commands
// Uses Twilio WhatsApp API (rep sends voice note → we transcribe + execute)
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    // Parse Twilio webhook form data
    const formData = await req.formData();
    const from = formData.get('From') || '';          // e.g. whatsapp:+12125551234
    const body = formData.get('Body') || '';          // text message (if any)
    const mediaUrl = formData.get('MediaUrl0') || ''; // voice note URL
    const mediaType = formData.get('MediaContentType0') || '';

    const phoneNumber = from.replace('whatsapp:', '');

    // Find the rep by WhatsApp number
    const reps = await base44.asServiceRole.entities.Rep.filter({ whatsapp_number: phoneNumber });

    if (!reps || reps.length === 0) {
      // Auto-register unknown numbers with a welcome message
      return sendWhatsAppReply(
        from,
        `👋 Welcome to VoiceRep AI!\n\nYour number (${phoneNumber}) isn't registered yet.\n\nPlease ask your admin to add your WhatsApp number in the Team section.\n\n— VoiceRep AI 🤖`
      );
    }

    const rep = reps[0];

    // Text command handling
    if (body && !mediaUrl) {
      const textLower = body.toLowerCase().trim();

      if (textLower === 'status' || textLower === 'help') {
        return sendWhatsAppReply(from,
          `🎤 *VoiceRep AI* — Your Voice Sales Assistant\n\n` +
          `*Commands:*\n` +
          `• Send a voice note → I'll execute any sales action\n` +
          `• Type your command → I'll handle it\n` +
          `• "status" → See this help message\n\n` +
          `*You can say things like:*\n` +
          `_"Send a follow-up email to John at Acme"_\n` +
          `_"Schedule a meeting for tomorrow at 2pm with Sarah"_\n` +
          `_"Create a task to review the Q2 proposal"_\n\n` +
          `Ready when you are! 🚀`
        );
      }

      // Text command — process as transcription directly
      return await processCommand(base44, from, rep, body);
    }

    // Voice note handling
    if (mediaUrl && (mediaType?.includes('audio') || mediaType?.includes('ogg'))) {
      // Send immediate acknowledgment
      await sendWhatsAppReplyRaw(from, '⏳ Got your voice note! Transcribing and processing...');

      // Download the audio from Twilio (requires credentials)
      const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID');
      const twilioToken = Deno.env.get('TWILIO_AUTH_TOKEN');

      const audioRes = await fetch(mediaUrl, {
        headers: {
          'Authorization': 'Basic ' + btoa(`${twilioSid}:${twilioToken}`)
        }
      });

      const audioBlob = await audioRes.blob();

      // Upload to Base44 storage
      const uploadRes = await base44.asServiceRole.integrations.Core.UploadFile({ file: audioBlob });
      const audioUrl = uploadRes.file_url;

      if (!audioUrl) {
        return sendWhatsAppReply(from, '❌ Failed to process your voice note. Please try again.');
      }

      // Create command record
      const command = await base44.asServiceRole.entities.Command.create({
        client_id: rep.client_id,
        audio_url: audioUrl,
        status: 'transcribing',
        streaming_output: []
      });

      // Transcribe
      const transcribeRes = await base44.asServiceRole.functions.invoke('transcribeAudioStream', {
        audio_url: audioUrl,
        client_id: rep.client_id,
        command_id: command.id
      });

      if (!transcribeRes.transcription) {
        return sendWhatsAppReply(from, '❌ Couldn\'t understand the audio. Please try again or type your command.');
      }

      return await processCommand(base44, from, rep, transcribeRes.transcription, command.id);
    }

    return sendWhatsAppReply(from, '🎤 Send a voice note or type a command and I\'ll take action for you!');

  } catch (error) {
    console.error('WhatsApp webhook error:', error);
    return new Response('OK', { status: 200 }); // Always return 200 to Twilio
  }
});

async function processCommand(base44, from, rep, transcription, existingCommandId = null) {
  const command = existingCommandId
    ? { id: existingCommandId }
    : await base44.asServiceRole.entities.Command.create({
        client_id: rep.client_id,
        transcription,
        status: 'reasoning',
        streaming_output: []
      });

  const executeRes = await base44.asServiceRole.functions.invoke('executeVoiceCommandStream', {
    client_id: rep.client_id,
    command_id: command.id,
    transcription,
    context: {}
  });

  if (!executeRes || executeRes.error) {
    return sendWhatsAppReply(from, `❌ Command failed: ${executeRes?.error || 'Unknown error'}`);
  }

  const result = executeRes.result || {};
  const intent = result.action;

  let replyMsg = `✅ *Done!*\n\n`;

  if (intent === 'send_email' && result.sent) {
    replyMsg += `📧 Email sent to ${result.sent_to}\n_Subject: ${result.subject}_`;
  } else if (intent === 'send_email' && !result.sent) {
    replyMsg += `📝 Email drafted (Outlook not connected)\n_Subject: ${result.subject}_\n\nConnect Outlook in the VoiceRep app to send emails.`;
  } else if (intent === 'schedule_meeting' && result.meeting_scheduled) {
    replyMsg += `📅 Meeting scheduled!\n${result.meeting_start ? new Date(result.meeting_start).toLocaleString() : 'Time TBD'}`;
  } else if (intent === 'create_task' && result.task_created) {
    replyMsg += `✅ Task created: "${result.task_title}"\nPriority: ${result.task_priority || 'medium'}`;
  } else if (intent === 'log_crm' && result.crm_logged) {
    replyMsg += `📊 Logged to HubSpot CRM`;
  } else if (intent === 'generate_document' && result.document_generated) {
    replyMsg += `📄 ${result.doc_type || 'Document'} generated — open VoiceRep app to view/download.`;
  } else {
    replyMsg += result.summary || 'Command processed.';
  }

  const warnings = result.warnings || [];
  if (warnings.length > 0) {
    replyMsg += '\n\n' + warnings.join('\n');
  }

  replyMsg += '\n\n_— VoiceRep AI 🤖_';

  return sendWhatsAppReply(from, replyMsg);
}

function sendWhatsAppReply(to, message) {
  const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID');
  const twilioToken = Deno.env.get('TWILIO_AUTH_TOKEN');
  const fromNumber = Deno.env.get('TWILIO_WHATSAPP_NUMBER') || 'whatsapp:+14155238886';

  return sendWhatsAppReplyRaw(to, message, twilioSid, twilioToken, fromNumber);
}

async function sendWhatsAppReplyRaw(to, message, sid, token, fromNum) {
  const twilioSid = sid || Deno.env.get('TWILIO_ACCOUNT_SID');
  const twilioToken = token || Deno.env.get('TWILIO_AUTH_TOKEN');
  const fromNumber = fromNum || Deno.env.get('TWILIO_WHATSAPP_NUMBER') || 'whatsapp:+14155238886';

  if (twilioSid && twilioToken) {
    const params = new URLSearchParams();
    params.append('From', fromNumber);
    params.append('To', to.startsWith('whatsapp:') ? to : `whatsapp:${to}`);
    params.append('Body', message);

    await fetch(`https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`, {
      method: 'POST',
      headers: {
        'Authorization': 'Basic ' + btoa(`${twilioSid}:${twilioToken}`),
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: params
    });
  }

  // Return TwiML response as fallback
  return new Response(
    `<?xml version="1.0" encoding="UTF-8"?><Response><Message>${message}</Message></Response>`,
    { headers: { 'Content-Type': 'text/xml' }, status: 200 }
  );
}