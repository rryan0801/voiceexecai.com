# VoiceExec Quick Start (5 Minutes)

**Copy these 6 files into your project, customize 1 config, and you have voice.**

## 📋 Files to Copy

Copy these files into your project structure:

```
your-project/
├── lib/
│   ├── voiceCore.js          ← Copy from VoiceExec
│   └── entityAdapter.js      ← Copy from VoiceExec
├── components/
│   └── VoiceWidget.jsx       ← Copy from VoiceExec
└── config/
    └── portabilityConfig.js  ← Copy & customize (see below)
```

## ⚙️ Customize portabilityConfig.js

Open `config/portabilityConfig.js` and fill in these 3 placeholders:

### 1. Map Your Entities
```javascript
entities: {
  Prospect: 'YourProspectEntity',      // ← Change to your entity name
  Deal: 'YourDealEntity',
  Command: 'YourCommandEntity'
}
```

### 2. Map Your Fields
```javascript
fieldMappings: {
  prospect: {
    name_field: 'full_name',           // ← Match your schema
    email_field: 'email_address',
    company_field: 'company_name'
  }
}
```

### 3. Set Your API Base
```javascript
api: {
  baseUrl: 'https://your-api.com',     // ← Your backend URL
  timeout: 30000
}
```

## 🎤 Add the Widget to Your Page

```jsx
import VoiceWidget from '@/components/VoiceWidget';

export default function MyPage() {
  const voiceConfig = {
    clientId: 'your-client-id',
    title: 'Voice Command',
    contextFields: [
      { name: 'prospect_name', placeholder: 'Who?' },
      { name: 'prospect_company', placeholder: 'Company?' }
    ],
    onSuccess: (data) => console.log('Done:', data),
    onError: (msg) => console.error('Error:', msg)
  };

  return <VoiceWidget config={voiceConfig} />;
}
```

## 🚀 That's It

Your voice widget is live. Click the mic button and speak a command. The backend will:
1. Transcribe audio
2. Parse intent
3. Execute action
4. Return result

## 📚 Need More?

- **Full details**: See [PORTABILITY_GUIDE.md](./PORTABILITY_GUIDE.md)
- **Backend setup**: See [INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)
- **Architecture**: See [VOICEREP_SETUP.md](./VOICEREP_SETUP.md)

## 💡 Notes

- `VoiceCore` handles audio capture + pipeline (no dependencies)
- `EntityAdapter` auto-maps your schema (no code changes needed)
- `VoiceWidget` is fully customizable UI (colors, size, callbacks)
- `portabilityConfig.js` is your single source of truth

Copy 6 files, customize 1 config, done.