# VoiceRep AI - Architecture & Design

## System Overview

```
┌────────────────────────────────────────────────────────────────┐
│                      CLIENT WEBSITES                            │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │  <script src="voicerep-widget.js" data-api-key="...">   │  │
│  │                                                           │  │
│  │  ┌─────────────────────────────────────────────────┐   │  │
│  │  │  VoiceRep Widget (15KB JavaScript)              │   │  │
│  │  │  ┌──────────┬──────────┬──────────────────────┐ │   │  │
│  │  │  │ 🎤 Voice │ Recorder │ API Client         │ │   │  │
│  │  │  │ Recording│ UI       │ Config Fetcher     │ │   │  │
│  │  │  └──────────┴──────────┴──────────────────────┘ │   │  │
│  │  └─────────────────────────────────────────────────┘   │  │
│  └──────────────────────────────────────────────────────────┘  │
└────────────────────────┬─────────────────────────────────────┘
                         │
                    API Requests
                    (HTTP POST)
                         │
        ┌────────────────▼─────────────────┐
        │    BASE44 BACKEND PLATFORM       │
        │  (Deno Deploy Serverless)        │
        │                                   │
        │  ┌─────────────────────────────┐ │
        │  │  processCommand() [Main]    │ │
        │  │  (Command Orchestrator)     │ │
        │  └──────────────┬──────────────┘ │
        │   ┌────────────▼─────────────┐   │
        │   │ Step 1: Upload Audio     │   │
        │   │ (uploadAudio)            │   │
        │   └────────────┬─────────────┘   │
        │   ┌────────────▼─────────────┐   │
        │   │ Step 2: Verify API Key   │   │
        │   │ (verifyApiKey)           │   │
        │   └────────────┬─────────────┘   │
        │   ┌────────────▼─────────────────────────────┐ │
        │   │ Step 3: Transcribe Audio (Convert → Txt) │ │
        │   │ (transcribeAudio)                        │ │
        │   │ └→ Google Gemini API                     │ │
        │   │ TODO: Replace mock with real API        │ │
        │   └────────────┬─────────────────────────────┘ │
        │   ┌────────────▼─────────────────────────────┐ │
        │   │ Step 4: Parse Intent (Text → Meaning)   │ │
        │   │ (parseIntent)                           │ │
        │   │ └→ Claude LLM API                       │ │
        │   │ TODO: Replace mock with real API        │ │
        │   └────────────┬─────────────────────────────┘ │
        │   ┌────────────▼─────────────────────────────┐ │
        │   │ Step 5: Execute Action (Meaning → Tool) │ │
        │   │ (executeCommand)                        │ │
        │   │ └→ HeyRichyAI API                       │ │
        │   │ TODO: Replace mock with real API        │ │
        │   └────────────┬─────────────────────────────┘ │
        │   ┌────────────▼─────────────────────────────┐ │
        │   │ Step 6: Track Usage & Analytics        │ │
        │   │ (trackUsage)                           │ │
        │   └────────────┬─────────────────────────────┘ │
        │               │                                 │
        │  ┌────────────▼──────────────────────────────┐ │
        │  │  BASE44 ENTITIES (Database)              │ │
        │  │  ┌──────────┬──────────┬─────────────┐  │ │
        │  │  │ Client   │ Command  │ UsageMeter  │  │ │
        │  │  │ (configs)│ (logs)   │ (stats)     │  │ │
        │  │  └──────────┴──────────┴─────────────┘  │ │
        │  └─────────────────────────────────────────┘ │
        │                                               │
        └───────────────────┬───────────────────────────┘
                            │
                    Response (JSON)
                            │
        ┌───────────────────▼────────────────┐
        │  ADMIN DASHBOARD (React)            │
        │  ┌──────────────────────────────┐  │
        │  │ Dashboard Page               │  │
        │  │ - 4 stat cards               │  │
        │  │ - Usage charts               │  │
        │  │ - 4 tabs (Overview/Clients/  │  │
        │  │   Commands/Settings)         │  │
        │  ├──────────────────────────────┤  │
        │  │ ClientsList Component        │  │
        │  │ - List clients               │  │
        │  │ - Copy API keys              │  │
        │  │ - Copy embed code            │  │
        │  ├──────────────────────────────┤  │
        │  │ ClientForm Component         │  │
        │  │ - Create new clients         │  │
        │  │ - Set quota & config         │  │
        │  ├──────────────────────────────┤  │
        │  │ WidgetConfigurator Component │  │
        │  │ - Live preview               │  │
        │  │ - Color customization        │  │
        │  │ - Tool selection             │  │
        │  ├──────────────────────────────┤  │
        │  │ CommandHistory Component     │  │
        │  │ - View recent commands       │  │
        │  │ - Status & error tracking    │  │
        │  └──────────────────────────────┘  │
        └─────────────────────────────────────┘
```

