// VoiceRep AI - Embeddable Widget
// Usage: <script src="https://yourapp.com/voicerep-widget.js" data-api-key="YOUR_API_KEY"></script>

(function() {
  class VoiceRepWidget {
    constructor() {
      this.apiKey = document.currentScript?.getAttribute('data-api-key');
      this.apiBase = document.currentScript?.getAttribute('data-api-url') || 'https://voicerep.app/api';
      this.clientConfig = null;
      this.isRecording = false;
      this.mediaRecorder = null;
      this.audioChunks = [];
      this.init();
    }

    async init() {
      if (!this.apiKey) {
        console.error('VoiceRep: API key not provided');
        return;
      }

      // Verify API key and get config
      try {
        const response = await fetch(`${this.apiBase}/verifyApiKey`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ api_key: this.apiKey })
        });

        const data = await response.json();
        if (!data.valid) {
          console.error('VoiceRep: Invalid API key');
          return;
        }

        this.clientConfig = data;
        this.createWidget();
      } catch (error) {
        console.error('VoiceRep: Init failed', error);
      }
    }

    createWidget() {
      const config = this.clientConfig.widget_config || {};
      const position = config.position || 'bottom-right';
      
      // Create widget HTML
      const widget = document.createElement('div');
      widget.id = 'voicerep-widget';
      widget.innerHTML = `
        <style>
          #voicerep-widget {
            position: fixed;
            ${position === 'bottom-right' ? 'right: 20px; bottom: 20px;' : ''}
            ${position === 'bottom-left' ? 'left: 20px; bottom: 20px;' : ''}
            ${position === 'top-right' ? 'right: 20px; top: 20px;' : ''}
            ${position === 'top-left' ? 'left: 20px; top: 20px;' : ''}
            z-index: 9999;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          }

          .voicerep-button {
            width: 60px;
            height: 60px;
            border-radius: 50%;
            border: none;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            transition: all 0.3s ease;
            background: ${config.primary_color || '#000'};
            color: ${config.secondary_color || '#fff'};
          }

          .voicerep-button:hover {
            transform: scale(1.1);
            box-shadow: 0 6px 16px rgba(0,0,0,0.2);
          }

          .voicerep-button.recording {
            animation: pulse 1s infinite;
            background: ${config.accent_color || '#0066FF'};
          }

          @keyframes pulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.15); }
          }

          .voicerep-panel {
            position: absolute;
            bottom: 80px;
            ${position.includes('right') ? 'right: 0;' : 'left: 0;'}
            background: white;
            border-radius: 12px;
            box-shadow: 0 8px 24px rgba(0,0,0,0.12);
            min-width: 320px;
            padding: 20px;
            display: none;
            flex-direction: column;
            gap: 16px;
          }

          .voicerep-panel.active {
            display: flex;
          }

          .voicerep-header {
            display: flex;
            align-items: center;
            gap: 12px;
            border-bottom: 1px solid #e5e7eb;
            padding-bottom: 12px;
          }

          .voicerep-header-title {
            font-weight: 600;
            font-size: 14px;
            color: #111;
          }

          .voicerep-status {
            font-size: 12px;
            color: #6b7280;
            text-align: center;
          }

          .voicerep-transcription {
            background: #f3f4f6;
            padding: 12px;
            border-radius: 8px;
            font-size: 13px;
            color: #374151;
            min-height: 40px;
            max-height: 100px;
            overflow-y: auto;
          }

          .voicerep-result {
            background: #f0fdf4;
            border: 1px solid #bbf7d0;
            padding: 12px;
            border-radius: 8px;
            font-size: 13px;
            color: #166534;
          }

          .voicerep-actions {
            display: flex;
            gap: 8px;
          }

          .voicerep-btn {
            flex: 1;
            padding: 10px 12px;
            border: none;
            border-radius: 6px;
            font-size: 12px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.2s;
          }

          .voicerep-btn-primary {
            background: ${config.accent_color || '#0066FF'};
            color: white;
          }

          .voicerep-btn-primary:hover {
            opacity: 0.9;
          }

          .voicerep-btn-secondary {
            background: #e5e7eb;
            color: #374151;
          }

          .voicerep-btn-secondary:hover {
            background: #d1d5db;
          }

          .voicerep-spinner {
            display: inline-block;
            width: 16px;
            height: 16px;
            border: 2px solid #e5e7eb;
            border-top-color: ${config.accent_color || '#0066FF'};
            border-radius: 50%;
            animation: spin 0.6s linear infinite;
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        </style>

        <button class="voicerep-button" id="voicerep-btn" title="Click to record">
          🎤
        </button>

        <div class="voicerep-panel" id="voicerep-panel">
          <div class="voicerep-header">
            <div class="voicerep-header-title">${config.widget_title || 'VoiceRep AI'}</div>
          </div>

          <div class="voicerep-status" id="voicerep-status">Ready to record</div>

          <div class="voicerep-transcription" id="voicerep-transcription" style="display: none;"></div>
          <div class="voicerep-result" id="voicerep-result" style="display: none;"></div>

          <div class="voicerep-actions" id="voicerep-actions" style="display: none;">
            <button class="voicerep-btn voicerep-btn-primary" id="voicerep-use-result">Use This</button>
            <button class="voicerep-btn voicerep-btn-secondary" id="voicerep-clear">Clear</button>
          </div>
        </div>
      `;

      document.body.appendChild(widget);
      this.attachEventListeners();
    }

    attachEventListeners() {
      const btn = document.getElementById('voicerep-btn');
      const panel = document.getElementById('voicerep-panel');
      const clearBtn = document.getElementById('voicerep-clear');

      btn.addEventListener('click', () => {
        this.isRecording ? this.stopRecording() : this.startRecording();
        panel.classList.toggle('active');
      });

      clearBtn.addEventListener('click', () => {
        this.reset();
      });
    }

    async startRecording() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        this.mediaRecorder = new MediaRecorder(stream);
        this.audioChunks = [];

        this.mediaRecorder.ondataavailable = (e) => {
          this.audioChunks.push(e.data);
        };

        this.mediaRecorder.onstop = () => {
          this.processAudio();
        };

        this.mediaRecorder.start();
        this.isRecording = true;
        this.updateStatus('🔴 Recording...');
        document.getElementById('voicerep-btn').classList.add('recording');
      } catch (error) {
        console.error('Microphone access denied:', error);
        this.updateStatus('Microphone access denied');
      }
    }

    stopRecording() {
      if (this.mediaRecorder) {
        this.mediaRecorder.stop();
        this.isRecording = false;
        this.updateStatus('Processing...');
        document.getElementById('voicerep-btn').classList.remove('recording');
      }
    }

    async processAudio() {
      const audioBlob = new Blob(this.audioChunks, { type: 'audio/mp3' });
      const formData = new FormData();
      formData.append('file', audioBlob, 'audio.mp3');

      try {
        // Upload audio
        const uploadResponse = await fetch(`${this.apiBase}/uploadAudio`, {
          method: 'POST',
          headers: { 'X-API-Key': this.apiKey },
          body: formData
        });

        const { audio_url } = await uploadResponse.json();

        // Process through pipeline
        const result = await fetch(`${this.apiBase}/processCommand`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': this.apiKey
          },
          body: JSON.stringify({
            audio_url,
            client_id: this.clientConfig.client_id
          })
        });

        const data = await result.json();
        this.displayResult(data);
      } catch (error) {
        console.error('Processing failed:', error);
        this.updateStatus('Processing failed');
      }
    }

    displayResult(data) {
      document.getElementById('voicerep-transcription').textContent = data.transcription || '';
      document.getElementById('voicerep-transcription').style.display = 'block';

      document.getElementById('voicerep-result').innerHTML = `<strong>${data.detected_intent}:</strong> ${JSON.stringify(data.result).substring(0, 150)}...`;
      document.getElementById('voicerep-result').style.display = 'block';

      document.getElementById('voicerep-actions').style.display = 'flex';
      this.updateStatus('✅ Ready');
    }

    updateStatus(text) {
      document.getElementById('voicerep-status').textContent = text;
    }

    reset() {
      document.getElementById('voicerep-transcription').style.display = 'none';
      document.getElementById('voicerep-result').style.display = 'none';
      document.getElementById('voicerep-actions').style.display = 'none';
      this.updateStatus('Ready to record');
    }
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new VoiceRepWidget());
  } else {
    new VoiceRepWidget();
  }
})();
