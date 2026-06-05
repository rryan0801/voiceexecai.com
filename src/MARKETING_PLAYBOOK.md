# VoiceExecAI — Complete Marketing Playbook 2026
**For Internal Use | Version 1.0 | June 2026**

---

## Executive Summary

This playbook provides a complete, step-by-step marketing strategy for VoiceExecAI. Every section includes:
- → What to do
- → Exactly how to do it (URLs, commands, config values)
- → What "done" looks like
- → Troubleshooting if something breaks

**Deadline:** Sections 1–4 complete within 7 days. Sections 5–10 within 30 days.

**Contact for Help:** hello@voiceexecai.com

---

## Priority Order

| Priority | Section | Timeline | Time Required |
|----------|---------|----------|---------------|
| ★★★ | 1. Google Search Console | Day 1 | 20 min |
| ★★★ | 2. Google Analytics 4 | Day 1 | 30 min |
| ★★★ | 3. Email Setup (Resend) | Day 2 | 45 min |
| ★★ | 4. SEO Foundation | Days 1–3 | 2 hours |
| ★★ | 5. Content Engine | Week 1–2 | Ongoing |
| ★★ | 6. Email Drip Sequences | Week 2 | 3 hours |
| ★ | 7. Referral Program | Week 3 | 2 hours |
| ★ | 8. Paid Acquisition | Week 4+ | Ongoing |
| ★ | 9. Social & PR | Ongoing | 1 hr/day |
| ★ | 10. Metrics & Reporting | Ongoing | 1 hr/week |

---

## 1. Google Search Console — Complete Setup

**Priority:** DAY 1 · 20 MIN

