# VoiceExec Complete Portability Guide

Deploy VoiceExec to ANY project in 30 minutes.

---

## 🚀 Quick Start (5 Steps)

### Step 1: Copy VoiceExec Files
```bash
# Copy these folders to your project:
src/lib/voiceCore.js
src/lib/entityAdapter.js
src/components/VoiceWidget.jsx
src/components/GenericProspectList.jsx
src/config/portabilityConfig.js
src/config/voiceConfig.template.js
```

### Step 2: Customize portabilityConfig.js
```javascript
// config/portabilityConfig.js
export const portabilityConfig = {
  projectName: 'Your Project',
  
  entities: {
    client: 'YourClientEntity',       // Your entity names
    prospect: 'YourProspectEntity',
    command: 'CommandLog',
    // ... etc
  },
  
  fieldMapping: {
    prospectName: 'your_prospect_field',  // Your field names
    prospectEmail: 'your_email_field',
    // ... etc
  },
  
  // ... rest of config
};
```

### Step 3: Create Your Voice Config
```javascript
// config/myVoiceConfig.js
import { voiceConfig } from '@/config/voiceConfig.template';

export default {
  ...voiceConfig,
  clientId: 'your-client-id',
  title: 'Your App Title',
  contextFields: [
    // Your custom fields
  ]
};
```

### Step 4: Use VoiceWidget
```jsx
// Anywhere in your app:
import VoiceWidget from '@/components/VoiceWidget';
import voiceConfig from '@/config/myVoiceConfig';

export default function MyPage() {
  return <VoiceWidget config={voiceConfig} />;
}
```

### Step 5: Use EntityAdapter for Prospects
```jsx
// Instead of calling entity directly:
import EntityAdapter from '@/lib/entityAdapter';

const prospects = await EntityAdapter.listProspects();
const prospect = await EntityAdapter.getProspect(id);
```

---

## 📋 File Structure

```
Your Project/
├── src/
│   ├── lib/
│   │   ├── voiceCore.js           (Core voice logic)
│   │   └── entityAdapter.js       (Entity abstraction)
│   ├── components/
│   │   ├── VoiceWidget.jsx        (Voice UI)
│   │   └── GenericProspectList.jsx (Reusable list)
│   ├── config/
│   │   ├── portabilityConfig.js   (Your customizations)
│   │   └── voiceConfig.template.js (Voice defaults)
│   └── pages/
│       └── MyPage.jsx             (Use VoiceWidget here)
```

---

## 🔧 Configuration Reference

### portabilityConfig.js

#### entities
Map to your actual entity names:
```javascript
entities: {
  client: 'Client',           // Your entity
  prospect: 'Prospect',       // Your entity
  command: 'Command',         // Required for voice
  deal: 'Opportunity',        // Your entity
  interaction: 'Activity',    // Your entity
  user: 'User'               // Required
}
```

#### fieldMapping
Map to your actual field names:
```javascript
fieldMapping: {
  prospectName: 'contact_name',      // Not prospect_name
  prospectEmail: 'contact_email',    // Not email
  company: 'customer_company'        // Not company_name
  // etc...
}
```

#### voice
```javascript
voice: {
  buttonSize: 'w-28 h-28',
  buttonBgIdle: 'bg-blue-600',
  contextFields: [
    { name: 'field_name', placeholder: 'User sees this' }
  ]
}
```

#### features
Enable only what you need:
```javascript
features: {
  voiceCommands: true,    // Always true for VoiceWidget
  dealIntelligence: true, // Enable deal tracking
  emailTracking: false,   // Disable if not using
  // ... etc
}
```

#### integrations
Connect your CRM:
```javascript
integrations: {
  crm: {
    enabled: true,
    type: 'salesforce',  // 'salesforce', 'hubspot', 'custom'
    webhookUrl: 'https://your-crm.com/webhook'
  }
}
```

#### hooks
Run custom logic at key points:
```javascript
hooks: {
  beforeVoiceCommand: async (transcription, context) => {
    // Validate, log, etc
    return true; // Or false to cancel
  },
  
  afterVoiceCommand: async (result) => {
    // Update your UI, sync CRM, etc
  }
}
```

---

## 🎯 Common Scenarios

### Scenario 1: Salesforce Integration
```javascript
// config/portabilityConfig.js
entities: {
  prospect: 'SalesforceContact',
  deal: 'SalesforceOpportunity'
},

integrations: {
  crm: {
    type: 'salesforce',
    webhookUrl: 'https://your-instance.salesforce.com/webhook'
  }
}
```

### Scenario 2: HubSpot Integration
```javascript
entities: {
  prospect: 'HubSpotContact',
  deal: 'HubSpotDeal'
},

integrations: {
  crm: {
    type: 'hubspot'
  }
}
```

### Scenario 3: Custom Entity Names
```javascript
entities: {
  prospect: 'Contact',        // Your name
  deal: 'Opportunity',        // Your name
  command: 'VoiceLog',        // Your name
  client: 'Account'           // Your name
},

fieldMapping: {
  prospectName: 'contact_full_name',
  prospectEmail: 'primary_email',
  company: 'company_name'
  // Map all fields your entities use
}
```

