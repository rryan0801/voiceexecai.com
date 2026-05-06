/**
 * VoiceWidget Configuration Template
 * 
 * Copy this and customize for your project.
 * Pass to <VoiceWidget config={voiceConfig} />
 */

export const voiceConfig = {
  // ============= REQUIRED =============
  clientId: 'your-client-id', // Or fetch from your auth system

  // ============= OPTIONAL: UI Customization =============
  title: 'Voice Command',
  subtitle: 'Speak your action',
  
  // Button styling
  buttonBgIdle: 'bg-blue-600 hover:bg-blue-500',
  buttonBgRecording: 'bg-red-600 hover:bg-red-500 animate-pulse',
  buttonSize: 'w-28 h-28',
  
  // Container background
  containerBg: 'bg-gradient-to-b from-slate-900 to-slate-800',
  
  // Footer
  footer: 'Powered by VoiceExec',
  
  // ============= OPTIONAL: Feature Toggles =============
  showHeader: true,
  showStatus: true,
  showTimer: true,
  showFooter: true,
  
  // ============= OPTIONAL: Context Fields =============
  // Add custom fields to collect before recording
  initialContext: {},
  contextFields: [
    // Example:
    // { name: 'prospect_name', placeholder: 'Prospect name' },
    // { name: 'company', placeholder: 'Company name' }
  ],
  
  // ============= OPTIONAL: Callbacks =============
  onSuccess: (data) => {
    console.log('Voice command succeeded:', data);
    // data.transcription - what user said
    // data.result - command result
    // data.commandId - backend command ID
  },
  
  onError: (errorMsg) => {
    console.error('Voice command error:', errorMsg);
  }
};

export default voiceConfig;