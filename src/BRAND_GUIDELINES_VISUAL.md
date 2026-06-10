# 🎨 VoiceExecAI — Complete Branding & Visual Identity Guidelines

**Version:** 1.0 | **Created:** June 10, 2026  
**Owner:** Richard Ryan  
**Status:** Active

---

## 📖 TABLE OF CONTENTS

1. [Brand Overview](#1-brand-overview)
2. [Logo System](#2-logo-system)
3. [Color Palette](#3-color-palette)
4. [Typography](#4-typography)
5. [Imagery & Photography](#5-imagery--photography)
6. [Iconography](#6-iconography)
7. [UI Components](#7-ui-components)
8. [Brand Voice & Tone](#8-brand-voice--tone)
9. [Templates](#9-templates)
10. [Dos and Don'ts](#10-dos-and-donts)

---

## 1. BRAND OVERVIEW

### 🎯 Mission Statement

**VoiceExecAI** empowers developers and sales teams to build voice-powered applications in minutes — not months. We make voice AI accessible, actionable, and indispensable.

### 💡 Vision

A world where technology understands human intent — where a simple voice command can execute complex workflows across any system.

### 🏆 Core Values

1. **Developer-First** — We build for builders
2. **Speed Matters** — Fast to integrate, fast to execute
3. **Radical Simplicity** — Complex tech, simple interface
4. **Trust & Transparency** — Enterprise security, clear pricing
5. **Continuous Innovation** — Always pushing boundaries

### 🎭 Brand Personality

| Trait | Description | Example |
|-------|-------------|---------|
| **Innovative** | Cutting-edge AI technology | "Powered by state-of-the-art LLMs" |
| **Accessible** | Easy to understand & use | "3 lines of code. You're live." |
| **Confident** | Bold without arrogance | "The fastest way to add voice to your app" |
| **Energetic** | Fast, modern, dynamic | "Ship in minutes, not months" |
| **Trustworthy** | Enterprise-grade security | "SOC2, GDPR, CCPA compliant" |

### 🎪 Brand Positioning

**For:** Developers and sales teams who want to add voice capabilities to their applications

**Who need:** A fast, reliable, and easy-to-integrate voice-to-action framework

**VoiceExecAI is:** The drop-in voice AI platform that converts spoken commands into real actions

**Unlike:** Traditional voice recognition systems that require months of development

**Our solution:** One component. Any React app. Live in 5 minutes.

---

## 2. LOGO SYSTEM

### 🎨 Primary Logo

**Full Color Logo (Light Backgrounds):**
- **Icon:** Gradient microphone square (blue to violet)
- **Wordmark:** "VoiceExec" in Slate 900, "AI" in Blue 600
- **Clear Space:** Minimum 1x icon height on all sides
- **Minimum Size:** 32px height

**Usage:**
- ✅ Website headers
- ✅ App dashboards
- ✅ Marketing materials
- ✅ Presentations

**File:** `/public/logos/voiceexec-logo-full.svg`

**Current Asset:**
```
https://media.base44.com/images/public/69f271da3dbd30c56bc97f06/58137bd40_generated_image.png
```

### ⚪ Monochrome Logo

**White Logo (Dark Backgrounds):**
- **Icon:** Solid white
- **Wordmark:** All white
- **Usage:** Dark mode, gradient backgrounds, video overlays

**File:** `/public/logos/voiceexec-logo-white.svg`

### 🔲 Icon Only

**Gradient Icon:**
- **Usage:** Favicons, social avatars, app icons
- **Size:** Square format
- **Colors:** Blue 600 → Violet 600 gradient

**File:** `/public/logos/voiceexec-icon-gradient.svg`

**Current Favicon:**
```
https://media.base44.com/images/public/69f271da3dbd30c56bc97f06/58137bd40_generated_image.png
```

### 📐 Logo Specifications

**Clear Space:**
```
Minimum clear space = X (icon height)

    X
  ┌─────┐
X │  🎤 │ X
  └─────┘
    X
```

**Minimum Sizes:**
- **Digital:** 32px height
- **Print:** 0.5 inches
- **Social Media:** 400x400px minimum

**File Formats:**
- **SVG:** Primary format (scalable)
- **PNG:** Web use (transparent background)
- **ICO:** Favicon (16x16, 32x32)

### 🚫 Logo Misuse

**NEVER:**
- ❌ Stretch or distort the logo
- ❌ Change the gradient colors
- ❌ Add effects (shadows, outlines, glows)
- ❌ Rotate or flip the logo
- ❌ Place on busy backgrounds
- ❌ Use low-resolution versions
- ❌ Modify the icon design

---

## 3. COLOR PALETTE

### 🌈 Primary Colors

**Brand Gradient (Signature):**
```css
background: linear-gradient(135deg, #2563EB 0%, #7C3AED 100%);
```

**Usage:**
- Primary CTAs
- Hero backgrounds
- Brand materials
- Social media graphics

**Primary Blue:**
| Shade | Hex | Usage |
|-------|-----|-------|
| Blue 600 | `#2563EB` | Primary buttons, links, CTAs |
| Blue 700 | `#1D4ED8` | Hover states, active elements |
| Blue 500 | `#3B82F6` | Highlights, accents |
| Blue 100 | `#DBEAFE` | Backgrounds, cards |

**Primary Violet:**
| Shade | Hex | Usage |
|-------|-----|-------|
| Violet 600 | `#7C3AED` | Gradient accent, highlights |
| Violet 700 | `#6D28D9` | Secondary actions |
| Violet 500 | `#8B5CF6` | Hover states |
| Violet 100 | `#EDE9FE` | Backgrounds |

### 🎨 Neutral Palette

**Slate Grays:**
| Shade | Hex | Usage |
|-------|-----|-------|
| Slate 900 | `#0F172A` | Headings, primary text |
| Slate 700 | `#334155` | Body text |
| Slate 500 | `#64748B` | Secondary text, labels |
| Slate 300 | `#CBD5E1` | Borders, dividers |
| Slate 100 | `#F1F5F9` | Backgrounds, cards |
| White | `#FFFFFF` | Cards, content areas |

### 🚦 Semantic Colors

**Success:**
- Green 500: `#22C55E`
- Green 100: `#DCFCE7`
- **Usage:** Success states, positive metrics, checkmarks

**Warning:**
- Amber 500: `#F59E0B`
- Amber 100: `#FEF3C7`
- **Usage:** Warnings, cautions, alerts

**Error:**
- Red 500: `#EF4444`
- Red 100: `#FEE2E2`
- **Usage:** Errors, destructive actions, delete

**Info:**
- Blue 500: `#3B82F6`
- Blue 100: `#DBEAFE`
- **Usage:** Info states, tooltips, help text

### 📊 Color Application Examples

**Primary Button:**
```css
background: linear-gradient(135deg, #2563EB 0%, #7C3AED 100%);
color: #FFFFFF;
```

**Secondary Button:**
```css
background: #FFFFFF;
border: 2px solid #2563EB;
color: #2563EB;
```

**Card Background:**
```css
background: #FFFFFF;
border: 1px solid #CBD5E1;
```

**Text Hierarchy:**
```css
h1, h2, h3 { color: #0F172A; }
body { color: #334155; }
caption { color: #64748B; }
```

---

## 4. TYPOGRAPHY

### 📝 Font Family

**Primary Font:** Inter (Google Fonts)
```css
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');

font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

**Fallback Stack:**
```css
font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', 
             'Roboto', 'Helvetica Neue', Arial, sans-serif;
```

### 📏 Font Sizes

**Desktop:**
| Element | Size | Weight | Line Height | Letter Spacing |
|---------|------|--------|-------------|----------------|
| H1 (Hero) | 48–64px | 800 | 1.1 | -0.02em |
| H2 (Section) | 36–48px | 700 | 1.2 | -0.01em |
| H3 (Card) | 24–30px | 600 | 1.3 | 0 |
| H4 | 20–24px | 600 | 1.4 | 0 |
| Body Large | 18px | 400 | 1.6 | 0 |
| Body | 16px | 400 | 1.5 | 0 |
| Small | 14px | 400 | 1.4 | 0 |
| Caption | 12px | 500 | 1.3 | 0.01em |

**Mobile:**
| Element | Size |
|---------|------|
| H1 | 36–40px |
| H2 | 28–32px |
| H3 | 20–24px |
| Body | 16px |

### ⚖️ Font Weights

| Weight | Value | Usage |
|--------|-------|-------|
| Regular | 400 | Body text |
| Medium | 500 | Captions, labels |
| Semi-bold | 600 | H3, H4, buttons |
| Bold | 700 | H1, H2, emphasis |
| Extra-bold | 800 | Hero headlines |

### 📐 Line Heights

- **Headlines:** 1.1–1.3 (tight)
- **Body:** 1.5–1.6 (readable)
- **Captions:** 1.3–1.4 (compact)

### 🎯 Typography Examples

**Hero Headline:**
```jsx
<h1 className="text-5xl md:text-6xl font-extrabold text-slate-900 leading-tight">
  Add Voice Commands to Any App in Minutes
</h1>
```

**Body Text:**
```jsx
<p className="text-lg text-slate-500 leading-relaxed">
  VoiceExecAI is the drop-in voice-to-action framework for developers.
</p>
```

**Button Text:**
```jsx
<button className="text-sm font-semibold">
  Get Started Free
</button>
```

---

## 5. IMAGERY & PHOTOGRAPHY

### 📸 Photography Style

**Mood:**
- Modern and clean
- Professional but approachable
- Technology-focused
- Diverse and inclusive

**Subjects:**
- Developers coding
- Sales teams collaborating
- Voice interfaces in action
- Abstract tech visuals

**Lighting:**
- Bright and airy
- Natural light preferred
- Minimal shadows
- High contrast for drama

**Color Treatment:**
- Slightly desaturated
- Cool tones (blues, purples)
- Consistent with brand palette

### 🎨 Image Sources

**Stock Photos (Free):**
- Unsplash: https://unsplash.com
- Pexels: https://pexels.com
- Pixabay: https://pixabay.com

**Stock Photos (Paid):**
- Getty Images
- Shutterstock
- Adobe Stock

**Custom Graphics:**
- Use brand gradient backgrounds
- Add logo watermark (bottom right)
- Maintain clear space around subjects

### 📐 Image Specifications

**Social Media:**
- **LinkedIn Post:** 1200x627px
- **Twitter Post:** 1200x675px
- **OG Image:** 1200x630px
- **Profile Photo:** 400x400px
- **Cover Photo:** 1584x396px (LinkedIn), 1500x500px (Twitter)

**Blog Images:**
- **Featured Image:** 1200x630px
- **In-Article:** 800px width (responsive height)
- **Thumbnails:** 400x250px

**Product Screenshots:**
- **Desktop:** 1920x1080px
- **Mobile:** 750x1334px
- Add subtle drop shadow
- Show full interface context

### 🖼️ Image Treatment

**Gradient Overlay:**
```css
background: linear-gradient(135deg, 
  rgba(37, 99, 235, 0.1) 0%, 
  rgba(124, 58, 237, 0.1) 100%);
```

**Rounded Corners:**
```css
border-radius: 12px;
```

**Subtle Shadow:**
```css
box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1),
            0 2px 4px -1px rgba(0, 0, 0, 0.06);
```

---

## 6. ICONOGRAPHY

### 🎯 Icon Style

**Primary Icon Set:** Lucide React
```javascript
import { Mic, Zap, Shield, BarChart3 } from 'lucide-react';
```

**Style Guidelines:**
- **Stroke Width:** 2px (default)
- **Color:** Match context (brand colors for primary, slate for secondary)
- **Size:** Consistent with text hierarchy

### 📏 Icon Sizes

| Context | Size | Usage |
|---------|------|-------|
| Small | 16px | Inline with text, captions |
| Medium | 20px | Buttons, navigation |
| Large | 24px | Cards, feature lists |
| Extra Large | 32–48px | Hero sections, illustrations |

### 🎨 Icon Colors

**Primary Icons:**
- Use brand gradient for key actions
- Example: Microphone icon in gradient

**Secondary Icons:**
- Slate 500 for navigation
- Slate 700 for body content

**Semantic Icons:**
- Green 500 for success
- Amber 500 for warnings
- Red 500 for errors
- Blue 500 for info

### 🚫 Icon Misuse

**NEVER:**
- ❌ Use multiple icon sets (stay consistent)
- ❌ Change stroke width arbitrarily
- ❌ Use filled icons (stick to outline style)
- ❌ Rotate icons without reason
- ❌ Use low-contrast colors

---

## 7. UI COMPONENTS

### 🔘 Buttons

**Primary Button:**
```css
background: linear-gradient(135deg, #2563EB 0%, #7C3AED 100%);
color: #FFFFFF;
padding: 12px 24px;
border-radius: 8px;
font-weight: 600;
font-size: 14px;
```

**Secondary Button:**
```css
background: #FFFFFF;
border: 2px solid #2563EB;
color: #2563EB;
padding: 10px 22px;
border-radius: 8px;
font-weight: 600;
font-size: 14px;
```

**Ghost Button:**
```css
background: transparent;
color: #334155;
padding: 8px 16px;
border-radius: 6px;
font-weight: 500;
font-size: 14px;
```

### 📦 Cards

**Standard Card:**
```css
background: #FFFFFF;
border: 1px solid #CBD5E1;
border-radius: 12px;
padding: 24px;
box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
```

**Interactive Card (Hover):**
```css
transition: all 0.2s ease;
:hover {
  transform: translateY(-4px);
  box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  border-color: #2563EB;
}
```

### 📝 Forms

**Input Fields:**
```css
background: #FFFFFF;
border: 1px solid #CBD5E1;
border-radius: 6px;
padding: 10px 14px;
font-size: 16px;
:focus {
  outline: none;
  border-color: #2563EB;
  box-shadow: 0 0 0 3px rgba(37, 99, 235, 0.1);
}
```

**Labels:**
```css
color: #334155;
font-weight: 500;
font-size: 14px;
margin-bottom: 6px;
```

### 🎯 Badges

**Success Badge:**
```css
background: #DCFCE7;
color: #166534;
padding: 4px 12px;
border-radius: 9999px;
font-size: 12px;
font-weight: 500;
```

**Info Badge:**
```css
background: #DBEAFE;
color: #1E40AF;
padding: 4px 12px;
border-radius: 9999px;
font-size: 12px;
font-weight: 500;
```

---

## 8. BRAND VOICE & TONE

### 🗣️ Voice Characteristics

**Developer-to-Developer:**
- ✅ Technical but accessible
- ✅ No unnecessary jargon
- ✅ Respect intelligence, not time

**Example:**
```
❌ "Leverage our synergistic voice AI paradigm"
✅ "Add voice commands in 3 lines of code"
```

**Action-Oriented:**
- ✅ Start with verbs
- ✅ Focus on outcomes
- ✅ Clear next steps

**Example:**
```
❌ "VoiceExecAI is a platform that enables voice integration"
✅ "Add voice to your app in 5 minutes"
```

**Confident, Not Arrogant:**
- ✅ Back claims with data
- ✅ Acknowledge limitations
- ✅ Let results speak

**Example:**
```
❌ "We're the best voice AI platform ever"
✅ "500+ apps. 2M commands. 99.9% uptime."
```

### 📝 Tone Variations

**Website/Landing Pages:**
- Energetic and inspiring
- Benefit-focused
- Clear CTAs

**Documentation:**
- Precise and technical
- Step-by-step clarity
- Code examples

**Email:**
- Personal and conversational
- Helpful and supportive
- Concise

**Social Media:**
- Engaging and shareable
- Behind-the-scenes authentic
- Community-focused

**Error Messages:**
- Clear and actionable
- Non-blaming
- Solution-oriented

**Example:**
```
❌ "Invalid API key. Access denied."
✅ "That API key doesn't look right. Check your dashboard for the correct key."
```

### 🚫 Words to Avoid

| Instead of... | Use... |
|---------------|--------|
| "Leverage" | "Use" |
| "Utilize" | "Use" |
| "Paradigm" | "Approach" or "Method" |
| "Synergy" | "Collaboration" |
| "Disrupt" | "Change" or "Improve" |
| "Revolutionary" | "New" or "Better" |
| "Cutting-edge" | "Modern" or "Latest" |

---

## 9. TEMPLATES

### 📧 Email Template

**Subject Line:**
- Keep under 50 characters
- Lead with benefit or curiosity
- Avoid spam words (free, guarantee, etc.)

**Structure:**
```
Hi {{first_name}},

[Opening - personal, conversational]

[Main content - 2-3 short paragraphs]

[CTA - clear, single action]

— [Your name]

P.S. [Optional bonus or PS]
```

### 📱 Social Media Template

**LinkedIn Post:**
```
[Hook - bold statement or question]

[Story or insight - 3-5 paragraphs]

[Key takeaway or lesson]

[CTA - link in comments]

#VoiceAI #DeveloperTools #SalesAutomation
```

**Twitter Thread:**
```
Tweet 1: [Hook + promise]

Tweet 2-4: [Main content, one point per tweet]

Tweet 5: [Summary + CTA]

[Relevant hashtags]
```

### 📄 Blog Post Template

**Title:**
- Include target keyword
- Promise specific outcome
- Use numbers when possible

**Structure:**
```
# [Title with Keyword]

[Introduction - 150 words]
- Hook
- Problem
- Solution
- Promise

## [H2 with Keyword]

[Section content]

### [H3 - Supporting Point]

[Details, examples, code]

## [Another H2]

[More content]

## FAQ

[3-5 common questions]

## Conclusion

[Recap + CTA]
```

### 🎨 Presentation Template

**Slide 1: Title**
- Logo (top left)
- Title (center, large)
- Subtitle (optional)
- Date (bottom)

**Slide 2: Problem**
- Headline (problem statement)
- 1–3 bullet points
- Supporting image/stat

**Slide 3: Solution**
- Headline (solution)
- Product screenshot
- Key benefits

**Slide 4: How It Works**
- 3-step process
- Simple visuals
- Minimal text

**Slide 5: Results**
- Metrics/data
- Customer quotes
- Social proof

**Slide 6: CTA**
- Clear next step
- Contact info
- Logo

---

## 10. DOS AND DON'TS

### ✅ DO

- ✅ Use the brand gradient consistently
- ✅ Maintain clear space around logo
- ✅ Use Inter font for all text
- ✅ Keep designs clean and minimal
- ✅ Lead with benefits, not features
- ✅ Use active voice
- ✅ Include CTAs in all content
- ✅ Test on mobile devices
- ✅ Maintain accessibility (WCAG 2.1 AA)
- ✅ Keep loading times under 3 seconds

### ❌ DON'T

- ❌ Change brand colors
- ❌ Use multiple fonts
- ❌ Clutter designs
- ❌ Use stock photos excessively
- ❌ Write long paragraphs
- ❌ Use passive voice
- ❌ Forget mobile optimization
- ❌ Ignore accessibility
- ❌ Overload with text
- ❌ Inconsistent branding

---

## 📚 ADDITIONAL RESOURCES

**Design Tools:**
- Figma: https://figma.com (design system)
- Canva: https://canva.com (social graphics)
- Unsplash: https://unsplash.com (stock photos)

**Brand Assets:**
- Logo Files: `/public/logos/`
- OG Images: `/public/og-image.png`
- Favicon: `/public/favicon.ico`

**Documentation:**
- Marketing Playbook: `VOICEEXECAI_MARKETING_PLAYBOOK.md`
- 30-Day Checklist: `30_DAY_MARKETING_CHECKLIST.md`

---

**Questions?** Contact: richy@folderwiseai.com

**Last Updated:** June 10, 2026