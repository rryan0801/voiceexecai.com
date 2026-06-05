# VoiceExecAI — Complete Brand Guidelines
**Version 2026 | Internal Use**

---

## 1. BRAND IDENTITY

### Mission Statement
VoiceExecAI empowers professionals to reclaim their time by transforming voice commands into automated CRM updates, communications, and task execution — hands-free.

### Brand Promise
**"Voice-First. Frictionless. Done."**

### Core Values
1. **Speed** — Sub-second response times. No waiting.
2. **Simplicity** — One component. Any React app. 5-minute setup.
3. **Security** — SOC2, GDPR, CCPA compliant. End-to-end encryption.
4. **Intelligence** — AI-powered intent parsing that understands natural language.

### Brand Personality
- **Confident** — We know voice-first is the future
- **Approachable** — No jargon, no complexity
- **Innovative** — Cutting-edge AI, but human-centered
- **Trustworthy** — Enterprise-grade security and reliability

---

## 2. VISUAL IDENTITY

### Primary Logo
![VoiceExecAI Logo](https://media.base44.com/images/public/69f271da3dbd30c56bc97f06/c5d078ffd_generated_image.png)

**Usage:**
- Homepage header
- Marketing materials
- Press kits
- Social media profiles

### Icon/Mark
![VoiceExecAI Icon](https://media.base44.com/images/public/69f271da3dbd30c56bc97f06/194568344_generated_image.png)

**Usage:**
- Favicon
- App icons
- Social media avatars
- Email signatures

### Brand Colors

#### Primary Palette
| Color | Hex | HSL | Usage |
|-------|-----|-----|-------|
| **VoiceExec Blue** | `#3B82F6` | `217° 91% 59%` | Primary CTAs, links, highlights |
| **VoiceExec Violet** | `#8B5CF6` | `255° 89% 67%` | Gradients, accents, secondary CTAs |
| **Deep Space** | `#06060F` | `237° 55% 4%` | Primary backgrounds, dark mode |
| **Pure White** | `#FFFFFF` | `0° 0% 100%` | Text on dark, clean backgrounds |

#### Secondary Palette
| Color | Hex | Usage |
|-------|-----|-------|
| **Slate 50** | `#F8FAFC` | Light backgrounds, cards |
| **Slate 100** | `#F1F5F9` | Borders, subtle dividers |
| **Slate 600** | `#475569` | Secondary text |
| **Slate 900** | `#0F172A` | Primary text, headings |

#### Gradient Usage
```css
/* Primary Brand Gradient */
background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);

/* Hero Section Gradient */
background: linear-gradient(135deg, #06060F 0%, #1e1e3f 100%);

/* Button Hover Gradient */
background: linear-gradient(135deg, #2563EB 0%, #7C3AED 100%);
```

### Typography

#### Primary Font: **Inter** (Google Fonts)
**Weights:**
- Regular (400) — Body text, descriptions
- Medium (500) — Subheadings, buttons
- Semibold (600) — Section headers
- Bold (700) — Page titles, H1

**Usage:**
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

#### Font Sizes (Desktop)
| Element | Size | Weight | Line Height |
|---------|------|--------|-------------|
| H1 | 48–64px | 700 | 1.1 |
| H2 | 36–48px | 700 | 1.2 |
| H3 | 24–30px | 600 | 1.3 |
| Body | 16–18px | 400 | 1.6 |
| Small | 14px | 400 | 1.5 |
| Caption | 12px | 400 | 1.4 |

#### Font Sizes (Mobile)
| Element | Size | Weight |
|---------|------|--------|
| H1 | 32–40px | 700 |
| H2 | 24–30px | 700 |
| H3 | 20–24px | 600 |
| Body | 16px | 400 |

---

## 3. BRAND ASSETS

### OG/Social Media Image
![VoiceExecAI OG Image](https://media.base44.com/images/public/69f271da3dbd30c56bc97f06/209450025_generated_image.png)

**Specs:**
- Dimensions: 1200 × 630px
- Format: PNG
- Use for: Social shares, link previews, Open Graph

### Favicon
**Location:** `/public/favicon.ico`
**Sizes:** 16×16, 32×32, 180×180 (Apple Touch Icon)

### Logo Clear Space
Maintain minimum clear space around logo:
- **Minimum:** Height of the "V" in VoiceExec on all sides
- **Never:** Place logo on busy backgrounds or low-contrast colors

### Logo Don'ts
❌ Don't stretch or distort proportions
❌ Don't change colors (except white version for dark backgrounds)
❌ Don't add effects (shadows, glows, bevels)
❌ Don't rotate or place at angles
❌ Don't place on clashing backgrounds

---

## 4. VOICE & TONE

### Brand Voice
**Confident but not arrogant. Simple but not simplistic. Technical but human.**

### Tone by Context
| Context | Tone | Example |
|---------|------|---------|
| Homepage Hero | Bold, aspirational | "Add Voice Commands to Any App in Minutes" |
| Product Features | Clear, benefit-focused | "Sub-second response times for all voice commands" |
| Error Messages | Helpful, apologetic | "Something went wrong. We're on it — try again?" |
| Email Marketing | Friendly, value-first | "You just made a smart decision. Here's what happens next..." |
| Social Media | Conversational, authentic | "We just shipped something you'll want to see 👀" |
| Documentation | Precise, instructional | "Drop in the <VoiceWidget /> component. Configure with your API key." |

### Writing Principles
1. **Lead with the outcome** — "Inbox zero in 5 minutes" not "Our app processes emails"
2. **Use active voice** — "You command it by voice" not "Commands are processed by voice"
3. **Be specific** — "500+ apps powered" not "Many apps use us"
4. **Cut jargon** — "Voice commands" not "NLP-driven intent parsing"
5. **Show, don't tell** — "Sub-second response" not "Fast performance"

### Taglines (Approved)
- **Primary:** "Voice-First. Frictionless. Done."
- **Secondary:** "Add Voice Commands to Any App in Minutes"
- **Tertiary:** "Your Inbox Reads Itself Aloud. You Command It by Voice."
- **Campaign:** "5 Minutes. Voice Commands. Done Every Morning."

---

## 5. IMAGERY & GRAPHICS

### Photography Style
- **Authentic** — Real people, real workflows (no stock clichés)
- **Diverse** — Inclusive representation across all demographics
- **Action-oriented** — Show people using VoiceExecAI, not just smiling
- **Lighting** — Natural, bright, professional (avoid harsh shadows)

### Illustration Style
- **Clean lines** — Minimalist, geometric shapes
- **Brand colors** — Use VoiceExec Blue/Violet gradients
- **Flat design** — No 3D effects or skeuomorphism
- **Consistent stroke** — 2px stroke weight throughout

### Iconography
- **Style:** Lucide React icons (already in use)
- **Weight:** 1.5–2px stroke
- **Color:** Slate 600 for neutral, Blue 500 for active/highlighted
- **Size:** 16×16, 20×20, 24×24 (standardize across app)

### Data Visualization
- **Charts:** Use brand gradient for primary data series
- **Backgrounds:** Slate 50 or white with subtle borders
- **Labels:** Inter font, Slate 600 color
- **Grid lines:** Minimal, light (Slate 200)

---

## 6. UI COMPONENTS

### Buttons
```css
/* Primary Button */
background: linear-gradient(135deg, #3B82F6 0%, #8B5CF6 100%);
color: white;
border-radius: 12px;
padding: 12px 24px;
font-weight: 600;

/* Hover State */
background: linear-gradient(135deg, #2563EB 0%, #7C3AED 100%);
transform: translateY(-2px);
box-shadow: 0 10px 40px -10px rgba(59, 130, 246, 0.5);

/* Secondary Button */
background: white;
border: 2px solid #E2E8F0;
color: #0F172A;

/* Hover State */
border-color: #3B82F6;
background: #F8FAFC;
```

### Cards
```css
background: white;
border: 1px solid #E2E8F0;
border-radius: 16px;
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);

/* Hover State */
box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
transform: translateY(-4px);
```

### Inputs
```css
border: 1px solid #CBD5E1;
border-radius: 8px;
padding: 10px 14px;
font-size: 16px;

/* Focus State */
border-color: #3B82F6;
box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
```

---

## 7. MOTION & ANIMATION

### Animation Principles
1. **Purposeful** — Every animation serves a functional purpose
2. **Subtle** — Understated, never distracting
3. **Fast** — 200–400ms duration (voice-first means speed)
4. **Smooth** — Ease-in-out curves, no linear motion

### Standard Durations
| Animation | Duration | Easing |
|-----------|----------|--------|
| Button hover | 200ms | ease-out |
| Page transition | 300ms | ease-in-out |
| Modal open | 250ms | ease-out |
| Loading spinner | 1s (infinite) | linear |
| Success checkmark | 400ms | ease-out |

### Framer Motion Defaults
```javascript
// Standard entrance animation
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.4, ease: "easeOut" }}

// Hover scale
whileHover={{ scale: 1.05 }}
whileTap={{ scale: 0.95 }}
```

---

## 8. APPLICATION GUIDELINES

### Website
- **Header:** Logo left, navigation center, CTA right
- **Hero:** Bold H1, subheading, primary CTA, social proof
- **Features:** 3-column grid, icon + title + description
- **Footer:** Links organized by category, social icons, legal

### Email Templates
- **From:** hello@voiceexecai.com (never no-reply)
- **Subject:** 40–60 characters, value-first
- **Preview text:** 80–100 characters, curiosity builder
- **Body width:** Max 600px for readability
- **CTA buttons:** 44px minimum height (mobile-friendly)

### Social Media
- **LinkedIn:** Professional, value-driven, 4–5 posts/week
- **Twitter/X:** Conversational, threads, 2–3 tweets/day
- **Instagram:** Behind-the-scenes, product visuals (if applicable)
- **Profile images:** Use VoiceExecAI icon mark
- **Cover images:** Use brand gradient with tagline

### Presentations
- **Title slides:** Deep Space background, white text, logo bottom-right
- **Content slides:** White background, Slate 900 text
- **Accent color:** VoiceExec Blue for highlights
- **Fonts:** Inter for all text (Headings: Bold, Body: Regular)

---

## 9. FILE ORGANIZATION

### Asset Structure
```
/public
  /brand
    logo-primary.svg
    logo-white.svg
    logo-icon.svg
    favicon.ico
    og-image.png
    /social
      linkedin-cover.png
      twitter-header.png
      instagram-square.png
    /print
      business-card.pdf
      letterhead.pdf
```

### Naming Conventions
- **Lowercase with hyphens:** `logo-primary.svg`
- **Include dimensions:** `og-image-1200x630.png`
- **Include version:** `logo-v2.svg` (if updated)
- **Date assets:** `campaign-2026-01.png`

---

## 10. BRAND APPROVAL PROCESS

### New Asset Checklist
Before publishing any new brand asset:
- ☐ Follows color palette exactly (use hex codes)
- ☐ Uses Inter font family
- ☐ Maintains logo clear space
- ☐ Accessible contrast ratios (WCAG AA minimum)
- ☐ Mobile-responsive (test on iPhone first)
- ☐ File size optimized (under 200KB for images)

### Brand Guardians
**Final approval required from:** [YOUR_NAME/TEAM]
- Logo usage changes
- New taglines or messaging
- Major visual redesigns
- Partnership co-branding

---

## 11. DOWNLOADABLE ASSETS

### Current Assets
1. **Primary Logo:** [Download](https://media.base44.com/images/public/69f271da3dbd30c56bc97f06/c5d078ffd_generated_image.png)
2. **Icon Mark:** [Download](https://media.base44.com/images/public/69f271da3dbd30c56bc97f06/194568344_generated_image.png)
3. **OG/Social Image:** [Download](https://media.base44.com/images/public/69f271da3dbd30c56bc97f06/209450025_generated_image.png)

### Next Steps
- [ ] Create SVG versions of logos (vector, scalable)
- [ ] Generate favicon set (16×16, 32×32, 180×180)
- [ ] Build social media template pack (Canva)
- [ ] Create email template HTML files
- [ ] Design presentation deck template

---

**Last Updated:** June 5, 2026  
**Contact:** hello@voiceexecai.com for brand questions