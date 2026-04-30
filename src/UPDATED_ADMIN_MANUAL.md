# VoiceExec AI - Administrator's Manual
**Version:** 2.0 | **Last Updated:** April 30, 2026

---

## Table of Contents
1. [System Overview](#system-overview)
2. [Core Administration](#core-administration)
3. [Advanced Features](#advanced-features)
4. [Monitoring & Maintenance](#monitoring--maintenance)
5. [Troubleshooting](#troubleshooting)

---

## System Overview

VoiceExec AI is a **predictive sales intelligence platform** combining voice commands, AI analysis, real-time coaching, and automated workflows. The system has 3 main layers:

### Layer 1: Input & Automation
- Voice command processing (Deno serverless)
- SMS/WhatsApp/Email/LinkedIn messaging
- Calendar and conversation sync
- AutoPilot autonomous sequences

### Layer 2: Intelligence & Predictions
- Deal Physics (velocity/momentum tracking)
- Rep Conversation DNA (pattern analysis)
- Prospect Readiness Pulse (buying intent)
- Objection Pre-Flight (predictive prep)
- Win/Loss Analysis (outcome patterns)
- Revenue Forecasting (quarterly/annual predictions)

### Layer 3: Team Enablement
- Live Coaching (real-time feedback)
- Email Template Studio (AI-generated personalization)
- Team Leaderboard (performance rankings)
- Deal Rooms (collaboration workspace)
- Quiet Period Monitor (engagement alerts)

---

## Core Administration

### Dashboard Access
**Path:** `/` (Home)
- View all clients, usage metrics, and recent activity
- Monitor command execution in real-time
- Track team performance KPIs

### Client Management
**Path:** `/` → "Clients" tab

#### Create New Client
1. Click **+ New Client**
2. Enter company name, API key (auto-generated), and HeyRichyAI account ID
3. Configure widget settings (colors, logo, enabled tools)
4. Set monthly API quota (default: 10,000)
5. Save and distribute embed code

#### Widget Configuration
- **Brand Customization:** Logo, colors, title
- **Tool Availability:** Select which voice commands are enabled
- **Position:** Bottom-right, bottom-left, top-right, top-left
- **Webhook:** (Optional) Receive webhook notifications on command completion

#### Monitor Usage
- View monthly API request volume per client
- Track success/failure rates
- Identify high-usage clients for optimization

### User & Team Management
**Path:** `/team`

#### Invite Team Members
1. Go to **Team** section
2. Use `base44.users.inviteUser(email, role)` to add users
3. Assign roles: `admin`, `manager`, or `rep`
4. Users are auto-created in Base44 auth system

#### Role Permissions
- **Admin:** Full platform access, client management, team oversight
- **Manager:** Team analytics, forecasting, leaderboard, coaching oversight
- **Rep:** Personal deals, voice commands, prospect tracking, email templates

---

## Advanced Features

### 1. Deal Physics Engine
**Path:** `/deal-physics`

**What It Does:**
- Tracks deal velocity (interactions/day) and momentum (acceleration/deceleration)
- Predicts close dates based on activity patterns
- Identifies friction points slowing deals

**How to Monitor:**
1. Click **Calculate Physics** to analyze top deals
2. Review **Acceleration Stage** (stalled, slow, moderate, accelerating, hyperdrive)
3. Use friction points to coach reps on deal risks

**Admin Actions:**
- Set up automation rules to escalate stalled deals
- Monitor which reps manage high-velocity deals best

### 2. Rep Conversation DNA
**Path:** `/rep-dna`

**What It Does:**
- Extracts winning phrases from closed deals
- Identifies successful question patterns
- Maps tone signature (formality, confidence, urgency)
- Finds closing triggers that work

**How to Use It:**
1. Select a rep → **Build DNA** (analyzes 5+ closed deals)
2. Review winning phrases (e.g., "ROI", "timeline alignment")
3. Share DNA with team for coaching
4. Use for email template generation

**Admin Actions:**
- Compare rep DNAs to identify best practices
- Share top rep DNA with underperforming reps
- Track DNA strength over time

### 3. Revenue Forecasting
**Path:** `/forecasting`

**What It Does:**
- Predicts quarterly/annual revenue with confidence bands
- Conservative (25th percentile), Expected, Optimistic (75th percentile)
- Weights deals by win probability
- Includes top contributing deals

**How to Use It:**
1. Click **Calculate Forecast** (auto-runs weekly)
2. Review expected revenue vs. quota
3. Identify gap deals needed to hit target
4. Share forecast with stakeholders

**Key Metrics:**
- Expected Revenue: Weighted forecast
- Conservative: Most pessimistic scenario
- Optimistic: Best-case scenario
- Confidence Level: 50-95% (higher = more reliable)

### 4. Win/Loss Analysis
**Path:** `/win-loss`

**What It Does:**
- Categorizes losses by reason (price, product fit, competitor, timeline, etc.)
- Tracks win rates by rep, industry, company size
- Compares lost deals to rep DNA (did they follow winning patterns?)
- Identifies competitor threats

**How to Use It:**
1. Review pie chart of loss reasons
2. Compare rep performance by win rate
3. Identify trends (e.g., losing to competitor X)
4. Coach reps on low-win-rate categories

**Admin Actions:**
- Set up alerts for high loss rate in key segments
- Escalate competitor threats to sales leadership
- Track improvement in specific loss categories

### 5. Team Leaderboard
**Path:** `/leaderboard`

**What It Does:**
- Real-time rankings by win rate, pipeline velocity, coaching effectiveness
- Shows DNA strength and trend (up/down/stable)
- Tracks revenue closed and expected revenue
- Updates every 60 seconds

**How to Use It:**
1. Review top performers for best practices
2. Identify underperformers for coaching
3. Track trends (ascending/descending)
4. Compare metrics across team

**Coaching Insights:**
- High DNA strength = rep following winning patterns
- Upward trend = rep improving
- Low coaching effectiveness = rep not applying feedback

### 6. Objection Pre-Flight
**Path:** `/objection-preflight`

**What It Does:**
- Predicts top 3 objections before calls
- Provides rebuttal scripts (drawn from successful past deals)
- Shows likelihood % and similar closed deals

**How to Use It:**
1. Select prospect → **Get Objections**
2. Coach rep on predicted objections
3. Practice rebuttals before call
4. Track which predicted objections actually came up

### 7. Prospect Readiness Pulse
**Path:** `/readiness-pulse`

**What It Does:**
- Scores prospect 0-100 on "ready to buy NOW"
- Tracks 20+ signals (email opens, SMS replies, LinkedIn activity, etc.)
- Recommends action: wait, nurture, engage, close_now, escalate

**How to Use It:**
1. Review prospects at peak readiness (80+%)
2. Prioritize engagement on critical prospects
3. Manually recalculate to see live signal changes
4. Identify declining prospects for intervention

### 8. Quiet Period Monitor
**Path:** `/quiet-monitor`

**What It Does:**
- Auto-detects when prospects go silent (5+ days across channels)
- Escalates to critical after 14 days
- Suggests interventions: video check-in, manager escalation, multi-channel blitz

**How to Use It:**
1. Review **Critical Silences** list
2. Assign intervention type
3. Track if prospect responds
4. Analyze why deals go silent (missing signals?)

### 9. Email Template Studio
**Path:** `/email-studio`

**What It Does:**
- Generates personalized emails matching rep's winning voice
- Uses rep DNA (phrases, tone, structure)
- Tracks open/click rates for continuous improvement

**How to Use It:**
1. Create template for prospect
2. Review AI-generated subject & body
3. Edit and send
4. Track performance metrics

### 10. Deal Rooms
**Path:** `/deal-rooms`

**What It Does:**
- Collaborative workspace for each deal
- Shared strategy, timeline, key contacts, action items
- Notes from team members (audit trail)
- Progress tracking toward close

**How to Use It:**
1. Create room for deals >$100K
2. Add team members for visibility
3. Document strategy and next steps
4. Track progress toward close date

---

## Monitoring & Maintenance

### Daily Checks
- **Command Queue:** Check for failed voice commands in Command Management
- **API Usage:** Monitor client quota usage (target: <80%)
- **Team Activity:** Check yesterday's interaction counts on Team page

### Weekly Checks
- **Leaderboard Trends:** Run refresh on Team Leaderboard
- **Deal Momentum:** Recalculate Deal Physics for top 10 deals
- **Revenue Forecast:** Generate new forecast (auto-runs, but verify)
- **Win/Loss Patterns:** Look for emerging trends

### Monthly Checks
- **Client Billing:** Verify usage matches quotas
- **Rep DNA Strength:** Rebuild DNAs for reps with 5+ new closed deals
- **Quiet Period Alerts:** Check critical list, address patterns
- **Competitor Analysis:** Review win/loss to identify threats

### Performance Optimization
- **Slow Deals:** Check Deal Physics for stalled deals (velocity = 0)
- **Struggling Reps:** Compare DNA to high performers, offer coaching
- **Automation Rules:** Review trigger success rates, adjust thresholds

---

## Troubleshooting

### Commands Not Executing
1. Check client API key validity on Clients page
2. Verify client status = "active" (not suspended)
3. Check command transcription for quality (garbled audio = poor intent detection)
4. Review CloudWatch logs in Command Management

### Email Send Failures
1. Verify Outlook connection is authorized (check `myOutlook` connector)
2. Test manual email send from ProspectManagement
3. Check recipient email validity
4. Review error message for specific Outlook API error

### Leaderboard Not Updating
1. Run **Refresh** button on Team Leaderboard
2. Verify reps have closed deals in system
3. Check deal scores are calculated (DealScore entity)
4. Manual trigger: `calculateTeamLeaderboard({ client_id })`

### Deal Physics Calculation Error
1. Verify deal has associated interactions
2. Check DealScore exists for the deal
3. Review error in function logs
4. Manually trigger: `calculateDealPhysics({ deal_id, prospect_id, client_id })`

### SMS/WhatsApp Not Sending
1. Verify Twilio credentials are set (TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_WHATSAPP_NUMBER)
2. Check prospect phone format (E.164 required: +12015551234)
3. Test with `sendSMSMessage` function in TestRunner
4. Review Twilio account for rate limits or balance

### LinkedIn Signals Not Appearing
1. Note: LinkedIn signals are simulated (actual LinkedIn API requires app review)
2. Manually create LinkedInSignal records or use monitorLinkedInSignals function
3. Check prospect LinkedIn URL is valid

---

## Advanced Configuration

### Custom Automation Rules
1. Go to Backend Functions → Create new `automationTrigger`
2. Set trigger condition (e.g., readiness_score >= 80)
3. Set action (e.g., send email, create task)
4. Link to automation (see automations_instructions)

### CRM Webhook Setup
1. Go to `/crm-adapter`
2. Create new adapter for your CRM
3. Map CRM fields to VoiceExec fields
4. Register webhook URL with your CRM
5. Test data sync with sample prospect record

### Custom Alerts
1. Use `sendSlackMessage` or `sendTeamsMessage` functions
2. Create scheduled automation to run alerts
3. Example: Daily digest of critical quiet periods

---

## Support & Escalation

For issues beyond this manual:
- Check **COMPREHENSIVE_AUDIT_REPORT.md** for system health
- Review **UPDATED_USER_MANUAL.md** for feature documentation
- Test functions using TestRunner page
- Review runtime logs for detailed error messages