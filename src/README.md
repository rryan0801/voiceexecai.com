# VoiceRep AI - Voice-Activated Sales Widget

A white-label SaaS platform for sales teams to trigger actions via voice commands. Embeddable widget + Multi-tenant admin dashboard.

## 🎯 What It Does

Sales reps speak a command → Widget records & transcribes → AI parses intent → Executes tool (generates scripts, emails, etc.) → Shows result

## 🚀 Quick Start

### Run Locally
```bash
npm install
npm run dev
```

Visit `http://localhost:5173` to access the dashboard.

### Architecture Overview

**3 Layers:**
1. **Database** - Client, Command, UsageMeter entities
2. **Backend** - 7 serverless functions (transcription, intent parsing, execution, usage tracking)
3. **Frontend** - Embeddable widget + admin dashboard

**LLM Stack:**
- **Transcription** - Google Gemini (audio multimodal)
- **Intent Parsing** - Claude (your preference)
- **Execution** - HeyRichyAI (your platform)

## 📦 Features

✅ **Dashboard**
- Create/manage SaaS clients
- Track API usage & quotas
- View command history & success rates
- Real-time analytics charts

✅ **Widget (Embeddable)**
- One-click voice recording
- Customizable colors, position, title
- Per-client tool restrictions
- Lightweight (~15KB)

✅ **Backend Pipeline**
- 5-step voice-to-action flow
- Full command tracking
- Monthly usage billing
- Webhook support (future)

## 🔧 Configuration

### Add API Keys
In Base44 dashboard → Settings → Environment Variables:
```
GOOGLE_GEMINI_API_KEY=sk-...
CLAUDE_API_KEY=sk-...
HEYRICHY_API_KEY=sk-...
```

### Then Update Functions
Replace TODO sections in:
- `functions/transcribeAudio.js`
- `functions/parseIntent.js`
- `functions/executeCommand.js`

### Deploy Widget
```html
<script 
  src="https://your-app.com/voiceexec-widget.js" 
  data-api-key="vrep_xxx">
</script>
```

## 📊 Database Schema

**Client**
- company_name, api_key, heyrichy_account_id
- widget_config (colors, position, tools)
- monthly_quota, status

**Command**
- client_id, audio_url, transcription
- detected_intent, parameters
- execution_result, status, error_message
- processing_time_ms

**UsageMeter**
- client_id, month
- total_requests, failed_requests
- average_response_time_ms, cost_estimate

## 🛠️ Backend Functions

| Function | Purpose | Input | Output |
|----------|---------|-------|--------|
| verifyApiKey | Validate API key | api_key | client_config |
| transcribeAudio | Convert audio→text | audio_url | transcription |
| parseIntent | Identify action | transcription | intent, parameters |
| executeCommand | Run tool | intent, params | result |
| trackUsage | Log metrics | request_type | usage_stats |
| uploadAudio | Store audio file | file | audio_url |
| processCommand | Full pipeline | audio_url | complete_result |

## 🎨 Widget Customization

Per client:
- Primary/accent colors
- Widget position (4 corners)
- Custom title & logo
- Enabled tools list

## 📈 Metrics & Analytics

Dashboard shows:
- Active clients count
- Monthly API requests
- Success rate
- Avg response time
- Command status distribution
- Per-client usage breakdown

## 🔐 Security

- API key validation on all requests
- Client quotas enforced
- Suspended/inactive client blocking
- Optional webhook signatures

## 🚦 Status

✅ Phase 1: Foundation (3 entities + 5 core functions)
✅ Phase 2: Widget (embeddable JavaScript)
✅ Phase 3: Dashboard (admin panel)
⏳ Phase 4: Marketing site (coming)
⏳ API integrations (mock → real)
⏳ Webhooks & billing (future)

## 📚 Documentation

See `VOICEREP_SETUP.md` for detailed setup instructions and API flow diagrams.

## 📝 License

Proprietary - VoiceExec AI Platform

---

**Questions?** Check the function comments for integration points.