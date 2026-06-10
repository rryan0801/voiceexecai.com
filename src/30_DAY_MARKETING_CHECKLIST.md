# 📋 VoiceExecAI — 30-Day Marketing Action Checklist

**Owner:** Richard Ryan  
**Start Date:** June 10, 2026  
**End Date:** July 10, 2026  
**Goal:** Launch complete marketing system

---

## 🎯 30-DAY GOALS

**By Day 30, we will have:**
- ✅ 100 signups
- ✅ 40 activated users (connect email)
- ✅ 5 Pro conversions ($245 MRR)
- ✅ 8 blog posts published
- ✅ 1,000 LinkedIn followers
- ✅ All marketing tools active

---

## 📅 DAY 1 (June 10) — FOUNDATION

### ✅ COMPLETE (Already Done)
- [x] Google Analytics 4 installed (G-63BS3L5HJ1)
- [x] Google Search Console verified
- [x] Microsoft Clarity installed (x2gmvyuvm4)
- [x] Resend API key saved
- [x] Stripe products created
- [x] Brand guidelines documented

### 🎯 TODAY'S FOCUS
**Time:** 2–3 hours

**Tasks:**
1. [ ] Review marketing playbook (read sections 1–4)
2. [ ] Review visual brand guidelines
3. [ ] Bookmark key tools:
   - [ ] GA4: https://analytics.google.com
   - [ ] GSC: https://search.google.com/search-console
   - [ ] Clarity: https://clarity.microsoft.com
   - [ ] Resend: https://resend.com

**Done for the day:** ✅ Playbook reviewed, tools bookmarked

---

## 📅 DAY 2 (June 11) — EMAIL SETUP

### 🎯 TODAY'S FOCUS
**Time:** 3–4 hours

**Resend Domain Verification:**
1. [ ] Go to https://resend.com/domains
2. [ ] Add domain: voiceexecai.com
3. [ ] Copy 3 DNS records (TXT + 2 CNAME)
4. [ ] Add DNS records at your domain registrar:
   ```
   Type: TXT
   Name: @
   Value: resend.domain._dmarc.voiceexecai.com
   
   Type: CNAME
   Name: resend._domainkey
   Value: resend._domainkey.voiceexecai.com
   
   Type: CNAME
   Name: email
   Value: email.resend.dev
   ```
5. [ ] Wait 15–30 minutes for verification
6. [ ] Confirm green checkmarks in Resend

**Test Email:**
1. [ ] Create first email template in Resend
2. [ ] Send test email to: richy@folderwiseai.com
3. [ ] Verify delivery (check spam folder)

**Done for the day:** ✅ Domain verified, test email sent

---

## 📅 DAY 3 (June 12) — SEO FOUNDATION

### 🎯 TODAY'S FOCUS
**Time:** 2–3 hours

**Create sitemap.xml:**
1. [ ] Create file: `/public/sitemap.xml`
2. [ ] Add URLs:
   ```xml
   <?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
     <url>
       <loc>https://voiceexecai.com/</loc>
       <lastmod>2026-06-10</lastmod>
       <priority>1.0</priority>
     </url>
     <url>
       <loc>https://voiceexecai.com/pricing</loc>
       <lastmod>2026-06-10</lastmod>
       <priority>0.9</priority>
     </url>
     <url>
       <loc>https://voiceexecai.com/dashboard</loc>
       <lastmod>2026-06-10</lastmod>
       <priority>0.8</priority>
     </url>
     <url>
       <loc>https://voiceexecai.com/contact</loc>
       <lastmod>2026-06-10</lastmod>
       <priority>0.7</priority>
     </url>
   </urlset>
   ```

**Create robots.txt:**
1. [ ] Create file: `/public/robots.txt`
2. [ ] Add:
   ```
   User-agent: *
   Allow: /
   Sitemap: https://voiceexecai.com/sitemap.xml
   ```

**Submit to Google:**
1. [ ] Go to Google Search Console
2. [ ] Click "Sitemaps" in sidebar
3. [ ] Enter: sitemap.xml
4. [ ] Click Submit
5. [ ] Verify status shows "Success"

**Submit to Bing:**
1. [ ] Go to https://www.bing.com/webmasters
2. [ ] Add site: voiceexecai.com
3. [ ] Verify ownership (add meta tag to index.html)
4. [ ] Submit sitemap.xml

**Request Indexing:**
1. [ ] Use URL Inspection tool in GSC for:
   - [ ] https://voiceexecai.com/
   - [ ] https://voiceexecai.com/pricing
   - [ ] https://voiceexecai.com/dashboard
   - [ ] https://voiceexecai.com/contact

