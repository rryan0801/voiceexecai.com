import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import jsPDF from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const contentWidth = pageWidth - (margin * 2);

    let yPos = margin;

    // ============ COVER PAGE ============
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, pageWidth, 50, 'F');
    
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont('helvetica', 'bold');
    doc.text('Implementation Guide', pageWidth / 2, 30, { align: 'center' });
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.text('Anyone Can Follow This (Even a 5th Grader)', pageWidth / 2, 42, { align: 'center' });
    
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(11);
    doc.text('Last Updated: June 29, 2026', pageWidth / 2, 60, { align: 'center' });

    // Add new page for content
    doc.addPage();
    yPos = margin;
    
    // ============ TABLE OF CONTENTS ============
    doc.setFillColor(59, 130, 246);
    doc.rect(margin, yPos - 5, contentWidth, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('Table of Contents', margin + 5, yPos + 1);
    
    yPos += 15;
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const toc = [
      'Before You Start - Read This First',
      'Part 1: Make the App Look Professional',
      'Part 2: Help Google Find Your Site (SEO)',
      'Part 3: Fix Stripe Payments',
      'Part 4: Turn On Email Automation',
      'Part 5: Test Everything',
      'Part 6: Final Checklist',
      'Troubleshooting - Common Problems'
    ];
    
    toc.forEach((item, i) => {
      doc.text(`${i + 1}. ${item}`, margin + 5, yPos);
      yPos += 6;
    });
    
    // ============ CONTENT SECTIONS ============
    const sections = [
      {
        title: 'Before You Start - Read This First',
        content: [
          'What You\'re Building:',
          'The platform does two things:',
          '1. Voice Commands for Email - People speak commands, the app manages their email',
          '2. Contractor Leads - Plumbers, roofers, etc. get customer leads in their area',
          '',
          'What\'s Already Done:',
          '- 80+ Backend Functions - All the code that makes things work',
          '- 30+ Database Tables - Where data is stored (users, leads, deals, etc.)',
          '- Payment System - Stripe integration for $0, $49, and $999 plans',
          '- Email System - Automatic welcome emails when someone signs up',
          '- Analytics - Google Analytics and Microsoft Clarity tracking',
          '- Legal Pages - Privacy, Terms, Security, Contact pages',
          '',
          'What You Need to Do:',
          '1. Add Brand Images - Logo, favicon, social media images',
          '2. Add SEO Tags - Help Google find and rank the site',
          '3. Fix Stripe - Make sure payments work (API keys expire)',
          '4. Turn On Email Automation - Make welcome emails send automatically',
          '5. Test Everything - Make sure it all works',
          '',
          'What You Need Access To:',
          '- Base44: https://app.base44.com (main platform)',
          '- Stripe: https://dashboard.stripe.com (payments)',
          '- Resend: https://resend.com (email sending)',
          '- Google Analytics: https://analytics.google.com (optional, for testing)'
        ]
      },
      {
        title: 'Part 1: Make the App Look Professional',
        content: [
          'Why This Matters:',
          'First impressions count. If the logo is missing or the favicon is wrong,',
          'people think the app is broken or unprofessional.',
          '',
          'Step 1: Create 5 Images',
          'You need 5 images. Use an AI image generator.',
          '',
          'Image 1: Main Logo (512x512 pixels)',
          'Prompt: Professional tech logo - a sleek modern microphone icon combined',
          'with sound waves, gradient from electric blue (#3B82F6) to violet',
          '(#8B5CF6), minimalist design, white background, app icon style.',
          '',
          'Image 2: Browser Tab Icon (32x32 pixels)',
          'Prompt: Simple microphone icon, blue to violet gradient, minimalist.',
          '',
          'Image 3: iPhone Home Screen Icon (180x180 pixels)',
          'Prompt: App icon, microphone with sound waves, blue violet gradient.',
          '',
          'Image 4: Facebook/LinkedIn Share Image (1200x630 pixels)',
          'Prompt: Social media banner, modern tech background with gradient blue',
          'to violet, abstract sound waves and AI neural patterns.',
          '',
          'Image 5: Twitter Share Image (1200x630 pixels)',
          'Prompt: Twitter card banner, gradient blue violet background.',
          '',
          'Step 2: Upload Images to Base44',
          '1. Go to Base44 Dashboard > Media',
          '2. Click "Upload File" button',
          '3. Upload all 5 images one at a time',
          '4. Copy the URL after each upload',
          '',
          'Step 3: Update the Website Code',
          'File to Edit: index.html',
          'Add favicon, Open Graph, and Twitter Card meta tags with your URLs.',
          '',
          'Step 4: Create PWA Manifest File',
          'File to Create: public/manifest.json',
          'Configure app name, icons, and theme colors.',
          '',
          'Step 5: Update Logo in Navigation',
          'Files to Edit: src/pages/Landing.jsx, src/components/NavBar.jsx',
          'Replace the old logo URL with your new logo URL.'
        ]
      },
      {
        title: 'Part 2: Help Google Find Your Site (SEO)',
        content: [
          'Why This Matters:',
          'If Google can\'t understand your site, nobody will find it.',
          '',
          'What You\'re Adding:',
          '1. Meta Tags - Invisible labels that tell Google what your site is about',
          '2. Structured Data - Special code that helps Google show rich results',
          '3. Analytics - Code that tracks how people use your site',
          '',
          'Step 1: Add Meta Tags to index.html',
          'Add title, description, keywords, canonical URL, and robots meta tags.',
          'Include Google Search Console verification and Analytics scripts.',
          '',
          'Step 2: Add Structured Data (JSON-LD)',
          'Add JSON-LD schema for SoftwareApplication, Organization, and FAQPage.',
          'This helps Google show your site with star ratings, prices, and FAQs.',
          '',
          'How to Know You Did This Right:',
          '- Google Rich Results Test shows no errors',
          '- When you search for the site on Google, the title and description match',
          '- Google Analytics shows real-time visitors',
          '- Microsoft Clarity records your session'
        ]
      },
      {
        title: 'Part 3: Fix Stripe Payments',
        content: [
          'Why This Matters:',
          'If Stripe isn\'t working, nobody can pay you.',
          '',
          'Step 1: Check If Stripe Is Working',
          '1. Go to Base44 Dashboard > Code > Functions',
          '2. Find createStripeCheckout in the list',
          '3. Click "Test" button',
          '4. Use test payload with price_id and URLs',
          '',
          'Step 2: Get New Stripe API Keys (If Needed)',
          '1. Go to https://dashboard.stripe.com',
          '2. Click "Developers" > "API keys"',
          '3. Copy publishable key and secret key',
          '',
          'Step 3: Update Base44 Secrets',
          '1. Go to Base44 Dashboard > Settings > Secrets',
          '2. Update STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY',
          '',
          'Step 4: Verify Stripe Products Exist',
          'Check Stripe Dashboard > Products for 3 products:',
          '- Free ($0/month)',
          '- Pro ($49/month)',
          '- Enterprise ($999/month)'
        ]
      },
      {
        title: 'Part 4: Turn On Email Automation',
        content: [
          'Why This Matters:',
          'When someone signs up for leads, they should get a welcome email automatically.',
          '',
          'Step 1: Check Resend API Key',
          '1. Go to Base44 Dashboard > Settings > Secrets',
          '2. Find RESEND_API_KEY and verify it exists',
          '',
          'Step 2: Check If Automation Exists',
          '1. Go to Base44 Dashboard > Code > Automations',
          '2. Look for "Lead Email Sequence Processor"',
          '3. It should run processLeadSequence every 1 hour',
          '',
          'Step 3: Test the Email Function',
          '1. Go to Base44 Dashboard > Code > Functions',
          '2. Find sendLeadWelcomeSequence',
          '3. Create a test lead with your email',
          '4. Test the function with the lead ID',
          '',
          'How to Know You Did This Right:',
          '- Automation exists and is active in Base44',
          '- Test email function sends an email to your inbox',
          '- BuyerLead record shows welcome_sent: true after the test'
        ]
      },
      {
        title: 'Part 5: Test Everything',
        content: [
          'Why This Matters:',
          'Testing catches problems before real users do.',
          '',
          'Test 1: User Signup',
          '1. Go to the landing page',
          '2. Enter your email address',
          '3. Check BuyerLead entity for new record',
          '4. Check your email inbox for welcome email',
          '',
          'Test 2: Stripe Checkout',
          '1. Go to /pricing page',
          '2. Click "Start Pro Trial"',
          '3. Use Stripe test card: 4242 4242 4242 4242',
          '4. Verify redirect to /checkout-success',
          '',
          'Test 3: Dashboard Navigation',
          '1. Log in with your test account',
          '2. Click every item in the navigation menu',
          '3. Verify every page loads without errors',
          '',
          'Test 4: Lead Capture',
          '1. Go to /get-leads',
          '2. Fill out the contractor signup form',
          '3. Check BuyerLead entity and your email',
          '',
          'Test 5: SEO Verification',
          '- Google Rich Results Test: https://search.google.com/test/rich-results',
          '- Open Graph Preview: https://www.opengraph.xyz',
          '- Mobile-Friendly Test: https://search.google.com/test/mobile-friendly',
          '- PageSpeed Insights: https://pagespeed.web.dev/',
          '',
          'Test 6: Analytics',
          '- Google Analytics: Check realtime report at analytics.google.com',
          '- Microsoft Clarity: Check recordings at clarity.microsoft.com'
        ]
      },
      {
        title: 'Part 6: Final Checklist',
        content: [
          'Functionality:',
          '- User signup works',
          '- Login works',
          '- Stripe checkout completes payment',
          '- Checkout success page displays',
          '- Lead submission creates BuyerLead record',
          '- Welcome email sent automatically',
          '- Dashboard loads without errors',
          '- All navigation links work',
          '- Mobile responsive on all pages',
          '',
          'Brand:',
          '- Logo displays on all pages',
          '- Favicon appears in browser tab',
          '- OG image shows when sharing on Facebook/LinkedIn',
          '- Twitter card shows when sharing on Twitter',
          '- PWA install works on mobile',
          '',
          'SEO:',
          '- Title tags on all pages',
          '- Meta descriptions (150-160 characters)',
          '- OG tags for social sharing',
          '- Structured data (JSON-LD) implemented',
          '- FAQ schema validated',
          '- Google Analytics tracking',
          '- Microsoft Clarity tracking',
          '',
          'Payments:',
          '- STRIPE_SECRET_KEY set and working',
          '- STRIPE_PUBLISHABLE_KEY set',
          '- All 3 products exist in Stripe',
          '- Test checkout returns valid URL',
          '',
          'Email:',
          '- RESEND_API_KEY set and working',
          '- Automation runs hourly',
          '- Test email sends successfully',
          '',
          'OAuth (External Integrations):',
          '- Gmail authorized',
          '- LinkedIn Recruiter authorized',
          '- Google Calendar authorized',
          '- Outlook authorized',
          '',
          'Legal:',
          '- Privacy policy published (/privacy)',
          '- Terms of service published (/terms)',
          '- Security page published (/security)',
          '- Contact page published (/contact)'
        ]
      },
      {
        title: 'Troubleshooting - Common Problems',
        content: [
          'Problem: Stripe says "Invalid API Key"',
          'Solution: Get new keys from Stripe Dashboard and update in Base44 Secrets.',
          '',
          'Problem: Email not sending',
          'Solution: Check RESEND_API_KEY exists, verify automation exists,',
          'test sendLeadWelcomeSequence function manually.',
          '',
          'Problem: Logo not showing',
          'Solution: Right-click broken image, copy correct URL from Base44 Media,',
          'update in index.html, Landing.jsx, and NavBar.jsx.',
          '',
          'Problem: OG image not showing on Facebook',
          'Solution: Use https://developers.facebook.com/tools/debug/ to scrape',
          'and see what Facebook sees.',
          '',
          'Problem: Schema not detected by Google',
          'Solution: Use https://search.google.com/test/rich-results to find',
          'and fix errors in your JSON-LD.',
          '',
          'Problem: Analytics not tracking',
          'Solution: Check browser console for errors, verify IDs are correct:',
          '- Google Analytics: G-63BS3L5HJ1',
          '- Microsoft Clarity: x2gmvyuvm4'
        ]
      }
    ];

    sections.forEach((section, sectionIndex) => {
      if (yPos > pageHeight - margin - 20) {
        doc.addPage();
        yPos = margin;
      }
      
      // Section header
      doc.setFillColor(59, 130, 246);
      doc.rect(margin, yPos - 5, contentWidth, 8, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text(section.title, margin + 5, yPos + 1);
      
      yPos += 12;
      doc.setTextColor(50, 50, 50);
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      
      section.content.forEach(line => {
        if (yPos > pageHeight - margin - 10) {
          doc.addPage();
          yPos = margin;
        }
        if (line === '') {
          yPos += 3;
        } else {
          doc.text(line, margin + 5, yPos);
          yPos += 5;
        }
      });
      
      yPos += 8;
    });

    // ============ FOOTER ============
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('Implementation Guide - Production Ready', pageWidth / 2, pageHeight - 10, { align: 'center' });

    // Convert PDF to blob and return
    const pdfBytes = doc.output('arraybuffer');
    
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="Implementation_Guide.pdf"'
      }
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});