---

## Data Flow

### User Voice Command Flow

```
1. USER SPEAKS
   ↓
2. Widget Records Audio → Encodes to MP3
   ↓
3. POST /processCommand
   ├─ X-API-Key: vrep_xxx
   ├─ audio_url: https://storage.com/audio.mp3
   └─ client_id: abc123
   ↓
4. BACKEND PIPELINE STARTS
   │
   ├─ Step 1: verifyApiKey
   │  └─ ✅ Validates key, loads client config
   │
   ├─ Step 2: uploadAudio
   │  └─ ✅ Stores audio file
   │
   ├─ Step 3: transcribeAudio [TODO: Gemini API]
   │  └─ "Generate a cold call script for TechCorp"
   │
   ├─ Step 4: parseIntent [TODO: Claude API]
   │  └─ intent: "cold_call_script"
   │     confidence: 0.95
   │     parameters: {company: "TechCorp", industry: "tech"}
   │
   ├─ Step 5: executeCommand [TODO: HeyRichyAI API]
   │  └─ result: "Hi [Name], I came across TechCorp..."
   │
   ├─ Step 6: trackUsage
   │  └─ Updates monthly usage meter, checks quota
   │
   └─ Step 7: Update Command Record
      └─ status: "completed", processing_time_ms: 2341
   ↓
5. RESPONSE SENT TO WIDGET
   ├─ transcription: "Generate a cold call..."
   ├─ detected_intent: "cold_call_script"
   ├─ result: "Hi [Name]..."
   └─ processing_time_ms: 2341
   ↓
6. WIDGET DISPLAYS RESULT
   ├─ Shows transcription
   ├─ Shows result in UI
   ├─ Buttons: "Use This" / "Clear"
   └─ User can copy to clipboard
   ↓
7. ADMIN SEES IN DASHBOARD
   └─ Command History shows:
      ├─ Status: completed ✅
      ├─ Intent: cold_call_script
      ├─ Transcription preview
      └─ Processing time
```

---

## Component Hierarchy

### Dashboard
```
Dashboard.jsx (Main Container)
├── Header (Title + Create Button)
├── Stats Cards (4 columns)
│   ├── Total Clients
│   ├── Total Requests
│   ├── Success Rate
│   └── Avg Response Time
├── Tabs
│   ├── Overview Tab
│   │   └── Charts
│   │       ├── BarChart (Client Usage)
│   │       └── PieChart (Command Status)
│   ├── Clients Tab
│   │   ├── ClientsList (if not creating)
│   │   │   └── ClientItem (repeating)
│   │   │       ├── API Key Display
│   │   │       ├── Embed Code
│   │   │       └── Actions
│   │   └── ClientForm (if creating)
│   │       ├── Company Info
│   │       └── Widget Config
│   ├── Commands Tab
│   │   └── CommandHistory
│   │       └── CommandItem (repeating)
│   │           ├── Status Badge
│   │           ├── Transcription
│   │           ├── Error Message (if failed)
│   │           └── Result (if completed)
│   └── Settings Tab
│       └── WidgetConfigurator
│           ├── Live Preview
│           ├── Color Pickers
│           ├── Position Selector
│           ├── Tool Checkboxes
│           └── Save Button
```

---

## Database Schema (Entity Relationships)

```
┌──────────────────────┐
│      Client          │
├──────────────────────┤
│ id (PK)              │
│ company_name         │
│ api_key              │
│ heyrichy_account_id  │
│ widget_config {}     │
│ monthly_quota        │
│ status               │
├──────────────────────┤
│ 1 ──────────┐
└──────────────────────┘
               │
               │ has many
               │
        ┌──────▼──────────────┐
        │      Command        │
        ├─────────────────────┤
        │ id (PK)             │
        │ client_id (FK) ────→│ Client.id
        │ audio_url           │
        │ transcription       │
        │ detected_intent     │
        │ parameters {}       │
        │ execution_result {} │
        │ status              │
        │ error_message       │
        │ processing_time_ms  │
        └─────────────────────┘

        ┌──────────────────────┐
        │     UsageMeter       │
        ├──────────────────────┤
        │ id (PK)              │
        │ client_id (FK) ─────→│ Client.id
        │ month                │
        │ total_requests       │
        │ transcription_req... │
        │ intent_parsing_req.. │
        │ execution_req...     │
        │ failed_requests      │
        │ avg_response_time_ms │
        │ cost_estimate        │
        └──────────────────────┘
```

**Relationships:**
- Client (1) ──→ (Many) Command
- Client (1) ──→ (Many) UsageMeter
- Each month has one UsageMeter per client (unique constraint)

---

## Function Call Order

