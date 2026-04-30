// VoiceRep AI Widget v2 - Bulletproof UX with clear human-readable feedback
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
  let recordingStartTime;

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

  // ── Human-readable result formatter ───────────────────────────────────────
  function formatResult(data) {
    const result = data.result || {};
    const intent = result.action;
    const warnings = result.warnings || [];
    let lines = [];

    // Success messages per intent
    if (intent === 'send_email') {
      if (result.sent) {
        lines.push(`✅ Email sent to ${result.sent_to}`);
        lines.push(`📧 Subject: ${result.subject}`);
      } else {
        lines.push(`📝 Email drafted (not sent)`);
        if (result.subject) lines.push(`📧 Subject: ${result.subject}`);
        if (result.body) lines.push(`\n${result.body}`);
      }
    } else if (intent === 'schedule_meeting') {
      if (result.meeting_scheduled) {
        const start = result.meeting_start ? new Date(result.meeting_start).toLocaleString() : 'TBD';
        const end = result.meeting_end ? new Date(result.meeting_end).toLocaleString() : 'TBD';
        lines.push(`✅ Meeting scheduled!`);
        lines.push(`📅 ${start} → ${end}`);
        if (result.web_link) lines.push(`🔗 Open in Outlook`);
      } else {
        lines.push(`❌ Meeting could not be scheduled`);
      }
    } else if (intent === 'create_task') {
      if (result.task_created) {
        lines.push(`✅ Task created: "${result.task_title}"`);
        lines.push(`Priority: ${result.task_priority || 'medium'}`);
        if (result.task_due_date) lines.push(`Due: ${new Date(result.task_due_date).toLocaleDateString()}`);
      } else {
        lines.push(`❌ Task could not be created`);
      }
    } else if (intent === 'log_crm') {
      if (result.crm_logged) {
        lines.push(`✅ Logged to HubSpot CRM`);
        if (result.crm_contact_id) lines.push(`Contact ID: ${result.crm_contact_id}`);
      } else {
        lines.push(`❌ CRM logging failed`);
      }
    } else if (intent === 'generate_document') {
      if (result.document_generated) {
        lines.push(`✅ ${result.doc_type || 'Document'} generated`);
        lines.push(`Click below to view/print`);
      } else {
        lines.push(`❌ Document generation failed`);
      }
    } else {
      lines.push(result.summary || 'Command processed');
    }

    return { text: lines.join('\n'), warnings, result };
  }

  function showStatus(container, type, message) {
    const colors = {
      success: { bg: '#d1fae5', color: '#065f46', border: '#6ee7b7' },
      error: { bg: '#fee2e2', color: '#991b1b', border: '#fca5a5' },
      warning: { bg: '#fef3c7', color: '#92400e', border: '#fcd34d' },
      info: { bg: '#eff6ff', color: '#1e40af', border: '#93c5fd' }
    };
    const c = colors[type] || colors.info;
    container.style.display = 'block';
    container.style.background = c.bg;
    container.style.color = c.color;
    container.style.border = `1px solid ${c.border}`;
    container.style.borderRadius = '6px';
    container.style.padding = '10px';
    container.style.fontSize = '12px';
    container.style.whiteSpace = 'pre-wrap';
    container.style.lineHeight = '1.6';
    container.textContent = message;
  }

  function setRecordButtonState(btn, state, accentColor) {
    const states = {
      idle: { text: '🎤 Hold to Record', bg: accentColor || '#0066FF', disabled: false },
      recording: { text: '⏹️ Stop Recording', bg: '#ef4444', disabled: false },
      processing: { text: '⏳ Processing...', bg: '#6b7280', disabled: true }
    };
    const s = states[state] || states.idle;
    btn.textContent = s.text;
    btn.style.background = s.bg;
    btn.disabled = s.disabled;
    btn.style.opacity = s.disabled ? '0.7' : '1';
  }

  function initializeWidget() {
    const container = document.createElement('div');
    container.id = 'voicerep-widget-container';
    container.style.cssText = `
      position: fixed;
      bottom: 20px;
      right: 20px;
      z-index: 999999;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    `;

    const button = document.createElement('button');
    button.id = 'voicerep-toggle';
    button.style.cssText = `
      width: 60px; height: 60px; border-radius: 50%; border: none;
      background: ${config.widget_config?.primary_color || '#000'};
      color: ${config.widget_config?.secondary_color || '#fff'};
      font-size: 24px; cursor: pointer;
      box-shadow: 0 4px 12px rgba(0,0,0,0.15);
      transition: all 0.3s ease;
    `;
    button.textContent = '🎤';
    button.onclick = togglePanel;

    const panel = document.createElement('div');
    panel.id = 'voicerep-panel';
    panel.style.cssText = `
      display: none; position: absolute; bottom: 80px; right: 0;
      width: 380px; background: white; border-radius: 12px;
      box-shadow: 0 20px 60px rgba(0,0,0,0.3); padding: 20px; margin-bottom: 10px;
    `;

    panel.innerHTML = `
      <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:16px;">
        <h3 style="margin:0; font-size:15px; font-weight:700;">🎤 Voice Command</h3>
        <button id="voicerep-close" style="background:none;border:none;cursor:pointer;font-size:18px;color:#999;">✕</button>
      </div>

      <!-- Context inputs -->
      <div style="margin-bottom:12px;">
        <input id="voicerep-prospect-name" placeholder="Prospect name (optional)"
          style="width:100%;padding:8px;margin-bottom:8px;border:1px solid #e0e0e0;border-radius:6px;font-size:13px;box-sizing:border-box;" />
        <input id="voicerep-company" placeholder="Company (optional)"
          style="width:100%;padding:8px;margin-bottom:8px;border:1px solid #e0e0e0;border-radius:6px;font-size:13px;box-sizing:border-box;" />
        <select id="voicerep-system"
          style="width:100%;padding:8px;border:1px solid #e0e0e0;border-radius:6px;font-size:13px;box-sizing:border-box;">
          <option value="">System type (optional)</option>
          <option value="email">Email</option>
          <option value="crm">CRM</option>
          <option value="document">Document</option>
          <option value="task">Task</option>
          <option value="other">Other</option>
        </select>
      </div>

      <!-- Tips -->
      <div id="voicerep-tips" style="background:#f8f9fa;border-radius:6px;padding:8px;margin-bottom:12px;font-size:11px;color:#666;">
        💡 Try: <em>"Send a follow-up email to John"</em> or <em>"Schedule a meeting for tomorrow at 2pm"</em>
      </div>

      <!-- Record button -->
      <button id="voicerep-record" style="
        width:100%;padding:12px;color:white;border:none;border-radius:6px;
        font-weight:600;cursor:pointer;margin-bottom:12px;font-size:14px;
        background:${config.widget_config?.accent_color || '#0066FF'};
      ">🎤 Hold to Record</button>

      <!-- Recording timer -->
      <div id="voicerep-timer" style="display:none;text-align:center;font-size:12px;color:#ef4444;margin-bottom:8px;font-weight:600;">
        🔴 Recording: <span id="voicerep-timer-count">0</span>s
      </div>

      <!-- Output area -->
      <div id="voicerep-output" style="display:none;">
        <!-- Transcription -->
        <div style="margin-bottom:10px;padding:10px;background:#f5f5f5;border-radius:6px;">
          <div style="font-size:11px;font-weight:600;color:#888;margin-bottom:4px;">HEARD</div>
          <div id="voicerep-transcription" style="font-size:13px;color:#333;line-height:1.4;font-style:italic;"></div>
        </div>

        <!-- Main result -->
        <div id="voicerep-result-box" style="margin-bottom:10px;padding:10px;border-radius:6px;display:none;"></div>

        <!-- Warnings -->
        <div id="voicerep-warnings-box" style="margin-bottom:10px;"></div>

        <!-- Draft content (email body / document) -->
        <div id="voicerep-draft-box" style="display:none;margin-bottom:10px;">
          <div style="font-size:11px;font-weight:600;color:#888;margin-bottom:4px;">DRAFT CONTENT</div>
          <div id="voicerep-draft-content" style="font-size:12px;color:#333;background:#f9f9f9;padding:10px;border-radius:6px;border:1px solid #e0e0e0;white-space:pre-wrap;max-height:120px;overflow-y:auto;"></div>
        </div>

        <!-- Action buttons -->
        <div id="voicerep-actions" style="display:flex;gap:8px;flex-wrap:wrap;"></div>
      </div>
    `;

    container.appendChild(button);
    container.appendChild(panel);
    document.body.appendChild(container);

    document.getElementById('voicerep-close').onclick = () => { panel.style.display = 'none'; };
    document.getElementById('voicerep-record').onclick = handleRecord;
  }

  function togglePanel() {
    const panel = document.getElementById('voicerep-panel');
    panel.style.display = panel.style.display === 'none' ? 'block' : 'none';
  }

  let timerInterval;
  function startTimer() {
    let secs = 0;
    document.getElementById('voicerep-timer').style.display = 'block';
    timerInterval = setInterval(() => {
      secs++;
      document.getElementById('voicerep-timer-count').textContent = secs;
      // Auto-stop at 60 seconds
      if (secs >= 60) handleRecord();
    }, 1000);
  }
  function stopTimer() {
    clearInterval(timerInterval);
    document.getElementById('voicerep-timer').style.display = 'none';
  }

  function resetOutput() {
    document.getElementById('voicerep-output').style.display = 'none';
    document.getElementById('voicerep-result-box').style.display = 'none';
    document.getElementById('voicerep-warnings-box').innerHTML = '';
    document.getElementById('voicerep-draft-box').style.display = 'none';
    document.getElementById('voicerep-actions').innerHTML = '';
    document.getElementById('voicerep-transcription').textContent = '';
  }

  async function handleRecord() {
    const recordBtn = document.getElementById('voicerep-record');
    const accentColor = config.widget_config?.accent_color || '#0066FF';

    if (!isRecording) {
      // Start recording
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        isRecording = true;
        recordingStartTime = Date.now();
        resetOutput();

        setRecordButtonState(recordBtn, 'recording', accentColor);
        startTimer();

        mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
        mediaRecorder.onstop = processRecording;
        mediaRecorder.start();
      } catch (err) {
        showUserError('Microphone access is required. Please allow microphone access in your browser settings and try again.');
      }
    } else {
      // Stop recording
      isRecording = false;
      stopTimer();
      mediaRecorder.stop();
      mediaRecorder.stream?.getTracks().forEach(t => t.stop());
      setRecordButtonState(recordBtn, 'processing', accentColor);
    }
  }

  function showUserError(message) {
    const recordBtn = document.getElementById('voicerep-record');
    const accentColor = config.widget_config?.accent_color || '#0066FF';
    setRecordButtonState(recordBtn, 'idle', accentColor);
    stopTimer();
    isRecording = false;

    document.getElementById('voicerep-output').style.display = 'block';
    document.getElementById('voicerep-transcription').textContent = '';
    const resultBox = document.getElementById('voicerep-result-box');
    showStatus(resultBox, 'error', '❌ ' + message);
    resultBox.style.display = 'block';
  }

  async function processRecording() {
    const recordBtn = document.getElementById('voicerep-record');
    const accentColor = config.widget_config?.accent_color || '#0066FF';

    try {
      const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });

      // Check minimum recording duration (1 second)
      const duration = (Date.now() - recordingStartTime) / 1000;
      if (duration < 1) {
        showUserError('Recording too short. Please hold the button and speak your full command before releasing.');
        return;
      }

      // Upload audio
      const formData = new FormData();
      formData.append('file', audioBlob);
      const uploadRes = await fetch(`${API_URL}/uploadAudio`, {
        method: 'POST',
        headers: { 'X-API-Key': API_KEY },
        body: formData
      });
      if (!uploadRes.ok) throw new Error('Audio upload failed');
      const { audio_url, client_id } = await uploadRes.json();

      const context = {
        prospect_name: document.getElementById('voicerep-prospect-name').value.trim(),
        prospect_company: document.getElementById('voicerep-company').value.trim(),
        system_type: document.getElementById('voicerep-system').value
      };

      // Create command record
      const createRes = await fetch(`${API_URL}/createCommand`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
        body: JSON.stringify({ client_id, audio_url, context })
      });
      if (!createRes.ok) throw new Error('Failed to create command');
      const { command_id } = await createRes.json();

      // Show output area
      document.getElementById('voicerep-output').style.display = 'block';
      document.getElementById('voicerep-transcription').textContent = '⏳ Transcribing your voice...';

      // Transcribe
      const transcribeRes = await fetch(`${API_URL}/transcribeAudioStream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
        body: JSON.stringify({ audio_url, client_id, command_id })
      });

      const transcribeData = await transcribeRes.json();

      // Fix #1: Handle transcription failures clearly
      if (!transcribeRes.ok || transcribeData.error) {
        showUserError(transcribeData.user_message || transcribeData.error || 'Transcription failed — please try again.');
        return;
      }

      const { transcription } = transcribeData;
      document.getElementById('voicerep-transcription').textContent = transcription;

      // Show processing state
      const resultBox = document.getElementById('voicerep-result-box');
      showStatus(resultBox, 'info', '⏳ Analyzing your command and taking action...');
      resultBox.style.display = 'block';

      // Execute command
      const executeRes = await fetch(`${API_URL}/executeVoiceCommandStream`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'X-API-Key': API_KEY },
        body: JSON.stringify({ client_id, command_id, transcription, context })
      });

      const executeData = await executeRes.json();

      if (!executeRes.ok || executeData.error) {
        showStatus(resultBox, 'error', '❌ ' + (executeData.user_message || executeData.error || 'Command failed — please try again.'));
        return;
      }

      // ── Render human-readable result ──────────────────────────────────────
      const { text, warnings, result } = formatResult(executeData);

      // Main result
      const hasError = result.sent === false || result.meeting_scheduled === false ||
        result.task_created === false || result.crm_logged === false || result.document_generated === false;
      showStatus(resultBox, hasError ? 'warning' : 'success', text);

      // Warnings (Fix #2, #3, #4, #5, #6 — shown clearly)
      const warningsBox = document.getElementById('voicerep-warnings-box');
      warningsBox.innerHTML = '';
      if (warnings && warnings.length > 0) {
        warnings.forEach(w => {
          const div = document.createElement('div');
          showStatus(div, 'warning', w);
          div.style.marginBottom = '6px';
          warningsBox.appendChild(div);
        });
      }

      // Draft content (email body or document)
      const draftBox = document.getElementById('voicerep-draft-box');
      const draftContent = document.getElementById('voicerep-draft-content');
      if (result.body) {
        draftContent.textContent = result.body;
        draftBox.style.display = 'block';
      } else if (result.html) {
        draftContent.textContent = '(Document generated — click "View Document" below)';
        draftBox.style.display = 'block';
      }

      // Action buttons
      const actionsDiv = document.getElementById('voicerep-actions');
      actionsDiv.innerHTML = '';

      const btnStyle = `padding:8px 14px;border:none;border-radius:6px;cursor:pointer;font-size:12px;font-weight:600;`;

      // Copy button (for email drafts)
      if (result.body) {
        const copyBtn = document.createElement('button');
        copyBtn.style.cssText = btnStyle + 'background:#f0f0f0;color:#333;border:1px solid #d0d0d0;';
        copyBtn.textContent = '📋 Copy Draft';
        copyBtn.onclick = () => {
          navigator.clipboard.writeText(result.body);
          copyBtn.textContent = '✓ Copied!';
          setTimeout(() => { copyBtn.textContent = '📋 Copy Draft'; }, 2000);
        };
        actionsDiv.appendChild(copyBtn);
      }

      // View document button
      if (result.html) {
        const viewBtn = document.createElement('button');
        viewBtn.style.cssText = btnStyle + 'background:#0066FF;color:white;';
        viewBtn.textContent = '📄 View Document';
        viewBtn.onclick = () => {
          const win = window.open('', '_blank');
          win.document.write(result.html);
          win.document.close();
        };
        actionsDiv.appendChild(viewBtn);
      }

      // Meeting link button
      if (result.web_link) {
        const meetBtn = document.createElement('button');
        meetBtn.style.cssText = btnStyle + 'background:#0066FF;color:white;';
        meetBtn.textContent = '📅 Open Meeting';
        meetBtn.onclick = () => window.open(result.web_link, '_blank');
        actionsDiv.appendChild(meetBtn);
      }

      // New command button
      const newBtn = document.createElement('button');
      newBtn.style.cssText = btnStyle + 'background:#f0f0f0;color:#333;border:1px solid #d0d0d0;';
      newBtn.textContent = '🎤 New Command';
      newBtn.onclick = () => {
        resetOutput();
        setRecordButtonState(document.getElementById('voicerep-record'), 'idle', accentColor);
      };
      actionsDiv.appendChild(newBtn);

    } catch (err) {
      showUserError('Something went wrong: ' + err.message + '. Please try again.');
    } finally {
      setRecordButtonState(recordBtn, 'idle', accentColor);
    }
  }
})();
