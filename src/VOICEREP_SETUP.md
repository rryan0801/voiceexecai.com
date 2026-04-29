# VoiceRep AI - Complete Setup Guide

## Project Structure

### **Entities (Database)**
- `Client` - SaaS clients with customizable widget configs
- `Command` - Voice commands with full processing pipeline tracking
- `UsageMeter` - Monthly usage analytics per client

### **Backend Functions (5 Core Functions)**

1. **verifyApiKey.js**
   - Validates API key and returns client config
   - Called by widget before any processing

2. **transcribeAudio.js**
   - Transcribes audio using Google Gemini multimodal
   - TODO: Replace mock response with real Gemini API call
   - `Deno.env.get('GOOGLE_GEMINI_API_KEY')`

3. **parseIntent.js**
   - Parses intent using Claude LLM
   - TODO: Replace mock with real Claude API call
   - `Deno.env.get('CLAUDE_API_KEY')`

4. **executeCommand.js**
   - Executes parsed intent via HeyRichyAI API
   - TODO: Replace mock with real HeyRichyAI call
   - `Deno.env.get('HEYRICHY_API_KEY')`

5. **trackUsage.js**
   - Records API usage for billing & quotas
   - Auto-creates monthly UsageMeter records

### **Supporting Functions**

6. **uploadAudio.js**
   - Handles audio file uploads
   - TODO: Integrate with S3/GCS for cloud storage

7. **processCommand.js**
   - Orchestrates full pipeline (transcribe → parse → execute → track)
   - Single entry point for widget

### **Frontend**

**Widget (Embeddable)**
- `public/voicerep-widget.js` - Standalone JavaScript widget
- Recording, playback, customizable UI
- Full voice-to-action pipeline
- Usage: `<script src="..." data-api-key="..."></script>`

**Dashboard (Admin Panel)**
- `pages/Dashboard.jsx` - Main admin interface
- `components/dashboard/` - 4 sub-components
  - ClientsList.jsx - Client management & API key display
  - ClientForm.jsx - New client creation
  - WidgetConfigurator.jsx - Customization editor
  - CommandHistory.jsx - Command logs & debugging

---

## Getting Started

### 1. Test the Dashboard
Navigate to `/` and you'll see the admin dashboard.

### 2. Create Your First Client
1. Click "+ New Client"
2. Fill in company name and HeyRichyAI account ID
3. Customize widget colors/position
4. Copy the embed code

### 3. Deploy Widget to Your Site
Add to any HTML page:
```html
<script 
  src="https://yourapp.com/voicerep-widget.js" 
  data-api-key="[generated API key]">
</script>
```

### 4. Add Real API Integrations
When ready, add your API keys to Base44 secrets:

**Google Gemini** (Transcription)
```
GOOGLE_GEMINI_API_KEY=your_key_here
```

**Claude** (Intent Parsing)
```
CLAUDE_API_KEY=your_key_here
```

**HeyRichyAI** (Execution)
```
HEYRICHY_API_KEY=your_key_here
```

Then replace the mock responses in:
- `functions/transcribeAudio.js` (lines with TODO)
- `functions/parseIntent.js` (lines with TODO)
- `functions/executeCommand.js` (lines with TODO)

---

## API Flow Diagram

```
User speaks → Widget records audio
                    ↓
         uploadAudio() → S3/GCS
                    ↓
         processCommand() [Main Orchestrator]
                    ↓
    ┌───────────────┼───────────────┐
    ↓               ↓               ↓
transcribeAudio   parseIntent   executeCommand
(Gemini)          (Claude)       (HeyRichyAI)
    ↓               ↓               ↓
    └───────────────┼───────────────┘
                    ↓
            trackUsage() [Analytics]
                    ↓
         Command record updated
         Response sent to widget
```

---

## Widget Customization Options

Each client can configure:
- **Colors**: primary, secondary, accent
- **Position**: bottom-right, bottom-left, top-right, top-left
- **Title**: Custom widget title
- **Logo**: Brand logo URL
- **Tools**: Which actions are available
  - cold_call_script
  - follow_up_email
  - objection_handler
  - meeting_recap
  - competitor_research

---

## Key Files Quick Reference

**Backend**
- Core logic: `functions/` (7 files)
- Database: `entities/` (3 JSON files)

**Frontend**
- Widget: `public/voicerep-widget.js`
- Dashboard: `pages/Dashboard.jsx` + `components/dashboard/`

**Config**
- Routes: `App.jsx`
- Styling: `index.css`, `tailwind.config.js`

---

## Next Steps

1. ✅ Build test data (create a test client)
2. ✅ Test widget on your HeyRichy site
3. ✅ Add real API keys
4. ✅ Replace mock responses with live calls
5. ✅ Custom branding & theming
6. ✅ Launch to production

**Questions?** Check function comments with TODO markers for integration points.