### What Is It
Google Search Console (GSC) shows you:
- Which search queries people use to find VoiceExecAI
- Impressions, clicks, and click-through rate
- Which pages Google has indexed (or hasn't, and why)
- Technical errors Google found crawling your site
- Core Web Vitals performance scores

**Without GSC, you are flying blind on SEO.**

### Step 1 — Create Your Account

1. Go to: https://search.google.com/search-console/
2. Click "Start now"
3. Sign in with your VoiceExecAI Google account
4. Choose **"URL prefix"** (NOT "Domain")
5. Enter: `https://voiceexecai.com` (include https://)
6. Click Continue

### Step 2 — Verify Ownership (HTML Tag Method)

1. GSC shows verification options → Choose **"HTML tag"**
2. Copy the meta tag (looks like: `<meta name="google-site-verification" content="XXXXXXXXXXXXXX" />`)
3. **Already done!** The tag is in `index.html` `<head>` section
4. Go back to GSC and click "Verify"
5. You should see "Ownership verified" ✓

**If verification fails:**
- Make sure the tag is in `<head>`, not `<body>`
- Make sure the site is publicly accessible
- Wait 5 minutes and try again

### Step 3 — Submit Your Sitemap

1. In GSC left sidebar: click "Sitemaps"
2. In "Add a new sitemap" field, type: `sitemap.xml`
3. Click Submit
4. Status should change to "Success" within a few hours

**If your sitemap doesn't exist yet:**
- Create `/public/sitemap.xml` (see Section 4)
- Most website builders generate one automatically at /sitemap.xml

### Step 4 — Request Indexing for Key Pages

1. In GSC, go to URL inspection tool (top search bar)
2. Enter these URLs one by one → Click "Request Indexing":
   - `https://voiceexecai.com/` (homepage)
   - `https://voiceexecai.com/pricing`
   - `https://voiceexecai.com/dashboard`
   - `https://voiceexecai.com/blog`

5. Google will usually index these within 24–72 hours

### Step 5 — Set Up Email Alerts

1. In GSC, click gear icon (Settings) → "Users and permissions"
2. Add your email with "Owner" permission
3. GSC automatically sends alerts for:
   - Manual actions (penalties) — critical
   - Security issues — critical
   - Coverage errors — important

### Weekly Checklist (Every Monday)

- □ Performance → Check queries driving clicks. Any new winners?
- □ Coverage → Any new "Error" or "Excluded" pages? Fix them.
- □ Core Web Vitals → Any pages dropped below "Good"?
- □ Sitemaps → Still showing "Success"?

### What "Done" Looks Like

- ✓ GSC shows "Ownership verified"
- ✓ Sitemap submitted and shows "Success"
- ✓ Homepage, /pricing, /blog indexed (or indexing requested)
- ✓ Your email is listed as Owner under Users and permissions

---

## 2. Google Analytics 4 — Complete Setup

**Priority:** DAY 1 · 30 MIN

### What Is It
GA4 tracks every visitor action:
- How many people visit, from where, on what device
- Which pages they land on and where they drop off
- How long they stay and what they click
- Conversion events: signups, upgrades, form submissions
- Revenue tracking (with Stripe integration)

### Step 1 — Create Your GA4 Property

1. Go to: https://analytics.google.com/
2. Sign in with your VoiceExecAI Google account
3. Click gear icon (Admin) → "Create Account"
   - Account name: "VoiceExecAI"
4. Under "Property" → "Create Property"
   - Property name: "VoiceExecAI — Main Property"
   - Reporting time zone: America/Chicago
   - Currency: USD
5. Click Next → Fill out business info → Click Create
6. Accept Google Analytics Terms

### Step 2 — Get Your Measurement ID

1. After creating property → "Data Streams" → "Add stream" → "Web"
2. Enter website URL: `https://voiceexecai.com`
3. Stream name: "VoiceExecAI Web"
4. Click "Create stream"
5. Copy your Measurement ID (looks like: `G-XXXXXXXXXX`)

### Step 3 — Install the Tracking Code

**Add to `index.html` `<head>` section** (replace G-XXXXXXXXXX with your actual ID):

```html
<!-- Google Analytics 4 -->
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX', {
    page_title: document.title,
    page_location: window.location.href,
    send_page_view: true
  });
</script>
```

### Step 4 — Verify It's Working

1. Open your site in one browser tab
2. In another tab: GA4 → Reports → Realtime
3. You should see "1 user in last 30 minutes" — that's you
4. If you see 0 users after 2 minutes:
   - Check that the script is in `<head>` not `<body>`
   - Check that your Measurement ID is correct
   - Disable ad blockers temporarily to test
   - Check browser console for JavaScript errors

### Step 5 — Set Up Conversion Events

**Critical conversions to track:**

| Event Name | Trigger | Priority |
|------------|---------|----------|
| `sign_up` | User completes account creation | ★★★ |
| `waitlist_join` | User submits waitlist form | ★★ |
| `view_pricing` | User views /pricing page | ★★ |
| `begin_checkout` | Stripe checkout opens | ★★★ |
| `purchase` | Stripe payment succeeds | ★★★ |

**To mark as conversion:**
1. GA4 → Admin → Conversions → "New conversion event"
2. Type event name exactly as listed
3. Click Save

### Step 6 — Link GA4 to Google Search Console

1. GA4 → Admin → Product Links → Search Console Links
2. Click "Link" → Select your GSC property
3. Click Next → Confirm

This gives you a "Queries" report showing which search terms bring converting users.

### Step 7 — Install Microsoft Clarity (Free Heatmaps)

**Do this at the same time — takes 5 minutes, completely free.**

1. Go to: https://clarity.microsoft.com/
2. Create account → Add new project → Enter `voiceexecai.com`
3. Choose "Install manually" → Copy the tracking script
4. Paste in `index.html` AFTER your GA4 script (before `</head>`)
5. Deploy and verify at clarity.microsoft.com → Dashboard

**Clarity records:**
- Session recordings (watch real users navigate)
- Heatmaps (where people click, scroll, rage-click)
- Completely free. No user limit. No time limit.

### Weekly GA4 Review Checklist (Every Monday)

- □ Reports → Acquisition → Traffic acquisition
  - Which channels drove most users this week?
  - Which channels drove most CONVERSIONS?
- □ Reports → Engagement → Pages and screens
  - Which pages have high bounce? Fix them.
  - Which pages have low engagement time? Improve them.
- □ Reports → Monetization → Overview (if e-commerce set up)
  - Revenue trend week-over-week
- □ Realtime → Are tracking tags firing? (spot-check anytime)

### What "Done" Looks Like

- ✓ GA4 property created with correct timezone and currency
- ✓ Tracking code installed in index.html `<head>`
- ✓ Realtime report shows live traffic
- ✓ All 5 conversion events created and marked as conversions
- ✓ GA4 linked to Google Search Console
- ✓ Microsoft Clarity installed and recording sessions

---

## 3. Email Setup (Resend) — Complete Configuration

**Priority:** DAY 2 · 45 MIN

### What Is Resend
Resend (resend.com) is the email API for VoiceExecAI:
- Best-in-class deliverability (emails reach inboxes, not spam)
- Simple API — 3 lines of code to send any email
- Beautiful dashboard showing opens, clicks, bounces
- Free plan: 3,000 emails/month, 100/day
- Paid: $20/mo for 50,000 emails/month

### Step 1 — Create Your Resend Account

1. Go to: https://resend.com/signup
2. Sign up with `hello@voiceexecai.com`
3. Verify your email address
4. You'll land on the dashboard

### Step 2 — Add and Verify Your Sending Domain

**This makes emails come from @voiceexecai.com instead of @resend.dev. Critical for deliverability. Do not skip.**

1. Resend dashboard → Domains → Add Domain
2. Enter: `voiceexecai.com` (no https://, no www)
3. Resend shows DNS records to add (3 records):

| Type | Name | Value |
|------|------|-------|
| TXT | `resend._domainkey` | (long string Resend provides) |
| TXT | `@` | `v=spf1 include:amazonses.com ~all` |
| CNAME | `em.voiceexecai.com` | `feedback-smtp.us-east-1.amazonses.com` |

4. Log in to your domain DNS (wherever it's managed):
   - Namecheap: Domain List → Manage → Advanced DNS
   - GoDaddy: My Products → DNS → Add
   - Cloudflare: Dashboard → your domain → DNS → Records

5. Add each record exactly as shown in Resend
6. Back in Resend, click "Verify DNS Records"
7. DNS can take up to 48 hours. Usually 15–30 minutes.
8. Once verified, status shows green checkmarks ✓

**If this fails:**
- Double-check you copied values exactly (no extra spaces)
- Use MXToolbox.com to check: https://mxtoolbox.com/spf.aspx

### Step 3 — Get Your API Key

1. Resend dashboard → API Keys → Create API Key
2. Name: "VoiceExecAI Production"
3. Permission: "Full access"
4. Click Add
5. **COPY THE KEY IMMEDIATELY** — it's only shown once
6. Store in app secrets as `RESEND_API_KEY`
7. Never paste this key in code, docs, or chat

### Step 4 — Test Your Setup

Send a test email via Resend's dashboard or API. You should receive it within 30 seconds. Check Resend dashboard → Logs to confirm "Delivered".

### Step 5 — Email Sequences to Build

#### Welcome Sequence (5 emails over 7 days)

**Email 1 — Immediately on signup**
- From: `VoiceExecAI <hello@voiceexecai.com>`
- Subject: "Voice Commands. Inbox Zero. 5 Minutes."
- Preview: "5 minutes. Voice commands. Done every morning."
- Body: Welcome, 3-step onboarding, primary CTA

**Email 2 — Day 1 (24 hours after signup)**
- Subject: "You spend 2.5 hours a day on email"
- Preview: "That's 38 days a year."
- Body: Problem statistic, emotional connection, solution

**Email 3 — Day 3**
- Subject: "How Sarah cleared her inbox in 4 minutes"
- Preview: "Real user, real results."
- Body: User testimonial, transformation, CTA

**Email 4 — Day 5 (Reply-bait — short)**
- Subject: "Quick question"
- Preview: "Seriously, just one."
- Body: "What's the biggest thing stopping you from inbox zero? Hit reply."

**Email 5 — Day 7**
- Subject: "One thing I haven't told you yet"
- Preview: "Your unique feature reveal"
- Body: Unique feature, how it works, transformation, CTA

#### Re-Engagement Sequence (14+ days inactive)

**Email A (Day 14):** "Your inbox is waiting for you."
**Email B (Day 17):** "We just shipped something you'll want to see"
**Email C (Day 20 — Last):** "Should I take you off the list?"

#### Upgrade Sequence (Free users who hit limits)

**Email A (same day):** "You've hit your limit — here's how to keep going"
**Email B (Day 3):** "What you're missing on the Pro plan"

#### Post-Purchase Sequence (Stripe payment succeeds)

**Email A (immediately):** "You're on Pro. Here's exactly what to do next."
**Email B (Day 3):** "Your first 3 days on Pro — here's what to unlock"
**Email C (Day 7):** "Invite your team (they'll thank you)"

### Step 6 — Configure Unsubscribe (Required by Law)

Every marketing email MUST have an unsubscribe link. Resend handles this automatically if you use their templates. For custom HTML:

```html
<p style="font-size:11px;color:#666;text-align:center;">
  You're receiving this because you signed up for VoiceExecAI.<br>
  <a href="[UNSUBSCRIBE_LINK]">Unsubscribe</a> · 
  <a href="https://voiceexecai.com/privacy">Privacy Policy</a>
</p>
```

### What "Done" Looks Like

- ✓ Resend account created and domain verified (green checkmarks)
- ✓ API key created and stored in app secrets
- ✓ Test email sent and delivered
- ✓ Welcome sequence (5 emails) built and active
- ✓ Re-engagement sequence (3 emails) built and active
- ✓ Upgrade sequence (2 emails) built and active
- ✓ Post-purchase sequence (3 emails) built and active
- ✓ All emails have unsubscribe links in footer

---

## 4. SEO Foundation — Technical & On-Page

**Priority:** DAYS 1–3

### Part A — Meta Tags (Already in index.html)

✓ Primary SEO (title, description, keywords, canonical, robots)
✓ Open Graph (Facebook, LinkedIn)
✓ Twitter Card
✓ OG image created (1200×630)

### Part B — Structured Data / JSON-LD (Already in index.html)

✓ SoftwareApplication schema
✓ Organization schema
✓ FAQPage schema (5 FAQs)

### Part C — Keyword Targets

**Primary (homepage):**
- "inbox zero app"
- "voice email management"
- "email triage app"
- "email productivity tool"
- "voice commands for email"

**Secondary (blog + landing pages):**
- "how to reach inbox zero"
- "inbox zero morning routine"
- "best email management app 2026"
- "email anxiety productivity"

**Long-tail (high intent, low competition):**
- "how to clear inbox in 5 minutes"
- "voice commands for email"
- "email triage by voice"
- "inbox zero every morning"
- "gmail inbox zero productivity"

### Part D — Sitemap.xml

Create `/public/sitemap.xml`:

```xml
<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>https://voiceexecai.com/</loc><changefreq>weekly</changefreq><priority>1.0</priority></url>
  <url><loc>https://voiceexecai.com/pricing</loc><changefreq>monthly</changefreq><priority>0.9</priority></url>
  <url><loc>https://voiceexecai.com/dashboard</loc><changefreq>weekly</changefreq><priority>0.8</priority></url>
  <url><loc>https://voiceexecai.com/blog</loc><changefreq>daily</changefreq><priority>0.8</priority></url>
  <url><loc>https://voiceexecai.com/privacy</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
  <url><loc>https://voiceexecai.com/terms</loc><changefreq>monthly</changefreq><priority>0.7</priority></url>
</urlset>
```

### Part E — Robots.txt

Create `/public/robots.txt`:

```
User-agent: *
Allow: /
Disallow: /admin
Disallow: /api
Disallow: /test-payment
Sitemap: https://voiceexecai.com/sitemap.xml
```

### What "Done" Looks Like

- ✓ All meta tags added to index.html `<head>`
- ✓ OG image created (1200×630) and accessible
- ✓ JSON-LD structured data added
- ✓ sitemap.xml created and submitted to GSC
- ✓ robots.txt created and accessible at /robots.txt
- ✓ Canonical URL set correctly

---

## 5. Content Engine — Blog & SEO Moat

**Priority:** WEEK 1–2

### Publishing Cadence

- **Minimum:** 2 posts/week for first 90 days
- **Target:** 3 posts/week
- **Quality bar:** Every post must be better than top 3 Google results

### Article Types — Rotate Through All 5

**Type 1: How-To Guide (Publish 1st)**
- Formula: "How to [achieve outcome] in [timeframe]"
- Examples:
  - "How to reach inbox zero in under 5 minutes every morning"
  - "How to unsubscribe from all unwanted emails at once"
  - "How to triage 50 emails in 5 minutes using voice commands"
- Length: 1,200–1,800 words

**Type 2: Comparison Post (Publish 2nd)**
- Formula: "VoiceExecAI vs [Competitor]: [Honest Verdict]"
- Examples:
  - "Superhuman vs VoiceExecAI: Faster isn't the same as done"
  - "Shortwave vs VoiceExecAI: Which actually clears your inbox?"
- Length: 1,000–1,400 words
- **Be honest.** If competitor is better at something, say so.

**Type 3: Problem/Solution (Publish 3rd)**
- Formula: "[Problem] Is [Bigger Than You Think] — Here's [The Fix]"
- Examples:
  - "Email anxiety is real — and it's destroying your focus"
  - "You check email 96 times a day. Here's why that's killing you."
- Length: 800–1,200 words

**Type 4: Listicle**
- Formula: "[Number] [Things] for [Outcome] in [Year]"
- Examples:
  - "7 morning routines that include inbox zero (and why they work)"
  - "5 email habits of the most productive executives"
- Length: 900–1,400 words

**Type 5: Case Study / Data Post**
- Formula: "How [Persona] achieved [Result] using [Method]"
- Examples:
  - "How a startup founder cleared her inbox in 4 minutes every morning"
  - "We analyzed 12,000 email sessions. Here's what we learned."
- Length: 1,000–1,500 words

### Content Calendar — First 8 Weeks

| Week | Day | Type | Topic |
|------|-----|------|-------|
| 1 | Mon | How-to | "How to reach inbox zero in 5 minutes" |
| 1 | Thu | Problem | "Email anxiety is real and it's costing you" |
| 2 | Mon | Comparison | "Superhuman vs VoiceExecAI" |
| 2 | Thu | Listicle | "7 morning routines that include inbox zero" |
| 3 | Mon | Case Study | "4-minute inbox zero: what actually happened" |
| 3 | Thu | How-to | "How to unsubscribe from everything at once" |
| 4 | Mon | Problem | "96 email checks a day — the science" |
| 4 | Thu | Comparison | "Shortwave vs VoiceExecAI" |
| 5–8 | Repeat pattern with new keywords |

### SEO Rules for Every Article

- □ Target ONE primary keyword per article
- □ Include in: page title, H1, first paragraph, one H2, meta desc
- □ H1: One per page. Must include primary keyword.
- □ H2s: Use secondary keywords naturally (2–4 per article)
- □ Images: Every image has descriptive alt text
- □ Internal links: Link to 2–3 other pages/posts
- □ CTA at end: Always close with link to /dashboard or /pricing
- □ FAQ section: Add 3–5 Q&As (triggers FAQ rich results)
- □ Word count: Never publish below 700 words
- □ Readability: Hemingway app score Grade 6–8

### Content Promotion — Every Post

- □ Post to LinkedIn (personal account — not company page)
- □ Post to Twitter/X as a thread (5–8 tweets)
- □ Send to email list that week
- □ Share in 1 relevant Reddit community (r/productivity, r/lifehacks)
- □ Add to Notion content database with publish date + keyword

### What "Done" Looks Like

- ✓ 2 articles published in Week 1
- ✓ Content calendar through Week 8 written out
- ✓ Every article has: meta title, meta desc, H1, internal links
- ✓ Every article has CTA section with link to /dashboard
- ✓ Promoted on LinkedIn + Twitter same day as publish

---

## 6. Email Drip — Triggers & Automation Logic

**Priority:** WEEK 2

### Trigger Map

| Trigger | Sequence | Timing |
|---------|----------|--------|
| New signup | Welcome (5 emails) | Email 1 immediate, 2=+24h, 3=+72h, 4=+48h, 5=+48h |
| User connects email | Activation confirmation | Immediate |
| User hasn't connected after 24h | Friction-removal email | +24h |
| User hits free tier limit | Upgrade sequence | Immediate, then +3 days |
| User inactive 14+ days | Re-engagement (3 emails) | Day 14, 17, 20 |
| Stripe payment succeeds | Post-purchase (3 emails) | Immediate, +3 days, +7 days |
| Subscription cancelled | Win-back offer | Immediate |

### Sending Rules

- □ Never send more than 1 email per day to any user
- □ No emails between 10pm–7am in user's timezone
- □ Best send times: Tuesday–Thursday, 9am–11am or 2pm–4pm
- □ Never send on Friday afternoon or weekends
- □ Always send from: `hello@voiceexecai.com` (not no-reply@)

### Email Performance Benchmarks

| Metric | Excellent | Acceptable | Needs Fix |
|--------|-----------|------------|-----------|
| Open rate | >35% | >25% | <20% |
| Click rate | >5% | >2% | <1% |
| Unsubscribe | <0.2% | <0.5% | >0.5% |
| Reply rate | Track — replies are warmest leads |

### What "Done" Looks Like

- ✓ All triggers mapped in Resend or backend automations
- ✓ "Activated" tag fires correctly when user connects email
- ✓ "Paying customer" tag fires correctly from Stripe webhook
- ✓ Re-engagement sequence runs for 14-day inactive users
- ✓ All sequences tested with test email account
- ✓ Unsubscribe links verified working

---

## 7. Referral & Affiliate Program

**Priority:** WEEK 3

### Commission Structure

| Tier | Referrals | Commission |
|------|-----------|------------|
| Advocates | 1–4 | 20% recurring/month |
| Champions | 5–19 | 25% recurring/month |
| Legends | 20+ | 30% recurring/month |

- **Cookie window:** 90 days
- **Payout:** Monthly, on the 15th
- **Minimum payout:** $50 (PayPal or bank transfer)
- **Eligible plans:** Pro ($49/mo) and Enterprise ($999/mo)

**Quick math:** "Refer 10 people on Pro = $147/month for you, every month, forever"

### Referral Launch Sequence

- **Week 3, Day 1:** Email ALL current users about program
- **Week 3, Day 3:** LinkedIn post announcing program
- **Week 3, Day 5:** Twitter/X thread
- **Week 4, Day 1:** Personal outreach to 10 newsletter operators
- **Week 4, Day 7:** Submit to affiliate directories

### Email to Existing Users (Week 3, Day 1)

**Subject:** "30% every month — introduce VoiceExecAI to one person"

**Body:**
```
Hey [First Name],

You've been using VoiceExecAI for a bit now.

If you've told even one person about it — you could be earning
30% of what they pay, every single month, for as long as they stay.

That's not a one-time bounty. It's recurring.

We just opened our Ambassador Program to existing users.

→ Learn more and apply: [LINK TO /ambassador]

Takes 2 minutes to apply. We approve within 48 hours.

— The VoiceExecAI Team
```

### Where to Find Affiliates (Priority Order)

1. **Your existing users** — email them first. 10–15% become affiliates.
2. **LinkedIn** — search: "productivity coach" / "executive assistant"
3. **Newsletter operators** — beehiiv.com/find or Substack
4. **YouTube productivity channels** — 5K–200K subs
5. **Podcasters** — "productivity podcast" on Apple/Spotify
6. **Reddit** — r/Affiliatemarketing, r/beehiiv

### Personal Outreach Template

```
Hi [Name],

I've been following your newsletter/channel on [topic] —
[one specific genuine observation about their content].

We're building VoiceExecAI (voice-first email management, 500+ apps powered).
I think your audience would genuinely love it because [specific reason].

Our affiliate program pays 30% recurring commission —
which for your audience size is realistically $[estimate]/month.

Interested in a quick 10-min call, or I can send the program details?

[Your name]
```

### What "Done" Looks Like

- ✓ /ambassador page is live and accepting applications
- ✓ Referral tracking system is working (test with fake referral)
- ✓ Email to all existing users sent (Week 3, Day 1)
- ✓ LinkedIn and Twitter posts published
- ✓ 10 personal outreach messages sent to newsletter operators
- ✓ Listed on at least 1 affiliate directory

---

## 8. Paid Acquisition — When and How to Spend

**Priority:** WEEK 4+

### Do NOT Start Paid Ads Until All Are True

- □ Landing page organic conversion rate is >3%
  - Test: send 100 people from free source, count signups
  - If <3%, fix the page before spending money
- □ You know your organic/referral CAC
- □ GA4 is tracking conversions correctly
- □ UTM parameters are set up on all URLs
- □ Retargeting pixels are installed

### How to Set Up UTM Parameters

UTMs are tags added to URLs so GA4 knows which ad drove a visit.

**Format:** `https://voiceexecai.com/?utm_source=google&utm_medium=cpc&utm_campaign=brand`

Use Google's Campaign URL Builder: https://ga-dev-tools.google/campaign-url-builder/

**ALWAYS use UTMs on:**
- Every paid ad URL
- Every email CTA link
- Every social bio link
- Every PR mention link

### Channel Priority — Start Here

#### Tier 1: Google Search Ads (Start First)

**Why first:** People are actively searching for your solution.

**Budget:** $20–30/day to start. Don't go higher until profitable.

**Campaigns to create:**

| Campaign | Keywords | Bid Range |
|----------|----------|-----------|
| Brand (defensive) | "voiceexecai", "voiceexecai app" | $0.50–2.00 |
| Competitor | "superhuman alternative", "email management app" | $1.00–4.00 |
| Problem/Solution | "how to reach inbox zero", "voice email app" | $0.75–3.00 |

**Matching:** Use phrase match, not broad match.

**Negatives from day 1:** "free", "job", "resume", "outlook login"

**How to create:**
1. Go to: https://ads.google.com/
2. Sign in with VoiceExecAI Google account
3. Choose "Expert mode" (not "Smart campaign")
4. Create campaign → Search → Leads or Website traffic
5. Enter keywords, bids, ad copy
6. Link to GA4 property for conversion tracking

#### Tier 2: Reddit Ads (Add When Google is Profitable)

**Why:** Underpriced for B2B/productivity.

**Budget:** $15–25/day

**Subreddits to target:** r/productivity, r/GTD, r/getmotivated, r/Entrepreneur

**Format:** Promoted posts that look native (not banners)

**Copy style:** Honest and conversational. Reddit users hate salesy ads.

**Start:** https://ads.reddit.com/ → Create campaign

#### Tier 3: LinkedIn Ads (Enterprise plan upsell only)

**Only use for Enterprise plan** — individual ROI doesn't justify cost.

**Targeting:**
- Job title: "Chief of Staff" | "Executive Assistant" | "Operations Manager" | "Founder" | "COO"
- Company size: 10–200 employees

**Budget:** $50/day minimum (clicks are expensive — $8–15 each)

**Ad format:** Single image ad with one clear value prop

### Ad Copy Formula That Converts

**Line 1 (Hook — state the pain):**
- "You spend 2.5 hours a day on email. That's 38 days a year."
- "Your inbox will never be empty. Until you use voice commands."
- "Superhuman made email faster. VoiceExecAI makes it done."

**Line 2 (Bridge — introduce the solution):**
- "VoiceExecAI reads your inbox aloud. You command it by voice."
- "5 minutes. Voice commands. Inbox zero. Every morning."

**Line 3 (CTA — specific and low friction):**
- "Start free — no credit card needed"
- "Try it free → voiceexecai.com"

**RULE:** Never have more than one CTA. One action per ad. One.

### Landing Page Rules for Paid Traffic

- □ Remove the navigation bar (no escape routes for paid visitors)
- □ Your ad headline must exactly match your page H1
- □ Primary CTA above the fold — visible without scrolling
- □ Page load under 1.5 seconds (paid users are impatient)
- □ Trust signals visible: testimonials, user count, privacy badge
- □ Mobile is 60%+ of paid clicks — test on iPhone first

### What "Done" Looks Like

- ✓ Landing page conversion rate confirmed >3% before any spend
- ✓ UTM parameters set up for all ad URLs
- ✓ Google Ads account created and linked to GA4
- ✓ Brand campaign running ($20/day max)
- ✓ Competitor campaign running ($25/day max)
- ✓ Weekly check: kill anything with >$50 spend and 0 conversions

---

## 9. Social & PR Strategy

**Priority:** ONGOING FROM WEEK 1

### LinkedIn — Primary B2B Channel

**Cadence:** 4–5 posts per week (personal account, not company page)

**Why personal:** Personal profiles get 5–10x more reach than company pages.

#### Post Formats That Work (Rotate Through All 5)

**Format 1: Personal story**
- "I [did thing]. Here's exactly what I learned:"
- Example: "I tracked how often I checked email for 30 days. The result made me delete the app from my phone."
- → Story. Lesson. CTA (what should readers do with this?)

**Format 2: Contrarian take**
- "Unpopular opinion: [challenge the status quo]"
- Example: "Unpopular opinion: Superhuman is making your email addiction worse, not better."
- → Hook. Argument with data. Conclusion.

**Format 3: Framework / step-by-step**
- "The [X]-step [framework] for [outcome]:"
- Example: "The 5-minute morning brief that gets executives to inbox zero before 8am:"
- → Numbered list. Concrete steps. "DM me 'brief' for the template"
- → NOTE: "Save" posts = algorithm gold. Frameworks = saves.

**Format 4: Data post**
- "We analyzed [X data points]. Here's what we found:"
- Example: "We analyzed 12,000 morning brief sessions. 94% of users reach inbox zero. Here's what the other 6% do wrong:"
- → Surprising stat. What you found. What to do about it.

**Format 5: Behind-the-scenes**
- "I'm building VoiceExecAI in public. Here's [honest update]:"
- → User count. Revenue number. What broke. What worked.
- → These perform exceptionally well when honest + specific.

### Twitter / X

**Best for:** indie hackers, developers, productivity nerds

**Cadence:** 2–3 tweets/day

**Best times:** 8–10am EST, 12–1pm EST, 5–7pm EST

**Tweet types:**
- Hot take: "Superhuman is a faster car on a traffic jam freeway. VoiceExecAI is a helicopter. [Thread]"
- Thread: "How we went from 0 to 500 users in 90 days: (thread 🧵)"
- Build in public: Daily/weekly numbers. Honest. Specific.
- Product update: Screenshot + one line of what changed.

### Reddit — Community First

**Rule:** Contribute value for 2–3 weeks before posting anything product-related.

**Communities to join:**
- r/productivity (4M+ members)
- r/Entrepreneur
- r/getmotivated
- r/GTD (Getting Things Done)
- r/email (smaller but highly targeted)

**When you can post about VoiceExecAI:**
After you have 100+ karma in a community.

**Post type:** "I built a thing that solved my email problem. AMA."

**Never:** "Check out my product" with just a link. Instant ban.

### Product Hunt Launch — The Full Playbook

**Timing:** Tuesday, Wednesday, or Thursday. NEVER Friday–Monday.

**Launch at:** 12:01am PST (when new day starts on PH)

#### 2 Weeks Before Launch

- □ Find a "hunter" with 1,000+ followers on PH to post for you
  - DM popular hunters: "I'm launching VoiceExecAI on [date]. Would love your support as a hunter."
- □ Create hunter.how profile if you don't have one
- □ Build your asset package:
  - Tagline (60 chars max): "Inbox zero in 5 minutes. By voice."
  - Description (260 chars): No jargon. Lead with transformation.
  - Gallery: 4–5 screenshots (1270×760px). Dark theme looks best.
  - Maker video: 30–60 seconds. Show it working. No voiceover needed.
- □ Build a list of 30+ supporters who'll upvote at 12:01am PST
  - Email your list. DM on Twitter. Message in Slack/Discord communities.
- □ Draft your "Launch day" email to your list (send at 9am PST day-of)

#### Day of Launch

- □ 12:01am PST: Have supporters upvote and leave comments
- □ 9:00am PST: Send email to your entire list
- □ 9:00am PST: Post on LinkedIn and Twitter ("We're live on PH today!")
- □ All day: Respond to EVERY comment within 30 minutes
- □ Post to: r/SideProject, r/startups (check rules first)

### Press / Media Outreach

**Best targets:**
- TechCrunch (email: tips@techcrunch.com)
- The Hustle
- Morning Brew (tech section)
- Indie Hackers (most accessible — just post on the community)
- Product Hunt newsletter
- Niche productivity newsletters

**Outreach email template:**

```
Subject: [First name] — [YOUR_MILESTONE_OR_HOOK]

Hi [Name],

Saw your piece on [specific recent article they wrote] —
[one genuine, specific observation].

I'm building VoiceExecAI — voice-first email management.
[BRIEF_EXPLANATION_OF_HOW_IT_WORKS].

We just hit [specific milestone: users, MRR, or press mention].
[YOUR_KEY_METRIC_OR_SOCIAL_PROOF].

Might be worth a look for your [beat/readers/newsletter audience].
Happy to do a quick demo or send you data.

[Your name] — [youremail]
```

**RULE:** Personalize the first line of EVERY email. Generic = ignored.

### What "Done" Looks Like

- ✓ LinkedIn personal profile updated with VoiceExecAI
- ✓ First 5 LinkedIn posts scheduled for Week 1
- ✓ Twitter account created/updated — first 5 posts live
- ✓ Active in r/productivity (contributing before promoting)
- ✓ Product Hunt launch date set and hunter identified
- ✓ Press list of 20 contacts assembled in a spreadsheet

---

## 10. Metrics, KPIs & Weekly Reporting

**Priority:** ONGOING

### North Star Metric (Track Daily)

**Monthly Recurring Revenue (MRR)**

All other metrics either explain MRR or predict it.

If MRR is growing, your marketing is working.
If MRR is flat, find where the funnel is breaking.

### Acquisition Metrics (from GA4 every Monday)

| Metric | Target |
|--------|--------|
| Total new signups this week | Track trend |
| Conversion rate: visitor → signup | >3% |
| Traffic by source | organic, paid, referral, social, direct |
| Top landing pages | Which pages convert? |
| CAC per channel | total spend ÷ new paying customers |

### Activation Metrics (from app analytics)

| Metric | Target |
|--------|--------|
| % who connect email account | >40% |
| % who complete first brief | >25% |
| Time from signup → first brief | <48 hours |

These are your "aha moment" metrics.

### Retention Metrics

| Metric | Target |
|--------|--------|
| 7-day retention rate | >40% |
| 30-day retention rate | >20% |
| Monthly churn rate | <3% |
| DAU/MAU ratio | Track trend |

### Revenue Metrics

| Metric | Target |
|--------|--------|
| MRR | Growing week over week |
| ARPU (MRR ÷ paying users) | Track trend |
| LTV:CAC ratio | >3:1 |
| Trial → paid conversion | >15% |

### Email Metrics (from Resend every Monday)

| Metric | Target |
|--------|--------|
| Open rates (welcome sequence) | >35% |
| Click rates | >5% |
| Unsubscribe rates | <0.2% per send |

### SEO Metrics (from GSC every Monday)

| Metric | Target |
|--------|--------|
| Total impressions | Trending up (30/60/90 days) |
| Total clicks | Trending up |
| CTR per page | >2% for homepage |
| New keywords in top 10/20/50 | Track count |
| Core Web Vitals | All "Good" |

### Weekly Report — Send Every Monday by 10am

**Format:** Plain text email or Notion page. Short. No fluff.

**Template:**

```
WEEK [X] REPORT — [Date]

HEADLINE NUMBER: MRR = $[X] (+/-X% vs last week)

SIGNUPS:    [X] this week (vs [X] last week)
ACTIVATIONS: [X] connected email (X% of signups)
NEW PAYING:  [X] upgrades to paid
CHURN:       [X] cancellations

TOP TRAFFIC SOURCE THIS WEEK: [organic/paid/referral/social]
BEST PERFORMING CONTENT: [post title] — [X] signups driven

WHAT WORKED:
- [one specific thing that worked better than expected]

WHAT DIDN'T:
- [one specific thing that underperformed]

THIS WEEK'S FOCUS:
- [1–3 specific actions, not goals]
```

**Send to:** hello@voiceexecai.com every Monday morning.

### Monthly Deep Review (First Monday of Each Month)

- □ Full AARRR funnel audit — where is the biggest drop-off?
- □ Cohort retention: are users who signed up 30 days ago still active?
- □ NPS survey: email 10% of active users. Ask: "How likely are you to recommend VoiceExecAI?" (scale 1–10). Anything <8 = fix it.
- □ Content audit: which blog posts drove signups? Double down.
- □ Ad audit: kill campaigns with >$50 spend and 0 conversions
- □ Competitor pulse: has anything changed with Superhuman/Shortwave?

### What "Done" Looks Like

- ✓ GA4 dashboard showing all 5 conversion events
- ✓ Weekly report template set up (Notion or Google Doc)
- ✓ Monday morning report sent on Week 1, 2, 3, 4
- ✓ MRR tracking dashboard set up (Stripe + manual spreadsheet)

---

## 11. 30-Day Master Checklist

### Day 1 (Do Both Before Anything Else)

- □ Google Search Console: account created, ownership verified
- □ GSC: sitemap.xml submitted
- □ Google Analytics 4: property created, tracking code installed
- □ GA4: realtime confirmed working (you see yourself as visitor)
- □ GA4: 5 conversion events created and marked as conversions
- □ Microsoft Clarity: account created, script installed
- □ OG image created (1200×630) and uploaded
- □ All meta tags added to index.html (already done ✓)

### Day 2

- □ Resend: account created and domain DNS records added
- □ Resend: API key created and saved to app secrets
- □ Resend: test email sent and delivered
- □ JSON-LD structured data added to index.html (already done ✓)
- □ sitemap.xml created at /public/sitemap.xml
- □ robots.txt created at /public/robots.txt
- □ robots.txt + sitemap.xml both accessible (visit URLs to check)

### Day 3

- □ Resend DNS records verified (green checkmarks in dashboard)
- □ Welcome sequence (5 emails) built and activated
- □ All email CTAs pointing to correct URLs (/dashboard, /pricing)
- □ Unsubscribe links added to all email footers
- □ First blog post published (SEO-targeted, 1,200+ words)

### Week 1 (Days 1–7)

- □ GA4 linked to Google Search Console
- □ Re-engagement sequence (3 emails) built
- □ Upgrade sequence (2 emails) built
- □ Post-purchase sequence (3 emails) built
- □ Second blog post published
- □ LinkedIn profile updated with VoiceExecAI
- □ First 5 LinkedIn posts scheduled
- □ Twitter/X account active with first 5 posts
- □ Join r/productivity and r/Entrepreneur (lurk and contribute first)
- □ First weekly report sent to hello@voiceexecai.com

### Week 2 (Days 8–14)

- □ 4 more blog posts published (total: 6 posts live)
- □ All blog posts have: meta title, meta desc, H1, internal links, CTA
- □ GA4 showing organic search traffic from blog posts (even tiny numbers)
- □ GSC: any coverage errors? Fix them if yes.
- □ Press list assembled: 20 journalists/newsletters in spreadsheet
- □ First 5 press outreach emails sent (personalized, not mass)
- □ Ambassador/affiliate page live at /ambassador
- □ LinkedIn posting consistently: 4+ posts published this week
- □ Second weekly report sent

### Week 3 (Days 15–21)

- □ Email to all existing users about affiliate program (Section 7)
- □ 4 more blog posts (total: 10 posts live)
- □ Product Hunt launch date set (pick a Tuesday–Thursday, 3+ weeks out)
- □ PH hunter identified and confirmed (if doing PH launch)
- □ PH asset package complete (tagline, description, screenshots, video)
- □ 30+ PH launch supporters identified and messaged
- □ Google Ads account created (even if not spending yet)
- □ Landing page conversion rate tested and confirmed >3%
- □ Third weekly report sent

### Week 4 (Days 22–30)

- □ Google Ads Brand campaign live ($20/day max)
- □ Google Ads Competitor campaign live ($25/day max)
- □ UTM parameters on all ad URLs
- □ First ad performance review: kill anything with >$50 spend, 0 converts
- □ Heatmaps from Microsoft Clarity reviewed: any obvious friction?
- □ Email A/B test running: 2 different subject lines on next send
- □ Monthly deep review completed (full AARRR audit)
- □ "What worked in Month 1" doc written and sent
- □ Month 2 content calendar written out
- □ Fourth weekly report sent

### Ongoing (Every Week After Day 30)

- □ 2 blog posts published/week minimum
- □ 1 email to list per week (not always sales — value-first)
- □ Monday weekly report sent by 10am
- □ GSC checked: new errors? new winning queries?
- □ GA4 checked: conversion rate holding or improving?
- □ Resend metrics checked: open/click rates staying healthy?
- □ Community contributions: 30 min/day in Reddit/Slack/Discord

### If You Fall Behind

**Priority order when you can't do everything:**

1. Analytics must always be running (GA4 + GSC)
2. Email sequences must always be active
3. At least 1 blog post per week (minimum)
4. Social can pause. Paid can pause. These two cannot.

Email hello@voiceexecai.com if you're blocked for more than 48 hours.

---

## 12. Complete Tech Stack — All Tools, All Prices

### Required (Set Up in First 48 Hours — No Exceptions)

| Tool | URL | Cost | Status |
|------|-----|------|--------|
| Google Search Console | search.google.com/search-console | FREE | ✓ Ready |
| Google Analytics 4 | analytics.google.com | FREE | Ready to set up |
| Microsoft Clarity | clarity.microsoft.com | FREE | Ready to set up |
| Resend | resend.com | FREE up to 3k/mo | Ready to set up |

### Analytics Stack

| Tool | Purpose | Cost | Priority |
|------|---------|------|----------|
| GA4 | Web analytics | FREE | ★★★ |
| Microsoft Clarity | Heatmaps/sessions | FREE | ★★★ |
| PostHog | Product analytics | FREE tier | ★★ |
| Google Optimize | A/B testing | FREE | ★ |

### Email Marketing Stack

| Tool | Purpose | Cost | Priority |
|------|---------|------|----------|
| Resend | Transactional + marketing | $0–20/mo | ★★★ |
| ConvertKit | Marketing automation | $29/mo | ★ (later) |
| Klaviyo | Advanced segmentation | $45/mo | ★ (later) |

### SEO Tools

**Free tier:**
- Google Search Console (mandatory) + Bing Webmaster Tools (optional)
- Ahrefs Webmaster Tools (free, limited)
- Google PageSpeed Insights (free)
- Schema.org validator (free)

**Paid (when growing):**
- Ahrefs ($99/mo) — keyword research + backlinks + rank tracking
- Semrush ($120/mo) — all-in-one
- Ubersuggest ($29/mo) — 80% of Ahrefs at 25% of price

### Content Creation

| Tool | Purpose | Cost |
|------|---------|------|
| Notion | Content calendar + drafts | FREE |
| Canva | Social graphics, OG images | FREE |
| Descript | Video recording/editing | $12/mo |
| Claude.ai / ChatGPT | Outlines and first drafts | FREE–20/mo |
| Grammarly | Grammar checking | FREE tier |
| Hemingway App | Readability scoring | FREE |

### Social Media Management

| Tool | Purpose | Cost |
|------|---------|------|
| Buffer | Scheduling (3 channels) | FREE |
| Taplio | LinkedIn writing + analytics | $49/mo |
| Typefully | Twitter/X thread scheduler | $19/mo |
| Canva | Design (covers all social) | FREE |

### Affiliate / Referral

| Stage | Tool | Cost |
|-------|------|------|
| Early | Manual tracking (Google Sheet + Stripe coupons) | FREE |
| Growth | Rewardful | $49/mo |
| Scale | PartnerStack / Impact.com | $500+/mo |

### CRM & Customer Success

| Stage | Tool | Cost |
|-------|------|------|
| Early | Notion CRM / Google Sheets | FREE |
| Growth | HubSpot CRM | FREE tier |
| Support | Crisp | FREE tier |
| Scale | Intercom | $74/mo |

### Project Management (Marketing)

| Tool | Purpose | Cost |
|------|---------|------|
| Notion | Content calendar | FREE |
| Linear / Notion | Task management | FREE–10/mo |
| Slack | Team comms | FREE |
| Google Drive | Asset storage | FREE |

### Payments & Billing (Already Set Up)

- ✓ Stripe: Already configured (live mode, products created)
- ✓ Webhook: stripe-webhook function already set up
- ✓ Checkout: createStripeCheckout function already set up

### Domain & Hosting

| Tool | Purpose | Cost |
|------|---------|------|
| Domain registrar | Wherever yours is registered | ~$12/yr |
| Cloudflare | DNS management + CDN + SSL | FREE |
| SSL | Cloudflare handles automatically | FREE |

### Total Monthly Cost at Launch (Year 1)

| Setup | Monthly Cost |
|-------|--------------|
| Required tools | **$0** (GA4, GSC, Clarity, Resend free tier) |
| Nice-to-have | $29–60/mo (Buffer + Ubersuggest or similar) |
| Minimum to launch | **$0/month** (genuinely possible in month 1) |
| Comfortable setup | ~$50/month |
| Full growth stack | ~$200/month (add at $5k+ MRR) |

---

## End of Document

**Questions?** Contact: hello@voiceexecai.com

**Next Steps:**
1. Complete Day 1 tasks (GSC + GA4)
2. Complete Day 2 tasks (Resend + SEO)
3. Start Week 1 content calendar
4. Send first weekly report on Day 7

**Remember:** Consistency beats intensity. Small actions, done daily, compound into massive results.

---

*VoiceExecAI — Voice-First. Frictionless. Done.*