// VoiceRep AI Widget v2 - Streaming Real-Time Voice Commands
// Insert via: <script src="voicerep-widget-v2.js" data-api-key="YOUR_KEY"></script>

(() => {
  const API_KEY = document.currentScript?.getAttribute('data-api-key');
  const API_URL = document.currentScript?.getAttribute('data-api-url') || 'https://api.voicerep.app';

  if (!API_KEY) {
    console.error('VoiceRep: data-api-key attribute required');
    return;
  }

  let config = {};
  let isRecording = false;
  let mediaRecorder;
  let audioChunks = [];
  let commandId;

  // Fetch client config
  fetch(`${API_URL}/verifyApiKey`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
    body: JSON.stringify({ api_key: API_KEY })
  })
    .then(r => r.json())
    .then(data => {
      if (data.valid) {
        config = data;
        initializeWidget();
      }
    })
    .catch(err => console.error('VoiceRep init error:', err));

  function initializeWidget() {
    // Create container
    const container = document.createElement('div');
    container.id = 'voicerep-widget-container';
    container.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    `;

    // Floating button
    const button = document.createElement('button');
    button.id = 'voicerep-toggle';
    button.style.cssText = `
      width: 60px;
      height: 60px;
      border-radius: 50%;
      border: none;
      background: ${config.widget_config?.primary_color || '#000'};
      color: ${config.widget_config?.secondary_color || '#fff'};
      font-size: 24px;
      cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: all 0.3s ease;
    `;
    button.textContent = '🎤';
    button.onclick = togglePanel;

    // Panel
    const panel = document.createElement('div');
    panel.id = 'voicerep-panel';
    panel.style.cssText = `
      display: none;
      position: absolute;
      bottom: 80px;
      right: 0;
      width: 380px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3);
      padding: 20px;
      margin-bottom: 10px;
    `;

    // Panel content
    panel.innerHTML = `
      <div style="margin-bottom: 16px;">
        <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600;">Voice Command</h3>

        <!-- Context inputs with history -->
        <div style="margin-bottom: 12px;">
          <input 
            id="voicerep-prospect-name"
            placeholder="Prospect name (optional)"
            style="width: 100%; padding: 8px; margin-bottom: 8px; border: 1px solid #e0e0e0; border-radius: 6px; font-size: 13px;"
          />
          <div id="voicerep-prospect-history" style="margin-bottom: 8px; font-size: 12px; color: #666; max-height: 80px; overflow-y: auto;"></div>
          <input 
            id="voicerep-company"
            placeholder="Company (optional)"
            style="width: 100%; padding: 8px; margin-bottom: 8px; border: 1px solid #e0e0e0; border-radius: 6px; font-size: 13px;"
          />
          <select 
            id="voicerep-system"
            style="width: 100%; padding: 8px; border: 1px solid #e0e0e0; border-radius: 6px; font-size: 13px;"
          >
            <option value="">System type (optional)</option>
            <option value="email">Email</option>
            <option value="crm">CRM</option>
            <option value="document">Document</option>
            <option value="communication">Communication</option>
            <option value="task">Task</option>
            <option value="other">Other</option>
          </select>
        </div>

        <!-- Record/Stop button -->
        <button 
          id="voicerep-record"
          style="
            width: 100%;
            padding: 12px;
            background: ${config.widget_config?.accent_color || '#0066FF'};
            color: white;
            border: none;
            border-radius: 6px;
            font-weight: 600;
            cursor: pointer;
            margin-bottom: 12px;
            font-size: 14px;
            transition: opacity 0.2s;
          "
        >
          🎤 Start Recording
        </button>

        <!-- Streaming output -->
        <div id="voicerep-output" style="display: none;">
          <div style="margin-bottom: 12px; padding: 12px; background: #f5f5f5; border-radius: 6px;">
            <div style="font-size: 12px; font-weight: 600; margin-bottom: 8px; color: #666;">Transcription:</div>
            <div id="voicerep-transcription" style="font-size: 13px; color: #333; line-height: 1.4; min-height: 30px;"></div>
          </div>

          <div style="margin-bottom: 12px; padding: 12px; background: #f9f3ff; border-radius: 6px;">
            <div style="font-size: 12px; font-weight: 600; margin-bottom: 8px; color: #666;">Reasoning:</div>
            <div id="voicerep-reasoning" style="font-size: 12px; color: #555; line-height: 1.4; min-height: 30px; font-style: italic;"></div>
          </div>

          <div style="margin-bottom: 12px; padding: 12px; background: #f0f8ff; border-radius: 6px;">
            <div style="font-size: 12px; font-weight: 600; margin-bottom: 8px; color: #666;">Prospect Context:</div>
            <div id="voicerep-context" style="font-size: 11px; color: #333; line-height: 1.4;"></div>
          </div>

          <div style="padding: 12px; background: #f0f8ff; border-radius: 6px;">
            <div style="font-size: 12px; font-weight: 600; margin-bottom: 8px; color: #666;">Result:</div>
            <div id="voicerep-result" style="font-size: 13px; color: #333; line-height: 1.4; white-space: pre-wrap; min-height: 30px;"></div>
          </div>

          <button 
            id="voicerep-copy"
            style="
              width: 100%;
              padding: 10px;
              background: #f0f0f0;
              color: #333;
              border: 1px solid #d0d0d0;
              border-radius: 6px;
              cursor: pointer;
              margin-top: 12px;
              font-size: 13px;
              font-weight: 500;
            "
          >
            📋 Copy Result
          </button>
        </div>
      </div>
    `;

    container.appendChild(button);
    container.appendChild(panel);
    document.body.appendChild(container);

    // Event listeners
    document.getElementById('voicerep-record').onclick = startRecording;
    document.getElementById('voicerep-copy').onclick = () => {
      const result = document.getElementById('voicerep-result').textContent;
      navigator.clipboard.writeText(result);
    };
  }

  function togglePanel() {
    const panel = document.getElementById('voicerep-panel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  }

  async function startRecording() {
    try {
      if (isRecording) {
        mediaRecorder.stop();
        return;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRecorder = new MediaRecorder(stream);
      audioChunks = [];
      isRecording = true;

      document.getElementById('voicerep-record').textContent = '⏹️ Stop Recording';
      document.getElementById('voicerep-output').style.display = 'none';

      mediaRecorder.ondataavailable = e => audioChunks.push(e.data);

      mediaRecorder.onstop = async () => {
        isRecording = false;
        document.getElementById('voicerep-record').textContent = '🎤 Start Recording';

        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        const formData = new FormData();
        formData.append('file', audioBlob);

        // Upload audio
        const uploadRes = await fetch(`${API_URL}/uploadAudio`, {
          method: 'POST',
          headers: { 'X-API-Key': API_KEY },
          body: formData
        });

        const { audio_url, client_id } = await uploadRes.json();

        // Create command (initialize with context)
        const context = {
          prospect_name: document.getElementById('voicerep-prospect-name').value,
          prospect_company: document.getElementById('voicerep-company').value,
          system_type: document.getElementById('voicerep-system').value
        };

        // Create command record in database
        const createRes = await fetch(`${API_URL}/createCommand`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
          body: JSON.stringify({ client_id, audio_url, context })
        });

        const { command_id } = await createRes.json();

        // Start streaming pipeline
        document.getElementById('voicerep-output').style.display = 'block';
        document.getElementById('voicerep-transcription').textContent = '';
        document.getElementById('voicerep-reasoning').textContent = '';
        document.getElementById('voicerep-result').textContent = '';

        // Call transcribe stream
        const transcribeRes = await fetch(`${API_URL}/transcribeAudioStream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
          body: JSON.stringify({ audio_url, client_id, command_id })
        });

        const { transcription } = await transcribeRes.json();
        document.getElementById('voicerep-transcription').textContent = transcription;

        // Call execute with streaming
        await fetch(`${API_URL}/executeVoiceCommandStream`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
          body: JSON.stringify({
            client_id,
            command_id,
            transcription,
            context
          })
        })
          .then(r => r.json())
          .then(data => {
            document.getElementById('voicerep-reasoning').textContent = data.reasoning;
            document.getElementById('voicerep-result').textContent = JSON.stringify(data.result, null, 2);
            
            // Display prospect context if available
            if (data.prospect_context) {
              const ctx = data.prospect_context;
              const contextHtml = `
                <strong>${ctx.prospect_name}</strong> @ ${ctx.company_name}<br/>
                Interactions: ${ctx.interaction_count} | Last: ${ctx.last_interaction_date ? new Date(ctx.last_interaction_date).toLocaleDateString() : 'N/A'}
                ${ctx.notes ? `<br/>Notes: ${ctx.notes}` : ''}
              `;
              document.getElementById('voicerep-context').innerHTML = contextHtml;
            }
          });
      };

      mediaRecorder.start();
    } catch (err) {
      console.error('Recording error:', err);
      alert('Microphone access required');
    }
  }
})();
