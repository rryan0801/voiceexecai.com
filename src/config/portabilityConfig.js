/**
 * VoiceExec Portability Configuration
 * 
 * This is your single source of truth for adapting VoiceExec to your project.
 * Modify this file to match your entities, branding, and workflows.
 */

export const portabilityConfig = {
  // ============= PROJECT INFO =============
  projectName: 'VoiceExec',
  version: '1.0.0',
  
  // ============= ENTITY MAPPING =============
  // Map generic entity names to YOUR entity names
  // If you use different entity names, update here
  entities: {
    client: 'Client',           // Your client/organization entity
    prospect: 'Prospect',       // Your prospect/contact entity
    command: 'Command',         // Voice command tracking
    deal: 'DealScore',          // Deal/opportunity entity
    interaction: 'ProspectInteraction', // Activity log
    user: 'User'                // App user
  },

  // ============= FIELD MAPPING =============
  // Map generic fields to YOUR field names
  // Use this if your fields are named differently
  fieldMapping: {
    // Prospect fields
    prospectName: 'prospect_name',
    prospectEmail: 'email',
    prospectPhone: 'phone',
    company: 'company_name',
    
    // Command fields
    transcription: 'transcription',
    audioUrl: 'audio_url',
    commandStatus: 'status',
    
    // Deal fields
    dealValue: 'deal_value',
    dealStage: 'deal_stage',
    winProbability: 'win_probability'
  },

  // ============= BRANDING =============
  branding: {
    appName: 'VoiceExec',
    appTitle: 'Voice Command Center',
    logoUrl: null, // Set to your logo URL
    primaryColor: '#3b82f6', // Blue
    accentColor: '#06b6d4',  // Cyan
    fontFamily: 'system-ui'
  },

  // ============= FEATURE FLAGS =============
  // Enable/disable features for your use case
  features: {
    voiceCommands: true,
    dealIntelligence: true,
    emailTracking: true,
    linkedinMonitoring: true,
    calendarSync: true,
    crmIntegration: true,
    autopilot: true,
    analytics: true,
    coaching: true,
    teamLeaderboard: true
  },

  // ============= INTEGRATIONS =============
  integrations: {
    // CRM systems
    crm: {
      enabled: true,
      type: 'custom', // 'salesforce', 'hubspot', 'pipedrive', 'custom'
      webhookUrl: null // Your CRM webhook URL if applicable
    },
    
    // Email tracking
    email: {
      enabled: true,
      provider: 'outlook' // 'outlook', 'gmail', 'custom'
    },
    
    // Calendar
    calendar: {
      enabled: true,
      provider: 'outlook' // 'outlook', 'google', 'custom'
    },
    
    // Communication
    messaging: {
      whatsapp: false,
      sms: false,
      slack: false,
      teams: false
    }
  },

  // ============= VOICE CONFIG =============
  voice: {
    // Mic button customization
    buttonSize: 'w-28 h-28',
    buttonBgIdle: 'bg-blue-600 hover:bg-blue-500',
    buttonBgRecording: 'bg-red-600 hover:bg-red-500 animate-pulse',
    
    // Context fields for your workflows
    contextFields: [
      { name: 'prospect_name', placeholder: 'Prospect name', required: false },
      { name: 'company', placeholder: 'Company name', required: false }
    ],
    
    // Custom intents your app handles
    customIntents: []
  },

  // ============= WORKFLOWS =============
  // Define workflows that match your business logic
  workflows: {
    prospectEngagement: {
      enabled: true,
      stages: ['prospecting', 'qualification', 'proposal', 'negotiation', 'closing']
    },
    dealTracking: {
      enabled: true,
      minValue: 0,
      maxValue: 1000000
    },
    teamManagement: {
      enabled: true,
      roles: ['admin', 'manager', 'rep', 'viewer']
    }
  },

  // ============= API ENDPOINTS =============
  // If using external APIs, configure here
  api: {
    baseUrl: import.meta.env.VITE_API_URL || window.location.origin,
    timeout: 30000,
    retries: 3
  },

  // ============= CUSTOMIZATION HOOKS =============
  // These functions run at key points - override for custom behavior
  hooks: {
    /**
     * Run before voice command execution
     * Return false to cancel
     */
    beforeVoiceCommand: async (transcription, context) => {
      console.log('Voice command:', transcription);
      return true;
    },

    /**
     * Run after successful voice command
     */
    afterVoiceCommand: async (result) => {
      console.log('Command result:', result);
    },

    /**
     * Transform prospect data before display
     */
    transformProspectData: (prospect) => {
      return prospect;
    },

    /**
     * Transform deal data before display
     */
    transformDealData: (deal) => {
      return deal;
    }
  }
};

export default portabilityConfig;