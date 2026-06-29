import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import jsPDF from 'npm:jspdf@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    
    // Verify user is authenticated
    const user = await base44.auth.me();
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Create PDF
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
    // Blue gradient background
    doc.setFillColor(59, 130, 246);
    doc.rect(0, 0, pageWidth, 80, 'F');
    
    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.setFont('helvetica', 'bold');
    doc.text('VoiceExecAI', pageWidth / 2, 50, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setFont('helvetica', 'normal');
    doc.text('Implementation Guide', pageWidth / 2, 60, { align: 'center' });
    
    // Info
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(11);
    doc.text('Production-Ready Deployment Instructions', pageWidth / 2, 90, { align: 'center' });
    doc.text('⏱️ Time: 3-4 hours | 📊 Difficulty: Beginner-friendly', pageWidth / 2, 100, { align: 'center' });
    doc.text('📅 Last Updated: June 29, 2026 | ✅ Status: Production-Ready', pageWidth / 2, 110, { align: 'center' });
    
    // Footer
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(9);
    doc.text('Confidential - For Manus Development Team', pageWidth / 2, 280, { align: 'center' });

    // Add new page for content
    doc.addPage();
    yPos = margin;

    // ============ TABLE OF CONTENTS ============
    doc.setFillColor(59, 130, 246);
    doc.rect(margin, yPos - 5, contentWidth, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('📋 Table of Contents', margin + 5, yPos + 2);
    
    yPos += 15;
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    
    const tocItems = [
      '1. Before You Start',
      '2. Part 1: Brand Assets (45 min)',
      '3. Part 2: SEO & Analytics (30 min)',
      '4. Part 3: Stripe Payments (30 min)',
      '5. Part 4: Email Automation (30 min)',
      '6. Part 5: Testing (60 min)',
      '7. Part 6: Final Checklist (30 min)',
      '8. Troubleshooting'
    ];
    
    tocItems.forEach((item) => {
      doc.text(`☐ ${item}`, margin + 5, yPos);
      yPos += 7;
    });
    
    doc.addPage();
    yPos = margin;

    // ============ BEFORE YOU START ============
    doc.setFillColor(59, 130, 246);
    doc.rect(margin, yPos - 5, contentWidth, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('🎯 Before You Start', margin + 5, yPos + 2);
    
    yPos += 15;
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('VoiceExecAI is a voice-powered sales automation platform:', margin + 5, yPos);
    yPos += 8;
    doc.text('🎤 Voice Email Management - Users speak commands to manage inbox', margin + 10, yPos);
    yPos += 7;
    doc.text('👷 Contractor Lead Generation - Service businesses get customer leads', margin + 10, yPos);
    
    yPos += 12;
    doc.setFont('helvetica', 'bold');
    doc.text('✅ What\'s Already Complete:', margin + 5, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    const completed = [
      '80+ Backend Functions', '30+ Database Entities', 'Stripe Payment Integration',
      'Email Automation', 'Analytics Tracking', 'Legal Pages', 'OAuth Integrations'
    ];
    completed.forEach(item => {
      doc.text(`☑ ${item}`, margin + 10, yPos);
      yPos += 6;
    });
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('🔐 Required Access (Get These FIRST):', margin + 5, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(220, 50, 50);
    doc.text('⚠️ WARNING: Do not start until you have ALL FOUR logins!', margin + 5, yPos);
    yPos += 8;
    doc.setTextColor(50, 50, 50);
    const access = [
      '☐ Base44 - https://app.base44.com',
      '☐ Stripe - https://dashboard.stripe.com',
      '☐ Resend - https://resend.com',
      '☐ Google Analytics - https://analytics.google.com (optional)'
    ];
    access.forEach(item => {
      doc.text(item, margin + 10, yPos);
      yPos += 6;
    });

    // ============ PART 1: BRAND ASSETS ============
    doc.addPage();
    yPos = margin;
    
    doc.setFillColor(59, 130, 246);
    doc.rect(margin, yPos - 5, contentWidth, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('🎨 Part 1: Brand Assets (45 min)', margin + 5, yPos + 2);
    
    yPos += 15;
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('💡 Why: First impressions matter. Missing logos look unprofessional.', margin + 5, yPos);
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('📸 Step 1: Generate 5 Images (Use AI generator):', margin + 5, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    const images = [
      '1. Main Logo (512×512 PNG) - Website header',
      '2. Favicon (32×32 PNG) - Browser tab',
      '3. Apple Touch Icon (180×180 PNG) - iPhone home screen',
      '4. OG Image (1200×630 PNG) - Facebook/LinkedIn shares',
      '5. Twitter Card (1200×630 PNG) - Twitter shares'
    ];
    images.forEach(img => {
      doc.text(img, margin + 5, yPos);
      yPos += 6;
    });
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('📝 Step 2: Upload to Base44 Media:', margin + 5, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    doc.text('1. Base44 Dashboard → Media → Upload File', margin + 5, yPos);
    yPos += 6;
    doc.text('2. Upload all 5 images, copy CDN URLs', margin + 5, yPos);
    yPos += 6;
    doc.text('3. Record URLs for next steps', margin + 5, yPos);
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('🔧 Step 3: Update Code:', margin + 5, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    const updates = [
      'index.html - Add favicon, OG, Twitter meta tags',
      'public/manifest.json - Create with your icon URLs',
      'src/pages/Landing.jsx - Update logo URL',
      'src/components/NavBar.jsx - Update logo URL'
    ];
    updates.forEach(item => {
      doc.text(`☐ ${item}`, margin + 5, yPos);
      yPos += 6;
    });
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('✅ Verification:', margin + 5, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    const brandChecks = [
      '☐ Logo displays on landing page',
      '☐ Logo displays on dashboard',
      '☐ Favicon in browser tab',
      '☐ OG image shows on Facebook/LinkedIn',
      '☐ Twitter card shows on Twitter',
      '☐ PWA "Add to Home Screen" works'
    ];
    brandChecks.forEach(item => {
      doc.text(item, margin + 5, yPos);
      yPos += 6;
    });

    // ============ PART 2: SEO ============
    doc.addPage();
    yPos = margin;
    
    doc.setFillColor(59, 130, 246);
    doc.rect(margin, yPos - 5, contentWidth, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('🔍 Part 2: SEO & Analytics (30 min)', margin + 5, yPos + 2);
    
    yPos += 15;
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('💡 Why: If Google can\'t understand your site, nobody will find it.', margin + 5, yPos);
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('📝 Step 1: Add Meta Tags (index.html):', margin + 5, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    const metaTags = [
      '☐ Primary SEO (title, description, keywords, canonical)',
      '☐ Google Search Console Verification',
      '☐ Google Analytics 4 (G-63BS3L5HJ1)',
      '☐ Microsoft Clarity (x2gmvyuvm4)'
    ];
    metaTags.forEach(tag => {
      doc.text(tag, margin + 5, yPos);
      yPos += 6;
    });
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('📊 Step 2: Add Structured Data (JSON-LD):', margin + 5, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    const schemas = [
      '☐ SoftwareApplication Schema (pricing, ratings)',
      '☐ Organization Schema (logo, social, contact)',
      '☐ FAQPage Schema (5 FAQ items)'
    ];
    schemas.forEach(schema => {
      doc.text(schema, margin + 5, yPos);
      yPos += 6;
    });
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('✅ Verification:', margin + 5, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    const seoChecks = [
      '☐ Google Rich Results Test: https://search.google.com/test/rich-results',
      '☐ Open Graph Preview: https://www.opengraph.xyz',
      '☐ Google Analytics shows realtime visit',
      '☐ Microsoft Clarity records session'
    ];
    seoChecks.forEach(item => {
      doc.text(item, margin + 5, yPos);
      yPos += 6;
    });

    // ============ PART 3: STRIPE ============
    doc.addPage();
    yPos = margin;
    
    doc.setFillColor(59, 130, 246);
    doc.rect(margin, yPos - 5, contentWidth, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('💳 Part 3: Stripe Payments (30 min)', margin + 5, yPos + 2);
    
    yPos += 15;
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('💡 Why: If Stripe isn\'t working, nobody can pay you.', margin + 5, yPos);
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('🧪 Step 1: Test Stripe Integration:', margin + 5, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    doc.text('Base44 → Code → Functions → createStripeCheckout → Test', margin + 5, yPos);
    yPos += 6;
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.text('Payload: { price_id: "price_1TdNAuIcky2cOtqj5Yz6Xu82" }', margin + 5, yPos);
    yPos += 6;
    doc.text('Expected: Returns checkout URL', margin + 5, yPos);
    
    yPos += 10;
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('🔑 Step 2: Update API Keys (If "Invalid API Key"):', margin + 5, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    const stripeSteps = [
      '☐ Stripe Dashboard → Developers → API Keys',
      '☐ Copy pk_live_ and sk_live_ keys',
      '☐ Base44 → Settings → Secrets',
      '☐ Update STRIPE_SECRET_KEY and STRIPE_PUBLISHABLE_KEY',
      '☐ Re-test function'
    ];
    stripeSteps.forEach(step => {
      doc.text(step, margin + 5, yPos);
      yPos += 6;
    });
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('📦 Step 3: Verify Products:', margin + 5, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    const products = [
      '☐ VoiceExec Free - $0/month',
      '☐ VoiceExec Pro - $49/month',
      '☐ VoiceExec Enterprise - $999/month'
    ];
    products.forEach(product => {
      doc.text(product, margin + 5, yPos);
      yPos += 6;
    });
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('✅ Verification:', margin + 5, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    const stripeChecks = [
      '☐ Test returns valid checkout URL',
      '☐ All 3 products exist in Stripe',
      '☐ Checkout URL opens Stripe page'
    ];
    stripeChecks.forEach(item => {
      doc.text(item, margin + 5, yPos);
      yPos += 6;
    });

    // ============ PART 4: EMAIL ============
    doc.addPage();
    yPos = margin;
    
    doc.setFillColor(59, 130, 246);
    doc.rect(margin, yPos - 5, contentWidth, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('📧 Part 4: Email Automation (30 min)', margin + 5, yPos + 2);
    
    yPos += 15;
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('💡 Why: Welcome emails should send automatically when leads sign up.', margin + 5, yPos);
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('🔑 Step 1: Check Resend API Key:', margin + 5, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    doc.text('Base44 → Settings → Secrets → RESEND_API_KEY', margin + 5, yPos);
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('⚙️ Step 2: Verify Automation:', margin + 5, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    const automation = [
      'Base44 → Code → Automations',
      'Look for: "Lead Email Sequence Processor"',
      'Function: processLeadSequence',
      'Schedule: Every 1 hour',
      'Status: Active'
    ];
    automation.forEach(item => {
      doc.text(`☐ ${item}`, margin + 5, yPos);
      yPos += 6;
    });
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('🧪 Step 3: Test Email Function:', margin + 5, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    const emailSteps = [
      '☐ Create test lead in BuyerLead with your email',
      '☐ Test sendLeadWelcomeSequence function',
      '☐ Payload: { lead_id: "[ID]", email_type: "welcome" }',
      '☐ Verify email received',
      '☐ Verify welcome_sent: true in record'
    ];
    emailSteps.forEach(step => {
      doc.text(step, margin + 5, yPos);
      yPos += 6;
    });
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('✅ Verification:', margin + 5, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    const emailChecks = [
      '☐ Automation exists and active',
      '☐ Test email sends successfully',
      '☐ BuyerLead shows welcome_sent: true'
    ];
    emailChecks.forEach(item => {
      doc.text(item, margin + 5, yPos);
      yPos += 6;
    });

    // ============ PART 5: TESTING ============
    doc.addPage();
    yPos = margin;
    
    doc.setFillColor(59, 130, 246);
    doc.rect(margin, yPos - 5, contentWidth, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('🧪 Part 5: Testing (60 min)', margin + 5, yPos + 2);
    
    yPos += 15;
    doc.setTextColor(220, 50, 50);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('⚠️ Important: Testing catches problems before users do. Do not skip!', margin + 5, yPos);
    
    yPos += 10;
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'bold');
    doc.text('Test 1: User Signup Flow', margin + 5, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    const signupTests = [
      '☐ Landing page loads',
      '☐ Email capture form works',
      '☐ Submit creates BuyerLead record',
      '☐ Welcome email received'
    ];
    signupTests.forEach(test => {
      doc.text(test, margin + 5, yPos);
      yPos += 6;
    });
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Test 2: Stripe Checkout Flow', margin + 5, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    const checkoutTests = [
      '☐ Pricing page loads',
      '☐ Stripe checkout opens',
      '☐ Test payment works (4242 4242 4242 4242)',
      '☐ Redirect to /checkout-success',
      '☐ UsageMeter record created'
    ];
    checkoutTests.forEach(test => {
      doc.text(test, margin + 5, yPos);
      yPos += 6;
    });
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Test 3: Dashboard Navigation', margin + 5, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    const navTests = [
      '☐ Login successful',
      '☐ Dashboard loads',
      '☐ All nav menu items work',
      '☐ No console errors (F12)'
    ];
    navTests.forEach(test => {
      doc.text(test, margin + 5, yPos);
      yPos += 6;
    });
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Test 4: Lead Capture Flow', margin + 5, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    const leadTests = [
      '☐ /get-leads page loads',
      '☐ Form submits successfully',
      '☐ BuyerLead record created',
      '☐ Welcome email received'
    ];
    leadTests.forEach(test => {
      doc.text(test, margin + 5, yPos);
      yPos += 6;
    });
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Test 5: SEO Verification', margin + 5, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    const seoTests = [
      '☐ Google Rich Results: https://search.google.com/test/rich-results',
      '☐ Open Graph: https://www.opengraph.xyz',
      '☐ Mobile-Friendly: https://search.google.com/test/mobile-friendly',
      '☐ PageSpeed: https://pagespeed.web.dev/ (80+ mobile, 90+ desktop)'
    ];
    seoTests.forEach(test => {
      doc.text(test, margin + 5, yPos);
      yPos += 6;
    });
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('Test 6: Analytics', margin + 5, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    const analyticsTests = [
      '☐ Google Analytics Realtime shows visit',
      '☐ Microsoft Clarity records session'
    ];
    analyticsTests.forEach(test => {
      doc.text(test, margin + 5, yPos);
      yPos += 6;
    });

    // ============ PART 6: FINAL CHECKLIST ============
    doc.addPage();
    yPos = margin;
    
    doc.setFillColor(59, 130, 246);
    doc.rect(margin, yPos - 5, contentWidth, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('✅ Part 6: Final Checklist (30 min)', margin + 5, yPos + 2);
    
    yPos += 15;
    doc.setTextColor(50, 50, 50);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('🔧 Functionality:', margin + 5, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    const funcChecks = [
      '☐ User signup works', '☐ Login works', '☐ Stripe checkout completes',
      '☐ Checkout success page displays', '☐ Lead submission creates record',
      '☐ Welcome email sent', '☐ Dashboard loads', '☐ All nav links work',
      '☐ Mobile responsive'
    ];
    funcChecks.forEach(item => {
      doc.text(item, margin + 5, yPos);
      yPos += 6;
    });
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('🎨 Brand:', margin + 5, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    const brandChecks2 = [
      '☐ Logo on all pages', '☐ Favicon in browser', '☐ OG image on Facebook/LinkedIn',
      '☐ Twitter card on Twitter', '☐ PWA install works', '☐ Colors consistent'
    ];
    brandChecks2.forEach(item => {
      doc.text(item, margin + 5, yPos);
      yPos += 6;
    });
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('🔍 SEO:', margin + 5, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    const seoChecks2 = [
      '☐ Title tags on all pages', '☐ Meta descriptions', '☐ OG tags',
      '☐ Structured data (JSON-LD)', '☐ FAQ schema', '☐ GA tracking',
      '☐ Clarity tracking'
    ];
    seoChecks2.forEach(item => {
      doc.text(item, margin + 5, yPos);
      yPos += 6;
    });
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('💳 Payments:', margin + 5, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    const paymentChecks = [
      '☐ STRIPE_SECRET_KEY set', '☐ STRIPE_PUBLISHABLE_KEY set',
      '☐ All 3 products exist', '☐ Test checkout returns URL'
    ];
    paymentChecks.forEach(item => {
      doc.text(item, margin + 5, yPos);
      yPos += 6;
    });
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('📧 Email:', margin + 5, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    const emailChecks2 = [
      '☐ RESEND_API_KEY set', '☐ Automation runs hourly', '☐ Test email sends'
    ];
    emailChecks2.forEach(item => {
      doc.text(item, margin + 5, yPos);
      yPos += 6;
    });
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('🔗 OAuth:', margin + 5, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    const oauthChecks = [
      '☐ Gmail (Richard Ryan)', '☐ LinkedIn Recruiter',
      '☐ Google Calendar', '☐ Outlook (myOutlook)'
    ];
    oauthChecks.forEach(item => {
      doc.text(item, margin + 5, yPos);
      yPos += 6;
    });
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('⚖️ Legal:', margin + 5, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    const legalChecks = [
      '☐ Privacy (/privacy)', '☐ Terms (/terms)',
      '☐ Security (/security)', '☐ Contact (/contact)'
    ];
    legalChecks.forEach(item => {
      doc.text(item, margin + 5, yPos);
      yPos += 6;
    });

    // ============ TROUBLESHOOTING ============
    doc.addPage();
    yPos = margin;
    
    doc.setFillColor(59, 130, 246);
    doc.rect(margin, yPos - 5, contentWidth, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('🔧 Troubleshooting', margin + 5, yPos + 2);
    
    yPos += 15;
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'bold');
    doc.text('❌ Stripe "Invalid API Key":', margin + 5, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    doc.text('Solution: Stripe → Developers → API Keys → Create new → Update Base44 Secrets', margin + 5, yPos);
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('❌ Email not sending:', margin + 5, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    doc.text('Solution: Check RESEND_API_KEY, verify automation exists, test manually', margin + 5, yPos);
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('❌ Logo not showing:', margin + 5, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    doc.text('Solution: Right-click → Open image → If 404, update URL in all files', margin + 5, yPos);
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('❌ OG image not on Facebook:', margin + 5, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    doc.text('Solution: https://developers.facebook.com/tools/debug/ → Scrape Again', margin + 5, yPos);
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('❌ Schema not detected:', margin + 5, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    doc.text('Solution: https://search.google.com/test/rich-results → Fix errors shown', margin + 5, yPos);
    
    yPos += 10;
    doc.setFont('helvetica', 'bold');
    doc.text('❌ Analytics not tracking:', margin + 5, yPos);
    yPos += 7;
    doc.setFont('helvetica', 'normal');
    doc.text('Solution: F12 Console → Check for gtag/clarity errors → Verify IDs correct', margin + 5, yPos);

    // ============ COMPLETION ============
    doc.addPage();
    yPos = margin;
    
    doc.setFillColor(16, 185, 129);
    doc.rect(margin, yPos - 5, contentWidth, 20, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('🎉 You\'re Done!', margin + 5, yPos + 5);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.text('If you checked every box, the app is production-ready.', margin + 5, yPos + 13);
    
    yPos += 30;
    doc.setTextColor(50, 50, 50);
    doc.setFont('helvetica', 'bold');
    doc.text('📋 Report to Project Owner:', margin + 5, yPos);
    yPos += 10;
    doc.setFont('helvetica', 'normal');
    const report = [
      '✅ All 5 brand images uploaded and displaying',
      '✅ SEO meta tags and structured data added',
      '✅ Stripe payments tested and working',
      '✅ Email automation configured and tested',
      '✅ All functionality tested',
      '✅ Analytics tracking verified',
      '✅ Mobile responsive verified',
      '✅ All OAuth connectors authorized',
      '',
      'Status: PRODUCTION-READY'
    ];
    report.forEach(line => {
      doc.text(line, margin + 5, yPos);
      yPos += 6;
    });
    
    yPos += 15;
    doc.setTextColor(100, 100, 100);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.text('Good luck! You\'ve got this. 🚀', margin + 5, yPos);
    yPos += 8;
    doc.text('Remember: Follow every step in order. Don\'t skip. Check every box.', margin + 5, yPos);
    
    // Footer
    doc.setTextColor(150, 150, 150);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('Last Updated: June 29, 2026 | Status: Production-Ready', pageWidth / 2, 280, { align: 'center' });

    // Convert PDF to blob and return
    const pdfBytes = doc.output('arraybuffer');
    
    return new Response(pdfBytes, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="VoiceExecAI_Implementation_Guide.pdf"'
      }
    });
  } catch (error) {
    console.error('PDF generation error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
});