### Scenario 4: Custom Voice Context
```javascript
voice: {
  contextFields: [
    {
      name: 'deal_value',
      placeholder: 'Deal value ($)',
      required: true
    },
    {
      name: 'close_date',
      placeholder: 'Expected close date',
      required: false
    }
  ]
}
```

---

## 📦 Using EntityAdapter

### Unified entity access across your app:

```javascript
import EntityAdapter from '@/lib/entityAdapter';

// Get a prospect
const prospect = await EntityAdapter.getProspect(id);

// List prospects with filtering
const prospects = await EntityAdapter.listProspects(
  { status: 'active' },  // Filter
  '-updated_date',       // Sort
  50                     // Limit
);

// Create a prospect
const newProspect = await EntityAdapter.createProspect({
  name: 'John Doe',
  email: 'john@company.com',
  company: 'Acme Corp'
});

// Update a prospect
await EntityAdapter.updateProspect(id, {
  company: 'New Company'
});

// Record an interaction
await EntityAdapter.recordInteraction(prospectId, {
  type: 'call',
  notes: 'Discussed Q2 proposal',
  duration: 30
});

// Get a deal
const deal = await EntityAdapter.getDeal(id);

// List deals
const deals = await EntityAdapter.listDeals({ status: 'open' });
```

The adapter automatically maps your field names via `fieldMapping`.

---

## 🎤 Using VoiceWidget

### Basic Usage
```jsx
import VoiceWidget from '@/components/VoiceWidget';

const config = {
  clientId: 'your-client-id',
  title: 'Voice Command',
  onSuccess: (data) => {
    console.log('Success:', data.result);
  }
};

export default function Page() {
  return <VoiceWidget config={config} />;
}
```

### Advanced Configuration
```jsx
const config = {
  clientId,
  
  // UI
  title: 'Sales Commands',
  subtitle: 'Speak to your CRM',
  buttonSize: 'w-32 h-32',
  buttonBgIdle: 'bg-green-600',
  
  // Context
  contextFields: [
    { name: 'prospect', placeholder: 'Who?' },
    { name: 'action', placeholder: 'What?' }
  ],
  initialContext: { prospect: 'Pre-filled' },
  
  // Callbacks
  onSuccess: async (data) => {
    await updateCRM(data);
    refetchData();
  },
  
  onError: (msg) => {
    showToast(msg, 'error');
  },
  
  // Features
  showHeader: true,
  showTimer: true,
  showStatus: true
};
```

---

## 🔌 Backend Functions

VoiceExec uses these backend functions. They should already exist in Base44:

- `uploadAudio` - Store voice recording
- `createCommand` - Log command execution
- `transcribeAudioStream` - Convert audio → text
- `executeVoiceCommandStream` - Route intent & execute

**If you need custom intents:**
Modify `executeVoiceCommandStream` to handle your actions:

```javascript
// In your backend:
if (intent === 'my_custom_action') {
  return await myCustomFunction(context);
}
```

---

## ✅ Validation Checklist

- [ ] portabilityConfig.js created with your entity names
- [ ] fieldMapping updated for your fields
- [ ] Voice config file created
- [ ] VoiceWidget imported and used
- [ ] EntityAdapter imported where needed
- [ ] Backend functions verified
- [ ] Context fields customized
- [ ] Test voice recording works
- [ ] Test command execution
- [ ] Test callbacks fire

---

## 🚨 Troubleshooting

**Q: "Entity not found"**
- Check entity names in portabilityConfig.js match your entities exactly

**Q: "Field mapping error"**
- Verify fieldMapping keys match your actual entity fields

**Q: "Voice widget doesn't show"**
- Check clientId is correct
- Verify component imported
- Check browser console for errors

**Q: "Command not executing"**
- Check backend function logs
- Verify intent is recognized
- Check hooks are firing

**Q: "Stuck in processing state"**
- Check browser console for errors
- Verify backend functions are responding
- Check API endpoint URLs

---

## 📚 What's Portable vs What's Custom

### ✅ Portable (use as-is)
- VoiceCore
- VoiceWidget
- EntityAdapter
- Backend functions
- Voice config template

### ⚙️ Customize (per your needs)
- Entity schema
- Field names/types
- Business logic
- Workflows
- Integrations
- Context fields
- UI styling

### ❌ Don't Touch (unless needed)
- VoiceCore internals
- VoiceWidget component logic
- EntityAdapter mappings (use config instead)

---

## 🎓 Examples

Full examples for common use cases in `/examples` folder:
- Salesforce integration
- HubSpot integration
- Custom CRM
- Support ticketing
- Team collaboration
- E-commerce

---

## 🆘 Support

1. **Check this guide first** - Most answers are here
2. **Review config examples** - Copy & customize
3. **Check browser console** - Error messages help
4. **Review backend logs** - See what functions are doing
5. **Verify entity schema** - Match names exactly

The voice core is intentionally simple so it works everywhere. Extend it for your specific needs, but don't modify the core.

---

## 🎉 You're Done!

Your project now has enterprise voice-to-action. Go ship it. 🚀