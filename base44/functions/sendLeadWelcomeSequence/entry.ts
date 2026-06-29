import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { Resend } from 'npm:resend@4.0.0';

const SAMPLE_LEADS = {
  roofing: { job: 'Storm damage roof replacement', value: '$12,400', area: 'North Dallas, TX' },
  plumbing: { job: 'Full bathroom remodel plumbing', value: '$4,800', area: 'Austin, TX' },
  hvac: { job: 'New HVAC system install (2,400 sq ft)', value: '$9,200', area: 'Houston, TX' },
  electrical: { job: 'Whole-home rewire + panel upgrade', value: '$7,600', area: 'Phoenix, AZ' },
  landscaping: { job: 'Backyard renovation & irrigation', value: '$6,100', area: 'Denver, CO' },
  cleaning: { job: 'Weekly commercial office cleaning contract', value: '$2,400/mo', area: 'Chicago, IL' },
  painting: { job: 'Exterior repaint — 3,200 sq ft home', value: '$5,200', area: 'Atlanta, GA' },
  general_contractor: { job: 'Kitchen + master bath full renovation', value: '$38,000', area: 'Nashville, TN' },
  pest_control: { job: 'Annual termite treatment contract (50 units)', value: '$8,500', area: 'Tampa, FL' },
  solar: { job: '14-panel residential solar install', value: '$21,000', area: 'San Diego, CA' },
  other: { job: 'Commercial property maintenance contract', value: '$3,600/mo', area: 'Your area' }
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { lead_id, email_type } = await req.json();

    if (!lead_id || !email_type) {
      return Response.json({ error: 'lead_id and email_type required' }, { status: 400 });
    }

    const lead = await base44.asServiceRole.entities.BuyerLead.get(lead_id);
    if (!lead) return Response.json({ error: 'Lead not found' }, { status: 404 });

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    const sample = SAMPLE_LEADS[lead.vertical] || SAMPLE_LEADS.other;

    let subject, html;

    if (email_type === 'welcome') {
      subject = `Welcome to VoiceExecAI Leads, ${lead.name.split(' ')[0]}!`;
      html = `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;color:#334155">
          <div style="background:linear-gradient(135deg,#2563EB,#7C3AED);padding:32px;border-radius:12px 12px 0 0;text-align:center">
            <h1 style="color:white;margin:0;font-size:24px">Welcome to VoiceExecAI Leads 🎉</h1>
          </div>
          <div style="background:#fff;padding:32px;border:1px solid #e2e8f0;border-top:0;border-radius:0 0 12px 12px">
            <p>Hi ${lead.name.split(' ')[0]},</p>
            <p>You're now in the queue for <strong>${lead.vertical.replace('_', ' ')} leads</strong> in <strong>${lead.city}, ${lead.state}</strong>.</p>
            <p>Here's what happens next:</p>
            <ul style="line-height:2">
              <li>✅ We match you with buyers actively searching in your area</li>
              <li>✅ You get notified the moment a new lead matches your vertical</li>
              <li>✅ You only pay for leads you want — no subscriptions or surprises</li>
            </ul>
            <div style="background:#f0f9ff;border-left:4px solid #2563EB;padding:16px;margin:24px 0;border-radius:4px">
              <p style="margin:0;font-weight:600">⏰ Check your inbox tomorrow</p>
              <p style="margin:8px 0 0">We'll send you a real sample lead from your vertical so you can see exactly what you'll receive.</p>
            </div>
            <a href="https://voiceexecai.com/pricing" style="display:inline-block;background:linear-gradient(135deg,#2563EB,#7C3AED);color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:16px">View Plans & Pricing →</a>
            <p style="margin-top:32px;font-size:13px;color:#94a3b8">Questions? Reply to this email — we read every one.<br/>— The VoiceExecAI Team</p>
          </div>
        </div>`;

      await base44.asServiceRole.entities.BuyerLead.update(lead_id, { welcome_sent: true });

    } else if (email_type === 'followup1') {
      subject = `Here's a real ${lead.vertical.replace('_', ' ')} lead in your area`;
      html = `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;color:#334155">
          <div style="background:linear-gradient(135deg,#2563EB,#7C3AED);padding:32px;border-radius:12px 12px 0 0;text-align:center">
            <h1 style="color:white;margin:0;font-size:24px">🔥 Sample Lead Just For You</h1>
          </div>
          <div style="background:#fff;padding:32px;border:1px solid #e2e8f0;border-top:0;border-radius:0 0 12px 12px">
            <p>Hi ${lead.name.split(' ')[0]},</p>
            <p>Here's an example of what a <strong>${lead.vertical.replace('_', ' ')} lead</strong> looks like on our platform:</p>
            <div style="background:#f8fafc;border:2px solid #e2e8f0;border-radius:12px;padding:24px;margin:24px 0">
              <p style="margin:0 0 8px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:0.05em">SAMPLE LEAD</p>
              <h2 style="margin:0 0 16px;color:#0f172a">${sample.job}</h2>
              <div style="display:flex;gap:24px;flex-wrap:wrap">
                <div><strong>Est. Value:</strong> ${sample.value}</div>
                <div><strong>Location:</strong> ${sample.area}</div>
                <div><strong>Vertical:</strong> ${lead.vertical.replace('_', ' ')}</div>
              </div>
              <p style="margin:16px 0 0;color:#64748b;font-size:13px">⭐ Buyer verified · Ready to hire · Budget confirmed</p>
            </div>
            <p>On our platform, you'd receive the buyer's name, phone, email, project details, and timeline — ready to call within minutes of them submitting.</p>
            <a href="https://voiceexecai.com/pricing" style="display:inline-block;background:linear-gradient(135deg,#2563EB,#7C3AED);color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">Get Access to Real Leads →</a>
            <p style="margin-top:32px;font-size:13px;color:#94a3b8">— The VoiceExecAI Team</p>
          </div>
        </div>`;

      await base44.asServiceRole.entities.BuyerLead.update(lead_id, { followup1_sent: true });

    } else if (email_type === 'followup2') {
      subject = `What contractors are saying about VoiceExecAI leads`;
      html = `
        <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;color:#334155">
          <div style="background:linear-gradient(135deg,#2563EB,#7C3AED);padding:32px;border-radius:12px 12px 0 0;text-align:center">
            <h1 style="color:white;margin:0;font-size:24px">Real results from contractors like you</h1>
          </div>
          <div style="background:#fff;padding:32px;border:1px solid #e2e8f0;border-top:0;border-radius:0 0 12px 12px">
            <p>Hi ${lead.name.split(' ')[0]},</p>
            <p>We wanted to share what other <strong>${lead.vertical.replace('_', ' ')} contractors</strong> are saying after using VoiceExecAI leads:</p>
            ${[
              { name: 'Marcus T.', role: 'Roofing contractor, DFW', quote: 'First lead I got turned into a $14k job. Closed it in 3 days.' },
              { name: 'Sandra R.', role: 'HVAC owner, Austin TX', quote: 'I was skeptical. Now I turn off lead flow because I\'m booked 6 weeks out.' },
              { name: 'James K.', role: 'General contractor, Nashville', quote: 'The leads are pre-qualified. No tire kickers. These people are ready to hire.' }
            ].map(t => `
              <div style="background:#f8fafc;border-left:4px solid #7C3AED;padding:16px;margin:16px 0;border-radius:4px">
                <p style="margin:0 0 8px;font-style:italic;color:#334155">"${t.quote}"</p>
                <p style="margin:0;font-size:13px;font-weight:600;color:#0f172a">${t.name}</p>
                <p style="margin:2px 0 0;font-size:12px;color:#64748b">${t.role}</p>
              </div>`).join('')}
            <p>Ready to start getting leads in <strong>${lead.city}, ${lead.state}</strong>?</p>
            <a href="https://voiceexecai.com/pricing" style="display:inline-block;background:linear-gradient(135deg,#2563EB,#7C3AED);color:white;padding:14px 28px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">Start Getting Leads Now →</a>
            <p style="margin-top:32px;font-size:13px;color:#94a3b8">— The VoiceExecAI Team | <a href="https://voiceexecai.com" style="color:#94a3b8">voiceexecai.com</a></p>
          </div>
        </div>`;

      await base44.asServiceRole.entities.BuyerLead.update(lead_id, { followup2_sent: true, stage: 'nurturing' });
    }

    const result = await resend.emails.send({
      from: 'VoiceExecAI Leads <hello@voiceexecai.com>',
      to: lead.email,
      subject,
      html
    });

    console.log(`[sendLeadWelcomeSequence] ${email_type} sent to ${lead.email}`, result);
    return Response.json({ success: true, email_id: result.data?.id });

  } catch (error) {
    console.error('[sendLeadWelcomeSequence] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});