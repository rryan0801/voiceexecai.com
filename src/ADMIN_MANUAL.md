# VoiceExec AI - Administrator Manual

**Version:** 2.0  
**Last Updated:** April 30, 2026  
**Platform:** Base44 SaaS

---

## Table of Contents

1. [System Overview](#system-overview)
2. [Installation & Setup](#installation--setup)
3. [Client Management](#client-management)
4. [Feature Management](#feature-management)
5. [Analytics & Monitoring](#analytics--monitoring)
6. [Security & Permissions](#security--permissions)
7. [Troubleshooting](#troubleshooting)
8. [API Reference](#api-reference)

---

## System Overview

VoiceExec AI is an enterprise sales intelligence platform combining voice commands, AI pattern analysis, and real-time meeting preparation. It operates on a multi-tenant architecture with six core modules:

### Core Modules

1. **Deal Intelligence** - Win probability scoring using interaction data and AutoPilot engagement
2. **Conversation Analytics** - Pattern detection in successful sales emails
3. **Meeting Copilot** - Real-time call prep with competitor/industry intelligence
4. **Email Tone Matching** - Automatic style rewriting to match rep's communication pattern
5. **Team Playbooks** - Manager-defined multi-step sequences per deal stage
6. **Objection Handler** - Real-time AI response suggestions during calls

### System Architecture

- **Frontend:** React 18 + Tailwind CSS (responsive, mobile-friendly)
- **Backend:** Deno serverless functions + Base44 SDK
- **Database:** Base44 managed database (PostgreSQL)
- **AI:** Anthropic Claude (patterns) + OpenAI Whisper (transcription)
- **Integrations:** Outlook, HubSpot, Twilio WhatsApp

---

## Installation & Setup

### Prerequisites

- Base44 account with Production environment enabled
- Claude API key (Anthropic)
- OpenAI API key (Whisper transcription)
- Twilio account (optional, for WhatsApp)
- HubSpot API key (optional, for CRM sync)

### Step 1: Deploy Application

```bash
# Clone repository
git clone <repo-url> voicerep-ai

# Navigate to project
cd voicerep-ai

# Install dependencies (already in package.json)
npm install

# Deploy to Base44
base44 deploy
```

### Step 2: Configure Secrets

In Base44 Dashboard → Settings → Environment Variables:

```
CLAUDE_API_KEY=sk-ant-...
OPENAI_API_KEY=sk-...
HUBSPOT_API_KEY=pat-...
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=+1...
```

### Step 3: Initialize Database

Entities auto-create on first use. No manual migration needed.

### Step 4: Configure OAuth (Optional)

For Outlook integration:
1. Go to each rep's account
2. Click "Connect Outlook" on Prospect Management page
3. Complete OAuth flow with Microsoft 365

---

## Client Management

### Creating New Clients

**Path:** Dashboard → Clients Tab → "+ New Client"

**Required Fields:**
- Company Name
- Monthly API Quota (default: 10,000 requests)
- Enable Widget (checkbox)
- API Key (auto-generated, show once)

**Widget Configuration:**
- Primary/Secondary/Accent Colors
- Brand Logo URL
- Widget Position (bottom-right, etc.)
- Enabled Tools (email, meeting, task, CRM)

### Monitoring Client Usage

**Path:** Dashboard → Overview Tab

**Key Metrics:**
- Total Requests (current month)
- Success Rate (%)
- Average Response Time (ms)
- Failed Requests

**Per-Client Breakdown:**
- BarChart showing requests vs. quota
- Warning if usage > 80% of monthly quota

### Suspending/Activating Clients

**Path:** Dashboard → Clients Tab → [Client] → Status

Options: `active`, `suspended`, `inactive`

When suspended:
- Widget stops accepting requests
- Voice commands return 403 error
- No charges incurred

---

## Feature Management

### 1. Deal Intelligence

**Admin Controls:**
- View all deals dashboard
- Trigger manual score calculation (refresh button)
- Export deal rankings as CSV

**Automation:** Runs hourly via `calculateDealScores` function

**Key Settings:**
- Interaction weight: 30%
- Recency boost: 25%
- AutoPilot progress: 25%
- Engagement: 20%

**To Adjust Weights:** Edit `/functions/calculateDealScores.js` lines 44-73

### 2. Conversation Analytics

**Rep Management:**
- View all team reps (Conversation Analytics page)
- Click "Analyze" to trigger pattern detection
- Patterns auto-save to RepPattern entity

**Pattern Types:**
- `closing_phrase` - High-performing closing statements
- `tone` - Formality, urgency, personal touch
- `opening_approach` - Effective conversation starters
- `success_keyword` - Words correlated with closes
- `objection_response` - Handling techniques

**Admin Insights:**
- Success rate per pattern
- Frequency of use
- AI-generated coaching recommendations

### 3. Meeting Copilot

**Admin Role:** Monitor call prep usage

**Metrics:**
- Calls prepped (Meeting Copilot page views)
- Intel types requested (talking points, objections, etc.)
- Closure correlation (optional tracking)

**Customization:** Edit `/functions/prepMeetingIntel.js` to adjust topics

### 4. Email Tone Matching

**Function:** `analyzeEmailTone`

**Process:**
1. Rep drafts email in widget
2. System analyzes rep's 3 recent emails
3. Returns rewritten version matching their style
4. Rep can accept or edit further

**Admin Access:** View function logs in Base44 Dashboard → Code → Functions

### 5. Team Playbooks

**Management:**
- Create playbooks (Sales Playbooks page)
- Assign to deal stages (prospecting → closing)
- Track usage and success rates
- Edit template email/call content

**Playbook Fields:**
- Name (required)
- Description
- Target Industry
- Deal Stage
- Multi-step sequence with delays

**Success Tracking:** Usage count + success_rate auto-increments when deals using playbook close

### 6. Objection Handler

**Function:** `handleObjection`

**Usage:**
- Rep inputs objection during call
- AI generates 3 response strategies
- Suggests escalation if needed

**Admin Review:** Check function logs for common objections to train team on

---

## Analytics & Monitoring

### Dashboard Overview

**Key Performance Indicators:**

| Metric | Target | Alert Threshold |
|--------|--------|------------------|
| System Uptime | 99.9% | < 98% |
| Avg Response Time | < 2s | > 5s |
| Success Rate | > 95% | < 85% |
| Active Clients | N/A | Low usage = churn risk |

### Command Analytics Page

**Features:**
- Daily volume trends (7/14/30/90-day views)
- Intent distribution (pie chart)
- Per-client usage breakdown
- Success/failure rates by intent

### Team Performance Page

**Manager View:**
- Rep leaderboard (by command count)
- Individual rep drill-down
- Last 10 commands with status
- Hours saved estimation

**Calculation:** Estimated minutes per action type:
- Send Email: 8 min
- Schedule Meeting: 12 min
- Create Task: 4 min
- Log CRM: 6 min
- Generate Document: 20 min

### Alerts & Notifications

**Current:** Manual checks recommended

**Recommendations:**
- Set up daily digest email of system metrics
- Monitor error rates in Base44 Logs
- Check if any client exceeds quota warning

---

## Security & Permissions

### User Roles

**Admin:**
- Full access to dashboard
- Can create/suspend clients
- Can view all analytics
- Can configure system settings

**Manager:**
- View own team's performance
- Create playbooks
- Cannot access billing/settings

**Rep:**
- Use widget/mobile voice interface
- View own pattern analysis
- Cannot access admin features

### OAuth Connectors (Outlook)

**App User Type:** Each rep connects their own Microsoft 365 account

**Scopes Requested:**
- `Calendars.ReadWrite` - Schedule meetings
- `Mail.Send` - Send emails
- `Mail.Read` - Check for replies

**Revocation:** If rep leaves, they disconnect via settings

### API Key Management

**Client API Keys:**
- 1 key per client
- Show once on creation (user must copy)
- Cannot be retrieved after; must regenerate
- Regeneration invalidates old key immediately

**Widget Security:**
- API key embedded in HTML script tag
- HTTPS enforced
- Origin validation recommended (add CORS headers)

---

## Troubleshooting

### Issue: Widget Not Loading

**Symptoms:** Black box or 404 error on client website

**Checklist:**
1. Verify client API key is valid (not suspended)
2. Check if client status = `active`
3. Confirm CORS headers allow domain (if custom domain)
4. Verify `/public/voicerep-widget-v2.js` deployed

**Solution:**
```html
<!-- Correct implementation -->
<script src="https://voicerep.app/voicerep-widget-v2.js"
  data-api-key="sk_live_..."
  data-api-url="https://voicerep.app">
</script>
```

### Issue: Transcription Fails (Empty Audio)

**Cause:** Audio file < 100KB or silence detected

**Fix:**
1. Ensure microphone permissions granted
2. Check browser console for audio errors
3. Test with longer speech (min 2-3 seconds)

### Issue: AI Functions Return Raw Text Instead of JSON

**Root Cause:** Claude response not matching expected JSON schema

**Workaround (Temporary):**
- Check function logs for full response
- Manually extract data or re-run

**Permanent Fix:**
- Update prompt to enforce strict JSON format
- Add retry logic with different model

### Issue: High API Costs

**Monitoring:**
- Check UsageMeter entity for spike days
- Review which intents (send_email = cheap, generate_document = expensive)

**Cost Optimization:**
- Lower max_tokens in Claude calls (currently 1000)
- Batch rep pattern analysis (run once/week instead of on-demand)
- Use cheaper models for simple tasks (GPT-4 Mini vs. Claude Opus)

---

## API Reference

### Backend Functions

All functions return JSON. Invoke via Base44 SDK:

```javascript
const res = await base44.functions.invoke('functionName', {
  param1: 'value1',
  param2: 'value2'
});
```

#### calculateDealScores

**Purpose:** Calculate win probability for all prospects

**Input:**
```json
{ "client_id": "abc123" }
```

**Output:**
```json
{
  "success": true,
  "scores_calculated": 42,
  "top_deals": [
    {
      "prospect_name": "John @ Acme",
      "company_name": "Acme Corp",
      "win_probability": 87,
      "recommended_action": "schedule_call"
    }
  ]
}
```

**Schedule:** Every hour via automation

---

#### analyzeRepPatterns

**Purpose:** Extract communication patterns from rep's past emails

**Input:**
```json
{
  "rep_email": "john@company.com",
  "client_id": "abc123"
}
```

**Output:**
```json
{
  "success": true,
  "patterns": {
    "closing_phrases": [...],
    "keywords": [...],
    "tone_characteristics": {...}
  }
}
```

---

#### prepMeetingIntel

**Purpose:** Generate call prep sheet with talking points and objections

**Input:**
```json
{
  "prospect_id": "xyz789",
  "prospect_name": "Jane Smith",
  "client_id": "abc123"
}
```

**Output:**
```json
{
  "success": true,
  "intel": {
    "key_talking_points": ["...", "..."],
    "objections_likely": ["...", "..."],
    "closing_approach": "...",
    "win_indicators": ["...", "..."]
  }
}
```

---

### Entity Schemas

#### DealScore

```typescript
{
  prospect_id: string,
  client_id: string,
  win_probability: 0-100,
  interaction_count: number,
  recency_boost: number,
  autopilot_progress: 0-100,
  recommended_action: "send_email" | "schedule_call" | "send_proposal" | "check_in" | "nurture",
  calculated_at: ISO datetime
}
```

#### RepPattern

```typescript
{
  rep_email: string,
  client_id: string,
  pattern_type: "closing_phrase" | "opening_approach" | "objection_response" | "tone" | "success_keyword",
  pattern_value: string,
  success_rate: 0-100,
  frequency: number,
  recommendation: string
}
```

#### Playbook

```typescript
{
  client_id: string,
  manager_email: string,
  name: string,
  description: string,
  deal_stage: "prospecting" | "qualification" | "proposal" | "negotiation" | "closing",
  steps: [
    {
      step_number: number,
      action: "send_email" | "schedule_call" | "send_proposal" | "log_note",
      delay_days: number,
      content_template: string
    }
  ],
  usage_count: number,
  success_rate: 0-100
}
```

---

## Support & Escalation

**For Technical Issues:**
1. Check Base44 Logs (Dashboard → Logs)
2. Review function-specific error messages
3. Test with sample data in API explorer

**Recommended Contact:** ops@voicerep.ai

---

**End of Admin Manual**