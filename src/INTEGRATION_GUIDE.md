# VoiceExec Integration Guide

Drop voice-to-action capability into any Base44 project in minutes.

## Quick Start (5 minutes)

### 1. Copy the Portable Voice Core
```bash
# Copy these files to your project:
src/lib/voiceCore.js
src/components/VoiceWidget.jsx
src/config/voiceConfig.template.js
```

### 2. Create Your Config
```javascript
// config/myVoiceConfig.js
export const voiceConfig = {
  clientId: 'your-client-id', // From your Client entity
  
  title: 'My Voice Feature',
  subtitle: 'Speak to execute actions',
  
  contextFields: [
    { name: 'prospect_name', placeholder: 'Who are you talking to?' },
    { name: 'company', placeholder: 'Their company' }
  ],
  
  onSuccess: (data) => {
    console.log('Done!', data.result);
    // Handle your success
  },
  
  onError: (msg) => {
    console.error('Failed:', msg);
    // Handle your error
  }
};
```

### 3. Use the Widget
```jsx
// In any page/component:
import VoiceWidget from '@/components/VoiceWidget';
import { voiceConfig } from '@/config/myVoiceConfig';

export default function MyPage() {
  return <VoiceWidget config={voiceConfig} />;
}
```

**That's it.** Your project now has voice-to-action.

---

## Architecture

### Core Components

#### `VoiceCore` (lib/voiceCore.js)
- **Responsibility**: Voice capture → transcription → routing → execution
- **No dependencies on**: Pages, routes, or app-specific logic
- **Pure functions**: Initialize, startRecording, stopRecording, reset
- **Callbacks**: onStatusChange, onTranscription, onResult, onError

```javascript
const voiceCore = new VoiceCore({
  clientId: 'my-client',
  context: { prospect: 'John Doe' },
  onStatusChange: (phase) => console.log(phase),
  onResult: (data) => console.log(data)
});

await voiceCore.startRecording();
// ... user speaks ...
voiceCore.stopRecording();
```

#### `VoiceWidget` (components/VoiceWidget.jsx)
- **Responsibility**: UI only (mic button, timer, results display)
- **Props**: `config` object
- **Customizable**: Colors, text, buttons, context fields, feature toggles
- **Stateless**: Delegates all logic to VoiceCore

```jsx
<VoiceWidget config={{
  title: 'Custom Title',
  buttonBgIdle: 'bg-green-600',
  contextFields: [...]
}} />
```

---

## Customization

### UI Customization
```javascript
const voiceConfig = {
  // Colors & sizing
  buttonBgIdle: 'bg-purple-600 hover:bg-purple-500',
  buttonBgRecording: 'bg-pink-600 animate-bounce',
  buttonSize: 'w-32 h-32',
  containerBg: 'bg-gradient-to-b from-gray-900 to-gray-800',
  
  // Toggle features
  showHeader: true,        // Title & subtitle
  showStatus: true,        // Status display during processing
  showTimer: true,         // Countdown timer during recording
  showFooter: true,        // Footer credit
  
  // Text
  title: 'Custom Title',
  subtitle: 'Custom subtitle',
  footer: 'Custom footer'
};
```

### Context Fields
```javascript
const voiceConfig = {
  contextFields: [
    {
      name: 'prospect_name',
      placeholder: 'Prospect name'
    },
    {
      name: 'deal_value',
      placeholder: 'Deal value ($)'
    }
  ],
  
  // Pre-populated values (optional)
  initialContext: {
    prospect_name: 'John Doe'
  }
};
```

These fields are collected BEFORE recording and passed to your backend functions.

### Callbacks
```javascript
const voiceConfig = {
  onSuccess: (data) => {
    // data.transcription - what user said
    // data.result - command result from backend
    // data.commandId - can use to fetch full details
    
    // Update your UI, navigate, etc.
  },
  
  onError: (errorMsg) => {
    // User-friendly error message
    // Show toast, log, etc.
  }
};
```

