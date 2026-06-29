import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { Document, Packer, Paragraph, TextRun, HeadingLevel, AlignmentType, BorderStyle } from 'npm:docx@8.5.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const doc = new Document({
      sections: [{
        properties: {},
        children: [
          // Title
          new Paragraph({
            text: 'Implementation Guide',
            heading: HeadingLevel.TITLE,
            alignment: AlignmentType.CENTER,
            spacing: { after: 200 }
          }),
          
          // Subtitle
          new Paragraph({
            text: 'Anyone Can Follow This (Even a 5th Grader)',
            heading: HeadingLevel.HEADING_1,
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),
          
          // Last Updated
          new Paragraph({
            children: [
              new TextRun({
                text: 'Last Updated: June 29, 2026',
                italics: true,
                color: '666666'
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { after: 400 }
          }),
          
          // Table of Contents Header
          new Paragraph({
            text: 'Table of Contents',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 400, after: 200 }
          }),
          
          // TOC Items
          ...[
            'Before You Start - Read This First',
            'Part 1: Make the App Look Professional',
            'Part 2: Help Google Find Your Site (SEO)',
            'Part 3: Fix Stripe Payments',
            'Part 4: Turn On Email Automation',
            'Part 5: Test Everything',
            'Part 6: Final Checklist',
            'Troubleshooting - Common Problems'
          ].map((item, i) => new Paragraph({
            children: [
              new TextRun({
                text: `${i + 1}. ${item}`,
                size: 20
              })
            ],
            spacing: { after: 100 }
          })),
          
          // Section 1
          new Paragraph({
            text: 'Before You Start - Read This First',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 600, after: 200 }
          }),
          
          new Paragraph({
            text: 'What You\'re Building:',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          
          new Paragraph({
            text: 'The platform does two things:',
            spacing: { after: 100 }
          }),
          
          new Paragraph({
            text: '1. Voice Commands for Email - People speak commands, the app manages their email',
            spacing: { after: 100 }
          }),
          
          new Paragraph({
            text: '2. Contractor Leads - Plumbers, roofers, etc. get customer leads in their area',
            spacing: { after: 200 }
          }),
          
          new Paragraph({
            text: 'What\'s Already Done:',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          
          ...[
            '80+ Backend Functions - All the code that makes things work',
            '30+ Database Tables - Where data is stored (users, leads, deals, etc.)',
            'Payment System - Stripe integration for $0, $49, and $999 plans',
            'Email System - Automatic welcome emails when someone signs up',
            'Analytics - Google Analytics and Microsoft Clarity tracking',
            'Legal Pages - Privacy, Terms, Security, Contact pages'
          ].map(text => new Paragraph({
            text: text,
            spacing: { after: 100 }
          })),
          
          new Paragraph({
            text: 'What You Need to Do:',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          
          ...[
            '1. Add Brand Images - Logo, favicon, social media images',
            '2. Add SEO Tags - Help Google find and rank the site',
            '3. Fix Stripe - Make sure payments work (API keys expire)',
            '4. Turn On Email Automation - Make welcome emails send automatically',
            '5. Test Everything - Make sure it all works'
          ].map(text => new Paragraph({
            text: text,
            spacing: { after: 100 }
          })),
          
          new Paragraph({
            text: 'What You Need Access To:',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          
          ...[
            'Base44: https://app.base44.com (main platform)',
            'Stripe: https://dashboard.stripe.com (payments)',
            'Resend: https://resend.com (email sending)',
            'Google Analytics: https://analytics.google.com (optional, for testing)'
          ].map(text => new Paragraph({
            text: text,
            spacing: { after: 100 }
          })),
          
          // Part 1
          new Paragraph({
            text: 'Part 1: Make the App Look Professional',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 600, after: 200 }
          }),
          
          new Paragraph({
            text: 'Why This Matters:',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          
          new Paragraph({
            text: 'First impressions count. If the logo is missing or the favicon is wrong, people think the app is broken or unprofessional.',
            spacing: { after: 200 }
          }),
          
          new Paragraph({
            text: 'Step 1: Create 5 Images',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          
          new Paragraph({
            text: 'You need 5 images. Use an AI image generator (like Midjourney, DALL-E, or Base44\'s built-in generator).',
            spacing: { after: 200 }
          }),
          
          new Paragraph({
            text: 'Image 1: Main Logo (512x512 pixels)',
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 100 }
          }),
          
          new Paragraph({
            children: [
              new TextRun({
                text: 'Prompt: ',
                bold: true
              }),
              new TextRun({
                text: 'Professional tech logo - a sleek modern microphone icon combined with sound waves, gradient from electric blue (#3B82F6) to violet (#8B5CF6), minimalist design, white background, app icon style, high contrast, suitable for website header'
              })
            ],
            spacing: { after: 200 }
          }),
          
          new Paragraph({
            text: 'Image 2: Browser Tab Icon (32x32 pixels)',
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 100 }
          }),
          
          new Paragraph({
            children: [
              new TextRun({
                text: 'Prompt: ',
                bold: true
              }),
              new TextRun({
                text: 'Simple microphone icon, blue to violet gradient, minimalist, white background, favicon style, 32x32 pixels, very simple design'
              })
            ],
            spacing: { after: 200 }
          }),
          
          new Paragraph({
            text: 'Image 3: iPhone Home Screen Icon (180x180 pixels)',
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 100 }
          }),
          
          new Paragraph({
            children: [
              new TextRun({
                text: 'Prompt: ',
                bold: true
              }),
              new TextRun({
                text: 'App icon, microphone with sound waves, blue violet gradient, iOS app icon style, 180x180 pixels, white background, clean and simple'
              })
            ],
            spacing: { after: 200 }
          }),
          
          new Paragraph({
            text: 'Image 4: Facebook/LinkedIn Share Image (1200x630 pixels)',
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 100 }
          }),
          
          new Paragraph({
            children: [
              new TextRun({
                text: 'Prompt: ',
                bold: true
              }),
              new TextRun({
                text: 'Social media banner, modern tech background with gradient blue to violet, abstract sound waves and AI neural patterns, professional SaaS aesthetic, 1200x630 pixels, space for text overlay'
              })
            ],
            spacing: { after: 200 }
          }),
          
          new Paragraph({
            text: 'Image 5: Twitter Share Image (1200x630 pixels)',
            heading: HeadingLevel.HEADING_3,
            spacing: { before: 200, after: 100 }
          }),
          
          new Paragraph({
            children: [
              new TextRun({
                text: 'Prompt: ',
                bold: true
              }),
              new TextRun({
                text: 'Twitter card banner, gradient blue violet background, sound wave patterns, tech SaaS style, 1200x630 pixels'
              })
            ],
            spacing: { after: 200 }
          }),
          
          new Paragraph({
            text: 'Step 2: Upload Images to Base44',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          
          ...[
            '1. Go to Base44 Dashboard > Media',
            '2. Click "Upload File" button',
            '3. Upload all 5 images one at a time',
            '4. After each upload, copy the URL'
          ].map(text => new Paragraph({
            text: text,
            spacing: { after: 100 }
          })),
          
          new Paragraph({
            text: 'Step 3: Update the Website Code',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          
          new Paragraph({
            text: 'File to Edit: index.html',
            spacing: { after: 100 }
          }),
          
          new Paragraph({
            text: 'Add favicon, Open Graph, and Twitter Card meta tags with your URLs.',
            spacing: { after: 200 }
          }),
          
          new Paragraph({
            text: 'Step 4: Create PWA Manifest File',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          
          new Paragraph({
            text: 'File to Create: public/manifest.json',
            spacing: { after: 100 }
          }),
          
          new Paragraph({
            text: 'Configure app name, icons, and theme colors.',
            spacing: { after: 200 }
          }),
          
          new Paragraph({
            text: 'Step 5: Update Logo in Navigation',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          
          new Paragraph({
            text: 'Files to Edit: src/pages/Landing.jsx, src/components/NavBar.jsx',
            spacing: { after: 100 }
          }),
          
          new Paragraph({
            text: 'Replace the old logo URL with your new logo URL.',
            spacing: { after: 200 }
          }),
          
          // Part 2
          new Paragraph({
            text: 'Part 2: Help Google Find Your Site (SEO)',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 600, after: 200 }
          }),
          
          new Paragraph({
            text: 'Why This Matters:',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          
          new Paragraph({
            text: 'If Google can\'t understand your site, nobody will find it. SEO (Search Engine Optimization) is like putting up signposts that tell Google what your site is about.',
            spacing: { after: 200 }
          }),
          
          new Paragraph({
            text: 'What You\'re Adding:',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          
          ...[
            '1. Meta Tags - Invisible labels that tell Google what your site is about',
            '2. Structured Data - Special code that helps Google show rich results (stars, prices, FAQs)',
            '3. Analytics - Code that tracks how people use your site'
          ].map(text => new Paragraph({
            text: text,
            spacing: { after: 100 }
          })),
          
          new Paragraph({
            text: 'Step 1: Add Meta Tags to index.html',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          
          new Paragraph({
            text: 'Add title, description, keywords, canonical URL, and robots meta tags. Include Google Search Console verification and Analytics scripts.',
            spacing: { after: 200 }
          }),
          
          new Paragraph({
            text: 'Step 2: Add Structured Data (JSON-LD)',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          
          new Paragraph({
            text: 'Add JSON-LD schema for SoftwareApplication, Organization, and FAQPage. This helps Google show your site with star ratings, prices, and FAQs.',
            spacing: { after: 200 }
          }),
          
          new Paragraph({
            text: 'How to Know You Did This Right:',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          
          ...[
            'Google Rich Results Test shows no errors: https://search.google.com/test/rich-results',
            'When you search for the site on Google, the title and description match what you wrote',
            'Google Analytics shows real-time visitors when you visit the site',
            'Microsoft Clarity records your session'
          ].map(text => new Paragraph({
            text: text,
            spacing: { after: 100 }
          })),
          
          // Part 3
          new Paragraph({
            text: 'Part 3: Fix Stripe Payments',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 600, after: 200 }
          }),
          
          new Paragraph({
            text: 'Why This Matters:',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          
          new Paragraph({
            text: 'If Stripe isn\'t working, nobody can pay you. API keys expire sometimes, so we need to check and update them.',
            spacing: { after: 200 }
          }),
          
          new Paragraph({
            text: 'Step 1: Check If Stripe Is Working',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          
          ...[
            '1. Go to Base44 Dashboard > Code > Functions',
            '2. Find createStripeCheckout in the list',
            '3. Click "Test" button',
            '4. Use test payload with price_id and URLs',
            '5. Click "Run Test"'
          ].map(text => new Paragraph({
            text: text,
            spacing: { after: 100 }
          })),
          
          new Paragraph({
            text: 'Step 2: Get New Stripe API Keys (If Needed)',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          
          ...[
            '1. Go to https://dashboard.stripe.com',
            '2. Click "Developers" in the left menu',
            '3. Click "API keys"',
            '4. Copy publishable key and secret key'
          ].map(text => new Paragraph({
            text: text,
            spacing: { after: 100 }
          })),
          
          new Paragraph({
            text: 'Step 3: Update Base44 Secrets',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          
          ...[
            '1. Go to Base44 Dashboard > Settings > Secrets',
            '2. Update STRIPE_SECRET_KEY',
            '3. Update STRIPE_PUBLISHABLE_KEY'
          ].map(text => new Paragraph({
            text: text,
            spacing: { after: 100 }
          })),
          
          new Paragraph({
            text: 'Step 4: Verify Stripe Products Exist',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          
          new Paragraph({
            text: 'Check Stripe Dashboard > Products for 3 products: Free ($0/month), Pro ($49/month), Enterprise ($999/month)',
            spacing: { after: 200 }
          }),
          
          // Part 4
          new Paragraph({
            text: 'Part 4: Turn On Email Automation',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 600, after: 200 }
          }),
          
          new Paragraph({
            text: 'Why This Matters:',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          
          new Paragraph({
            text: 'When someone signs up for leads, they should get a welcome email automatically. If the automation isn\'t running, they won\'t get it.',
            spacing: { after: 200 }
          }),
          
          new Paragraph({
            text: 'Step 1: Check Resend API Key',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          
          ...[
            '1. Go to Base44 Dashboard > Settings > Secrets',
            '2. Find RESEND_API_KEY and verify it exists'
          ].map(text => new Paragraph({
            text: text,
            spacing: { after: 100 }
          })),
          
          new Paragraph({
            text: 'Step 2: Check If Automation Exists',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          
          ...[
            '1. Go to Base44 Dashboard > Code > Automations',
            '2. Look for "Lead Email Sequence Processor"',
            '3. It should run processLeadSequence every 1 hour'
          ].map(text => new Paragraph({
            text: text,
            spacing: { after: 100 }
          })),
          
          new Paragraph({
            text: 'Step 3: Test the Email Function',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          
          ...[
            '1. Go to Base44 Dashboard > Code > Functions',
            '2. Find sendLeadWelcomeSequence',
            '3. Create a test lead with your email',
            '4. Test the function with the lead ID'
          ].map(text => new Paragraph({
            text: text,
            spacing: { after: 100 }
          })),
          
          // Part 5
          new Paragraph({
            text: 'Part 5: Test Everything',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 600, after: 200 }
          }),
          
          new Paragraph({
            text: 'Why This Matters:',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          
          new Paragraph({
            text: 'Testing catches problems before real users do. Don\'t skip this part.',
            spacing: { after: 200 }
          }),
          
          new Paragraph({
            text: 'Test 1: User Signup',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          
          ...[
            '1. Go to the landing page',
            '2. Enter your email address',
            '3. Check BuyerLead entity for new record',
            '4. Check your email inbox for welcome email'
          ].map(text => new Paragraph({
            text: text,
            spacing: { after: 100 }
          })),
          
          new Paragraph({
            text: 'Test 2: Stripe Checkout',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          
          ...[
            '1. Go to /pricing page',
            '2. Click "Start Pro Trial"',
            '3. Use Stripe test card: 4242 4242 4242 4242',
            '4. Verify redirect to /checkout-success'
          ].map(text => new Paragraph({
            text: text,
            spacing: { after: 100 }
          })),
          
          new Paragraph({
            text: 'Test 3: Dashboard Navigation',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          
          ...[
            '1. Log in with your test account',
            '2. Click every item in the navigation menu',
            '3. Verify every page loads without errors'
          ].map(text => new Paragraph({
            text: text,
            spacing: { after: 100 }
          })),
          
          new Paragraph({
            text: 'Test 4: Lead Capture',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          
          ...[
            '1. Go to /get-leads',
            '2. Fill out the contractor signup form',
            '3. Check BuyerLead entity and your email'
          ].map(text => new Paragraph({
            text: text,
            spacing: { after: 100 }
          })),
          
          new Paragraph({
            text: 'Test 5: SEO Verification',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          
          ...[
            'Google Rich Results Test: https://search.google.com/test/rich-results',
            'Open Graph Preview: https://www.opengraph.xyz',
            'Mobile-Friendly Test: https://search.google.com/test/mobile-friendly',
            'PageSpeed Insights: https://pagespeed.web.dev/'
          ].map(text => new Paragraph({
            text: text,
            spacing: { after: 100 }
          })),
          
          new Paragraph({
            text: 'Test 6: Analytics',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          
          ...[
            'Google Analytics: Check realtime report at analytics.google.com',
            'Microsoft Clarity: Check recordings at clarity.microsoft.com'
          ].map(text => new Paragraph({
            text: text,
            spacing: { after: 100 }
          })),
          
          // Part 6
          new Paragraph({
            text: 'Part 6: Final Checklist',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 600, after: 200 }
          }),
          
          new Paragraph({
            text: 'Functionality:',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          
          ...[
            'User signup works',
            'Login works',
            'Stripe checkout completes payment',
            'Checkout success page displays',
            'Lead submission creates BuyerLead record',
            'Welcome email sent automatically',
            'Dashboard loads without errors',
            'All navigation links work',
            'Mobile responsive on all pages'
          ].map(text => new Paragraph({
            text: text,
            spacing: { after: 100 }
          })),
          
          new Paragraph({
            text: 'Brand:',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          
          ...[
            'Logo displays on all pages',
            'Favicon appears in browser tab',
            'OG image shows when sharing on Facebook/LinkedIn',
            'Twitter card shows when sharing on Twitter',
            'PWA install works on mobile'
          ].map(text => new Paragraph({
            text: text,
            spacing: { after: 100 }
          })),
          
          new Paragraph({
            text: 'SEO:',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          
          ...[
            'Title tags on all pages',
            'Meta descriptions (150-160 characters)',
            'OG tags for social sharing',
            'Structured data (JSON-LD) implemented',
            'FAQ schema validated',
            'Google Analytics tracking',
            'Microsoft Clarity tracking'
          ].map(text => new Paragraph({
            text: text,
            spacing: { after: 100 }
          })),
          
          new Paragraph({
            text: 'Payments:',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          
          ...[
            'STRIPE_SECRET_KEY set and working',
            'STRIPE_PUBLISHABLE_KEY set',
            'All 3 products exist in Stripe',
            'Test checkout returns valid URL'
          ].map(text => new Paragraph({
            text: text,
            spacing: { after: 100 }
          })),
          
          new Paragraph({
            text: 'Email:',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          
          ...[
            'RESEND_API_KEY set and working',
            'Automation runs hourly',
            'Test email sends successfully'
          ].map(text => new Paragraph({
            text: text,
            spacing: { after: 100 }
          })),
          
          new Paragraph({
            text: 'OAuth (External Integrations):',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          
          ...[
            'Gmail authorized',
            'LinkedIn Recruiter authorized',
            'Google Calendar authorized',
            'Outlook authorized'
          ].map(text => new Paragraph({
            text: text,
            spacing: { after: 100 }
          })),
          
          new Paragraph({
            text: 'Legal:',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          
          ...[
            'Privacy policy published (/privacy)',
            'Terms of service published (/terms)',
            'Security page published (/security)',
            'Contact page published (/contact)'
          ].map(text => new Paragraph({
            text: text,
            spacing: { after: 100 }
          })),
          
          // Troubleshooting
          new Paragraph({
            text: 'Troubleshooting - Common Problems',
            heading: HeadingLevel.HEADING_1,
            spacing: { before: 600, after: 200 }
          }),
          
          new Paragraph({
            text: 'Problem: Stripe says "Invalid API Key"',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          
          new Paragraph({
            text: 'Solution: Get new keys from Stripe Dashboard and update in Base44 Secrets.',
            spacing: { after: 200 }
          }),
          
          new Paragraph({
            text: 'Problem: Email not sending',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          
          new Paragraph({
            text: 'Solution: Check RESEND_API_KEY exists, verify automation exists, test sendLeadWelcomeSequence function manually.',
            spacing: { after: 200 }
          }),
          
          new Paragraph({
            text: 'Problem: Logo not showing',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          
          new Paragraph({
            text: 'Solution: Right-click broken image, copy correct URL from Base44 Media, update in index.html, Landing.jsx, and NavBar.jsx.',
            spacing: { after: 200 }
          }),
          
          new Paragraph({
            text: 'Problem: OG image not showing on Facebook',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          
          new Paragraph({
            text: 'Solution: Use https://developers.facebook.com/tools/debug/ to scrape and see what Facebook sees.',
            spacing: { after: 200 }
          }),
          
          new Paragraph({
            text: 'Problem: Schema not detected by Google',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          
          new Paragraph({
            text: 'Solution: Use https://search.google.com/test/rich-results to find and fix errors in your JSON-LD.',
            spacing: { after: 200 }
          }),
          
          new Paragraph({
            text: 'Problem: Analytics not tracking',
            heading: HeadingLevel.HEADING_2,
            spacing: { before: 200, after: 100 }
          }),
          
          new Paragraph({
            text: 'Solution: Check browser console for errors, verify IDs are correct: Google Analytics: G-63BS3L5HJ1, Microsoft Clarity: x2gmvyuvm4',
            spacing: { after: 200 }
          }),
          
          // Footer
          new Paragraph({
            children: [
              new TextRun({
                text: 'Implementation Guide - Production Ready',
                italics: true,
                color: '999999'
              })
            ],
            alignment: AlignmentType.CENTER,
            spacing: { before: 400 }
          })
        ]
      }]
    });

    const buffer = await Packer.toBuffer(doc);
    
    return new Response(buffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'Content-Disposition': 'attachment; filename="Implementation_Guide.docx"'
      }
    });
  } catch (error) {
    console.error('DOCX generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});