**Done for the day:** ✅ Sitemap submitted, indexing requested

---

## 📅 DAY 4 (June 13) — GA4 CONVERSION EVENTS

### 🎯 TODAY'S FOCUS
**Time:** 2–3 hours

**Add Conversion Tracking to Landing Page:**
1. [ ] Open `pages/Landing.jsx`
2. [ ] Add GA4 event on "Get Started Free" button click:
   ```javascript
   const handleGetStarted = () => {
     gtag('event', 'sign_up', { method: 'landing_page' });
     // existing navigation code
   };
   ```
3. [ ] Add to pricing page buttons:
   ```javascript
   gtag('event', 'begin_checkout', {
     currency: 'USD',
     value: 49.00,
     items: [{ item_name: 'VoiceExec Pro' }]
   });
   ```

**Mark Events as Conversions in GA4:**
1. [ ] Go to GA4 → Admin → Conversions
2. [ ] Create new conversions:
   - [ ] sign_up
   - [ ] begin_checkout
   - [ ] purchase
   - [ ] connect_email
   - [ ] view_pricing

**Test Events:**
1. [ ] Go to GA4 → DebugView
2. [ ] Click buttons on site
3. [ ] Verify events appear in real-time

**Done for the day:** ✅ 5 conversion events tracking

---

## 📅 DAY 5 (June 14) — EMAIL SEQUENCES

### 🎯 TODAY'S FOCUS
**Time:** 3–4 hours

**Build Welcome Sequence in Resend:**

**Email 1 (Immediate):**
1. [ ] Create template: "Welcome to VoiceExecAI"
2. [ ] Subject: "Welcome to VoiceExecAI — Let's get started 👋"
3. [ ] Body: Use template from playbook (Section 7)
4. [ ] Add CTA button → /dashboard
5. [ ] Save as: `welcome_email_1`

**Email 2 (Day 1):**
1. [ ] Create template: "How I cleared 200 emails in 8 minutes"
2. [ ] Subject: "How I cleared 200 emails in 8 minutes"
3. [ ] Body: Founder story (problem → solution)
4. [ ] Add CTA → /demo
5. [ ] Save as: `welcome_email_2`

**Email 3 (Day 3):**
1. [ ] Create template: "Sarah went from 500 emails to inbox zero"
2. [ ] Subject: "Sarah went from 500 emails to inbox zero"
3. [ ] Body: Customer success story
4. [ ] Add CTA → /pricing
5. [ ] Save as: `welcome_email_3`

**Email 4 (Day 5):**
1. [ ] Create template: "Quick question about your setup?"
2. [ ] Subject: "Quick question about your setup?"
3. [ ] Body: Short reply-bait email
4. [ ] Add CTA → Reply to email
5. [ ] Save as: `welcome_email_4`

**Email 5 (Day 7):**
1. [ ] Create template: "Did you know VoiceExec can do this?"
2. [ ] Subject: "Did you know VoiceExec can do this?"
3. [ ] Body: Feature reveal
4. [ ] Add CTA → /dashboard
5. [ ] Save as: `welcome_email_5`

**Set Up Automation:**
1. [ ] Configure 7-day delay sequence
2. [ ] Test with your email: richy@folderwiseai.com
3. [ ] Verify all 5 emails arrive on schedule

**Done for the day:** ✅ Welcome sequence built & tested

---

## 📅 DAY 6 (June 15) — CONTENT CALENDAR

### 🎯 TODAY'S FOCUS
**Time:** 2–3 hours

**Create Content Calendar (Google Sheets or Notion):**

**Columns:**
- Publish Date
- Title
- Type (Tutorial, How-To, Comparison, etc.)
- Target Keyword
- Status (Idea, Draft, Published)
- CTA
- Promotion Channels

**Week 1–2 Topics:**
1. [ ] "How to Add Voice Commands to React in 5 Minutes"
   - Keyword: "voice commands react"
   - CTA: /dashboard
   
2. [ ] "Inbox Zero: The Complete Guide for Sales Reps"
   - Keyword: "inbox zero sales"
   - CTA: /pricing

3. [ ] "VoiceExecAI vs Traditional CRM: Which Wins?"
   - Keyword: "voice crm comparison"
   - CTA: /demo

4. [ ] "7 Voice Commands That Save 10 Hours/Week"
   - Keyword: "voice productivity hacks"
   - CTA: /signup

**Create LinkedIn Content Calendar:**
1. [ ] Plan 2 weeks of posts (8 posts total)
2. [ ] Mix: 2 personal, 2 frameworks, 2 data, 2 BTS
3. [ ] Schedule in Buffer (or manual posting)

**Done for the day:** ✅ 4-week content calendar created

---

