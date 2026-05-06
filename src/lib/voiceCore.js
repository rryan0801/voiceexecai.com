/**
 * VoiceExec Core - Portable Voice-to-Action Framework
 * 
 * This is the core voice capture, transcription, and routing engine.
 * Designed to be dropped into any project.
 */

import { base44 } from '@/api/base44Client';

export class VoiceCore {
  constructor(config = {}) {
    this.config = {
      apiUrl: config.apiUrl || window.location.origin,
      clientId: config.clientId || null,
      onStatusChange: config.onStatusChange || (() => {}),
      onTranscription: config.onTranscription || (() => {}),
      onResult: config.onResult || (() => {}),
      onError: config.onError || (() => {}),
      ...config
    };

    this.mediaRecorder = null;
    this.chunks = [];
    this.currentPhase = 'idle'; // idle, recording, processing, done, error
  }

  setPhase(phase) {
    this.currentPhase = phase;
    this.config.onStatusChange(phase);
  }

  async startRecording() {
    try {
      this.chunks = [];
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      this.mediaRecorder = new MediaRecorder(stream);
      
      this.mediaRecorder.ondataavailable = (e) => this.chunks.push(e.data);
      this.mediaRecorder.onstop = () => this.handleRecordingStop();
      
      this.mediaRecorder.start();
      this.setPhase('recording');
    } catch (error) {
      this.setPhase('error');
      this.config.onError('Microphone access denied');
    }
  }

  stopRecording() {
    if (this.mediaRecorder) {
      this.mediaRecorder.stop();
      this.mediaRecorder.stream.getTracks().forEach(track => track.stop());
    }
  }

  async handleRecordingStop() {
    this.setPhase('processing');
    
    try {
      // Upload audio
      const audioBlob = new Blob(this.chunks, { type: 'audio/webm' });
      const formData = new FormData();
      formData.append('file', audioBlob);
      
      const uploadRes = await base44.functions.invoke('uploadAudio', formData);
      if (!uploadRes.data?.audio_url) {
        throw new Error('Audio upload failed');
      }

      const { audio_url } = uploadRes.data;

      // Create command record
      const createRes = await base44.functions.invoke('createCommand', {
        client_id: this.config.clientId,
        audio_url,
        context: this.config.context || {}
      });

      const commandId = createRes.data?.command_id;
      if (!commandId) throw new Error('Command creation failed');

      // Transcribe
      const transcribeRes = await base44.functions.invoke('transcribeAudioStream', {
        audio_url,
        command_id: commandId
      });

      if (transcribeRes.data?.error) {
        throw new Error(transcribeRes.data.user_message || transcribeRes.data.error);
      }

      const transcription = transcribeRes.data?.transcription;
      this.config.onTranscription(transcription);

      // Route & execute
      const execRes = await base44.functions.invoke('executeVoiceCommandStream', {
        client_id: this.config.clientId,
        command_id: commandId,
        transcription,
        context: this.config.context || {}
      });

      if (execRes.data?.error) {
        throw new Error(execRes.data.user_message || execRes.data.error);
      }

      this.setPhase('done');
      this.config.onResult({
        transcription,
        result: execRes.data?.result,
        commandId
      });
    } catch (error) {
      this.setPhase('error');
      this.config.onError(error.message || 'Processing failed');
    }
  }

  reset() {
    this.chunks = [];
    this.currentPhase = 'idle';
    this.setPhase('idle');
  }

  getPhase() {
    return this.currentPhase;
  }
}

export default VoiceCore;