### Widget Initialization
```
1. voicerep-widget.js loads
   └─ 2. verifyApiKey()
       └─ ✅ Loads client config
       └─ Creates widget UI
```

### Command Processing
```
1. User clicks record button
   └─ 2. Browser records audio
   └─ 3. convertToMP3() [Browser-side]
   └─ 4. POST /uploadAudio
       └─ ✅ Returns: audio_url
   └─ 5. POST /processCommand
       └─ 6. verifyApiKey()
       └─ 7. uploadAudio() [backup]
       └─ 8. transcribeAudio()
       └─ 9. parseIntent()
       └─ 10. executeCommand()
       └─ 11. trackUsage()
       └─ ✅ Returns: full result
   └─ 12. Widget displays result
```

---

## Error Handling Strategy

```
┌─────────────────────────────────────────┐
│  Error Occurs in Function               │
└──────────────────────┬──────────────────┘
                       │
                       ├─ Step X Failed
                       │
          ┌────────────▼──────────────┐
          │ Update Command Record     │
          │ status: "failed"          │
          │ error_message: "..."      │
          └────────────┬──────────────┘
                       │
          ┌────────────▼──────────────┐
          │ Return Error to Widget    │
          │ {error: "...", status: XX}│
          └────────────┬──────────────┘
                       │
          ┌────────────▼──────────────┐
          │ Widget Shows Error        │
          │ with retry button         │
          └────────────┬──────────────┘
                       │
          ┌────────────▼──────────────┐
          │ Dashboard Logs Error      │
          │ in Command History        │
          └──────────────────────────┘
```

---

## Security Model

### API Key Validation
```
Request Comes In
   ↓
Extract X-API-Key header
   ↓
Query: Client where api_key == provided_key
   ↓
┌─────────────────────────────────┐
│ If Found:                       │
│ - Check status != suspended     │
│ - Load client config            │
│ - Proceed with request          │
└─────────────────────────────────┘
   │
   └─ If Not Found / Suspended:
      └─ Return 401/403 Unauthorized
```

### Quota Enforcement
```
Request Complete
   ↓
trackUsage() increments counters
   ↓
if (total_requests > monthly_quota)
   ├─ response.quota_exceeded = true
   └─ Client dashboard shows warning
```

---

## Scalability Considerations

### Current Architecture (Handles ~1000 clients)
- Base44 serverless functions (auto-scale)
- Base44 database (standard tier)
- Widget script served from CDN

### Future Improvements
1. **Caching Layer**
   - Cache client configs (5-min TTL)
   - Cache parsed intents (similarity matching)

2. **Async Processing**
   - Queue long audio files
   - Process transcription asynchronously
   - Webhook on completion

3. **Multi-Region**
   - Deploy functions to multiple regions
   - Route based on client geolocation

4. **Database Optimization**
   - Index on (client_id, created_date) for queries
   - Archive old commands (6+ months)
   - Partition UsageMeter by month

---

## Deployment Architecture

```
Developer Machine
       │
       ├─ Development
       └─ npm run dev
            └─ localhost:5173

          │
          │ git push
          │
     GitHub Repo

          │
          │ Automatic Deploy
          │
     Base44 Platform
       │
       ├─ Frontend (Vite build)
       │  └─ Served from CDN
       │
       ├─ Backend Functions
       │  └─ Deno Deploy (serverless)
       │
       ├─ Database
       │  └─ Base44 Entities
       │
       └─ Widget Script
          └─ public/voicerep-widget.js
             └─ Hosted at /voicerep-widget.js

          │
          └─ Production URL
             └─ https://voicerep.app
                 https://voicerep.app/voicerep-widget.js
                 https://voicerep.app/api/*
```

---

## File Size & Performance

| Component | Size | Notes |
|-----------|------|-------|
| voicerep-widget.js | ~15KB | Minified, 3KB gzipped |
| Dashboard bundle | ~250KB | React, charts, UI libs |
| Widget runtime memory | ~5MB | Per browser tab |
| Average request time | ~2-3s | With mock APIs |
| Database query time | ~50-100ms | Per query |

---

## Future Enhancement Roadmap

**Phase 4 (Marketing Site)**
- Landing page
- Pricing calculator
- Integration docs
- Blog/resources

**Phase 5 (Advanced Features)**
- Webhook delivery
- Custom tool creation UI
- A/B testing results
- Advanced analytics

**Phase 6 (Enterprise)**
- White-label branding
- Custom domain
- SSO authentication
- SLA/uptime guarantees
- Dedicated support

---

This architecture is designed to be:
- ✅ **Scalable** - Serverless backend grows with demand
- ✅ **Maintainable** - Clear separation of concerns
- ✅ **Extensible** - Easy to add new tools/features
- ✅ **Secure** - API key validation, quota enforcement
- ✅ **Observable** - Full command history & error tracking