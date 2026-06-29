import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';
import { Resend } from 'npm:resend@4.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Admin only' }, { status: 403 });
    }

    const { campaign_id, lead_ids, subject, body, template_type, campaign_name } = await req.json();

    if (!lead_ids?.length || !subject || !body) {
      return Response.json({ error: 'lead_ids, subject, and body required' }, { status: 400 });
    }

    const resend = new Resend(Deno.env.get('RESEND_API_KEY'));
    let sent_count = 0;
    let failed_count = 0;

    for (const lead_id of lead_ids) {
      try {
        const lead = await base44.asServiceRole.entities.BuyerLead.get(lead_id);
        if (!lead) continue;

        // Replace template variables
        const personalizedBody = body
          .replace(/\{\{name\}\}/g, lead.name.split(' ')[0])
          .replace(/\{\{city\}\}/g, lead.city)
          .replace(/\{\{state\}\}/g, lead.state)
          .replace(/\{\{vertical\}\}/g, lead.vertical.replace('_', ' '))
          .replace(/\{\{company\}\}/g, lead.company || 'your business');

        const html = `
          <div style="font-family:Inter,sans-serif;max-width:600px;margin:0 auto;color:#334155">
            <div style="background:linear-gradient(135deg,#2563EB,#7C3AED);padding:24px;border-radius:12px 12px 0 0">
              <p style="color:white;margin:0;font-size:13px;font-weight:600">VoiceExecAI Leads</p>
            </div>
            <div style="background:#fff;padding:32px;border:1px solid #e2e8f0;border-top:0;border-radius:0 0 12px 12px">
              <div style="white-space:pre-line;line-height:1.7">${personalizedBody}</div>
              <hr style="border:none;border-top:1px solid #e2e8f0;margin:24px 0"/>
              <p style="font-size:12px;color:#94a3b8;margin:0">© 2026 VoiceExecAI · <a href="https://voiceexecai.com" style="color:#94a3b8">voiceexecai.com</a> · <a href="mailto:hello@voiceexecai.com" style="color:#94a3b8">Unsubscribe</a></p>
            </div>
          </div>`;

        await resend.emails.send({
          from: 'VoiceExecAI Leads <hello@voiceexecai.com>',
          to: lead.email,
          subject,
          html
        });

        sent_count++;
      } catch (e) {
        console.error(`Failed to send to lead ${lead_id}:`, e.message);
        failed_count++;
      }
    }

    // Save campaign record
    const campaignData = {
      name: campaign_name || `Campaign ${new Date().toLocaleDateString()}`,
      template_type: template_type || 'custom',
      subject,
      body,
      recipient_ids: lead_ids,
      sent_count,
      delivered_count: sent_count,
      status: 'sent',
      sent_at: new Date().toISOString(),
      sent_by: user.email
    };

    let savedCampaign;
    if (campaign_id) {
      savedCampaign = await base44.asServiceRole.entities.OutreachCampaign.update(campaign_id, campaignData);
    } else {
      savedCampaign = await base44.asServiceRole.entities.OutreachCampaign.create(campaignData);
    }

    console.log(`[sendOutreachCampaign] Sent ${sent_count}, failed ${failed_count}`);
    return Response.json({ success: true, sent_count, failed_count, campaign: savedCampaign });

  } catch (error) {
    console.error('[sendOutreachCampaign] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});