---

## Backend Integration

The VoiceWidget calls your existing Backend functions:

1. **uploadAudio** - Stores the audio file
2. **createCommand** - Creates a Command record for tracking
3. **transcribeAudioStream** - Converts audio to text
4. **executeVoiceCommandStream** - Routes intent & executes action

These are **already implemented** in your Base44 backend. The VoiceWidget works out-of-the-box with them.

### If you need custom behavior:
Modify the `executeVoiceCommandStream` function or create a new routing function that matches your intents.

```javascript
// In executeVoiceCommandStream, add your custom intents:
if (intent === 'my_custom_action') {
  return await doMyCustomAction(context);
}
```

---

## Examples

### Sales Rep Voice Integration
```javascript
const voiceConfig = {
  title: 'Sales Rep Commands',
  contextFields: [
    { name: 'prospect', placeholder: 'Prospect name' },
    { name: 'company', placeholder: 'Company' }
  ],
  onSuccess: (data) => {
    showToast(`Command: ${data.result.summary}`);
    refetchProspects(); // Refresh your data
  }
};
```

### Support Agent Voice Integration
```javascript
const voiceConfig = {
  title: 'Ticket Voice Actions',
  contextFields: [
    { name: 'ticket_id', placeholder: 'Ticket #' },
    { name: 'customer', placeholder: 'Customer name' }
  ],
  containerBg: 'bg-gradient-to-b from-blue-900 to-blue-800',
  buttonBgIdle: 'bg-blue-600',
  onSuccess: (data) => {
    updateTicketWithResult(data);
  }
};
```

### Embedded Widget (e.g., in a sidebar)
```jsx
// Make it smaller and less intrusive
const voiceConfig = {
  buttonSize: 'w-16 h-16',
  showHeader: false,
  containerBg: 'bg-slate-100',
  buttonBgIdle: 'bg-blue-500'
};

export default function Sidebar() {
  return (
    <aside className="w-64">
      {/* Other sidebar content */}
      <div className="mt-4">
        <VoiceWidget config={voiceConfig} />
      </div>
    </aside>
  );
}
```

---

## Project Checklist

- [ ] Copy `voiceCore.js` to your `lib/` folder
- [ ] Copy `VoiceWidget.jsx` to your `components/` folder
- [ ] Copy `voiceConfig.template.js` to your `config/` folder
- [ ] Create your custom `voiceConfig.js` 
- [ ] Import and use `<VoiceWidget config={voiceConfig} />`
- [ ] Test: Click button, speak a command
- [ ] Check backend function logs for execution
- [ ] Customize styling to match your brand
- [ ] Add context fields for your use case
- [ ] Hook up onSuccess/onError callbacks

---

## Troubleshooting

**Q: Mic permission denied**
- A: Browser will show a permission prompt. Grant microphone access.

**Q: Audio upload fails**
- A: Check `uploadAudio` function. Ensure API endpoint is correct.

**Q: Command not executing**
- A: Check `executeVoiceCommandStream`. Verify intent routing logic.

**Q: Stuck in "processing" state**
- A: Check browser console for errors. Check backend function logs.

---

## What's Portable vs What's App-Specific

### ✅ Portable (use everywhere)
- VoiceCore
- VoiceWidget
- voiceConfig template
- Backend functions (uploadAudio, transcribeAudioStream, etc.)

### ❌ App-Specific (modify for your needs)
- Page-level logic (Dashboard, DealIntelligence, etc.)
- Entity schemas (Client, Prospect, DealScore, etc.)
- Custom intents and routing rules
- Styling beyond what VoiceWidget exposes

---

## Support

For issues or questions about portability:
1. Check this guide
2. Review `voiceCore.js` and `VoiceWidget.jsx` code
3. Check backend function logs
4. Verify `clientId` is correct

The voice core is **intentionally minimal** so it works in any project. If you need advanced features, extend it in your own code rather than modifying the core.

Happy shipping! 🚀