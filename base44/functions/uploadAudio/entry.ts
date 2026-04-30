// Upload audio to real Base44 storage so Whisper can fetch it
import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const apiKey = req.headers.get('X-API-Key');

    if (!apiKey) {
      return Response.json({ error: 'API key required' }, { status: 401 });
    }

    // Verify API key
    const clients = await base44.asServiceRole.entities.Client.filter({ api_key: apiKey });
    if (!clients || clients.length === 0) {
      return Response.json({ error: 'Invalid API key' }, { status: 401 });
    }
    const client = clients[0];

    const formData = await req.formData();
    const audioFile = formData.get('file');

    if (!audioFile) {
      return Response.json({ error: 'No audio file provided' }, { status: 400 });
    }

    // Upload to Base44 real storage via UploadFile integration
    const uploadFormData = new FormData();
    uploadFormData.append('file', audioFile);

    const uploadRes = await base44.asServiceRole.integrations.Core.UploadFile({ file: audioFile });

    if (!uploadRes || !uploadRes.file_url) {
      throw new Error('Failed to upload audio file to storage');
    }

    return Response.json({
      success: true,
      audio_url: uploadRes.file_url,
      client_id: client.id
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});