## 📅 DAY 7 (June 16) — BLOG POST #1

### 🎯 TODAY'S FOCUS
**Time:** 3–4 hours

**Write: "How to Add Voice Commands to React in 5 Minutes"**

**Outline:**
1. [ ] **Introduction** (150 words)
   - Hook: "What if your users could control your app with their voice?"
   - Problem: Building voice features is hard
   - Solution: VoiceExecAI widget

2. [ ] **Prerequisites** (100 words)
   - React app setup
   - Node.js installed
   - 5 minutes of time

3. [ ] **Step 1: Install the Widget** (200 words)
   - npm install command
   - Import statement
   - Code example

4. [ ] **Step 2: Configure API Key** (200 words)
   - Get API key from dashboard
   - Pass to component
   - Code example

5. [ ] **Step 3: Test Your First Command** (250 words)
   - Click microphone
   - Say: "Log a call with Acme Corp"
   - Show result

6. [ ] **Step 4: Customize** (200 words)
   - Branding options
   - Event handlers
   - Advanced config

7. [ ] **Conclusion** (100 words)
   - Recap
   - CTA: Start free trial → /dashboard

**SEO Checklist:**
- [ ] Include keyword in title
- [ ] Include keyword in H1
- [ ] Include keyword in first paragraph
- [ ] Include keyword in 1 H2
- [ ] Add meta description (155 characters)
- [ ] Add 3–5 FAQ section
- [ ] Internal links to /dashboard, /pricing
- [ ] External links to React docs

**Publish:**
- [ ] Add to blog section of site
- [ ] Add OG image
- [ ] Test on mobile

**Done for the day:** ✅ Blog post #1 published

---

## 📅 DAY 8 (June 17) — BLOG POST #2

### 🎯 TODAY'S FOCUS
**Time:** 3–4 hours

**Write: "Inbox Zero: The Complete Guide for Sales Reps"**

**Outline:**
1. [ ] **Introduction** (200 words)
   - Stat: Average sales rep gets 121 emails/day
   - Problem: Email overwhelm kills productivity
   - Promise: Inbox zero in 5 minutes

2. [ ] **What is Inbox Zero?** (200 words)
   - Definition
   - Origin (Merlin Mann)
   - Why it matters for sales

3. [ ] **The 5-Minute Method** (400 words)
   - Step 1: Voice triage (2 min)
   - Step 2: Quick responses (1 min)
   - Step 3: File/delete (1 min)
   - Step 4: Plan next actions (1 min)

4. [ ] **Tools You Need** (200 words)
   - VoiceExecAI
   - Email client
   - CRM integration

5. [ ] **Common Objections** (200 words)
   - "I don't have time"
   - "My emails are too complex"
   - "I've tried before"

6. [ ] **Case Study** (200 words)
   - Sarah, SDR at TechCorp
   - Before: 500+ unread emails
   - After: Inbox zero daily
   - Result: 30% more demos booked

7. [ ] **Conclusion** (100 words)
   - Recap
   - CTA: Try VoiceExecAI free → /pricing

**SEO Checklist:**
- [ ] Keyword: "inbox zero sales"
- [ ] Meta description
- [ ] FAQ section
- [ ] Internal/external links

**Publish:**
- [ ] Add to blog
- [ ] OG image
- [ ] Mobile test

**Done for the day:** ✅ Blog post #2 published

---

## 📅 DAY 9 (June 18) — LINKEDIN LAUNCH

### 🎯 TODAY'S FOCUS
**Time:** 2–3 hours

**Post #1: Personal Story**
1. [ ] Write post: "Why I almost quit building VoiceExecAI"
2. [ ] Structure:
   - Hook: "3 months ago, I was ready to shut it down"
   - Story: The struggle
   - Turning point: First user success
   - Lesson: Keep going
   - CTA: Try it free → voiceexecai.com
3. [ ] Add image (founder photo or product screenshot)
4. [ ] Post at 8am CT
5. [ ] Engage with comments for 2 hours

**Post #2: Framework**
1. [ ] Write post: "The 5-minute inbox zero framework"
2. [ ] Structure:
   - Hook: "Clear 50 emails in 5 minutes"
   - Steps: 1, 2, 3, 4, 5
   - CTA: Try VoiceExecAI
3. [ ] Add carousel (5 slides, one per step)
4. [ ] Post at 12pm CT

**Engagement:**
1. [ ] Respond to all comments (within 1 hour)
2. [ ] Comment on 10 relevant posts in your niche
3. [ ] Share post to company page

**Done for the day:** ✅ 2 LinkedIn posts published

---

## 📅 DAY 10 (June 19) — SOCIAL SETUP

### 🎯 TODAY'S FOCUS
**Time:** 2 hours

**Buffer Setup:**
1. [ ] Go to https://buffer.com
2. [ ] Create account
3. [ ] Connect:
   - [ ] LinkedIn profile
   - [ ] LinkedIn company page
   - [ ] Twitter/X
4. [ ] Schedule next week's posts (4 posts)

**Twitter/X Setup:**
1. [ ] Optimize profile:
   - Bio: "Voice commands for any app in minutes 🎤 | Founder @VoiceExecAI"
   - Banner: Brand gradient + logo
   - Pinned tweet: Product demo video
2. [ ] Follow 50 relevant accounts (sales, productivity, AI)

**Done for the day:** ✅ Social tools configured

---

## 📅 DAYS 11–14 (June 20–23) — WEEK 2

### 🎯 WEEK 2 GOALS
- [ ] Install Hotjar
- [ ] Create ConvertKit account
- [ ] Build upgrade email sequence
- [ ] Publish 2 more blog posts (6 total)
- [ ] LinkedIn: 4 posts
- [ ] Create Product Hunt page
- [ ] Recruit 30 Product Hunt supporters

**Daily Tasks:**
- **Day 11:** Hotjar setup + first heatmap
- **Day 12:** ConvertKit setup + import users
- **Day 13:** Blog post #3 ("VoiceExecAI vs CRM")
- **Day 14:** Blog post #4 ("7 Voice Commands")

---

## 📅 DAYS 15–21 (June 24–30) — WEEK 3

### 🎯 WEEK 3 GOALS
- [ ] Launch referral program
- [ ] Email all users about referrals
- [ ] Publish 2 more blog posts (8 total)
- [ ] Twitter: 3 posts
- [ ] Create demo video
- [ ] Install Crisp chat

**Key Tasks:**
- **Day 15:** Build referral landing page
- **Day 16:** Email users about referral program
- **Day 17:** Blog post #5 (case study)
- **Day 18:** Blog post #6 (industry trends)
- **Day 19:** Record demo video (Loom or similar)
- **Day 20:** Crisp chat setup
- **Day 21:** Rest / catch-up

---

## 📅 DAYS 22–30 (July 1–10) — WEEK 4

### 🎯 WEEK 4 GOALS
- [ ] Launch Google Ads ($20/day)
- [ ] Product Hunt launch day
- [ ] Reddit ads test ($15/day)
- [ ] Outreach to 10 newsletters
- [ ] Send weekly report #4

**Product Hunt Launch Day:**
- [ ] Publish at 12:01am PST
- [ ] 6am: Email supporter list
- [ ] 9am: LinkedIn + Twitter posts
- [ ] 12pm: Reddit posts
- [ ] 3pm: Follow-up email
- [ ] 6pm: Thank you post

**Done for the month:** ✅ All 30-day goals complete!

---

## 📊 WEEKLY REPORT TEMPLATE

**Every Monday at 10am CT, send this report:**

```
WEEK [X] REPORT — [Date Range]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
HEADLINE: MRR = $[X] (+/-X%)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

SIGNUPS:    [X] this week (vs [X] last week)
ACTIVATIONS: [X] connected email ([X]%)
NEW PAYING:  [X] upgrades to Pro/Enterprise
CHURN:       [X] cancellations ([X]%)

TOP SOURCE: [channel] — [X] signups
BEST CONTENT: [post title] — [X] signups

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT WORKED:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- [One thing that drove results]
- [Another win]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
WHAT DIDN'T:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- [One thing that underperformed]
- [Lesson learned]

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
THIS WEEK'S FOCUS:
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
- [Priority 1]
- [Priority 2]
- [Priority 3]
```

---

## ✅ SUCCESS METRICS

**Track these every Monday:**

| Metric | Week 1 | Week 2 | Week 3 | Week 4 | 30-Day Goal |
|--------|--------|--------|--------|--------|-------------|
| Signups | | | | | 100 |
| Activations | | | | | 40 |
| Pro Upgrades | | | | | 5 |
| MRR | | | | | $245 |
| Blog Posts | 2 | 4 | 6 | 8 | 8 |
| LinkedIn Followers | | | | | 1,000 |
| Email List | | | | | 200 |

---

## 🆘 NEED HELP?

**Resources:**
- Marketing Playbook: VOICEEXECAI_MARKETING_PLAYBOOK.md
- Brand Guidelines: BRAND_GUIDELINES_VISUAL.md
- Email Templates: Playbook Section 7

**Contact:**
- Email: richy@folderwiseai.com
- Support: hello@voiceexecai.com

---

**GOOD LUCK! 🚀**

*Remember: Consistency beats perfection. Ship something every day.*