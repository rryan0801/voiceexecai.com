import { createClientFromRequest } from 'npm:@base44/sdk@0.8.31';

// This function is called by a scheduled automation every hour
// It finds leads that need follow-up emails at 24h and 48h marks
Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);

    const now = new Date();
    const leads = await base44.asServiceRole.entities.BuyerLead.filter({ stage: { $in: ['new', 'contacted'] } }, '-submitted_at', 500);

    let followup1_count = 0;
    let followup2_count = 0;

    for (const lead of leads) {
      if (!lead.submitted_at) continue;
      const submitted = new Date(lead.submitted_at);
      const hoursElapsed = (now - submitted) / (1000 * 60 * 60);

      // 24hr follow-up: between 23 and 26 hours after submission
      if (hoursElapsed >= 23 && hoursElapsed < 26 && !lead.followup1_sent) {
        try {
          await base44.asServiceRole.functions.invoke('sendLeadWelcomeSequence', {
            lead_id: lead.id,
            email_type: 'followup1'
          });
          followup1_count++;
          console.log(`[processLeadSequence] followup1 sent to ${lead.email}`);
        } catch (e) {
          console.error(`Failed followup1 for ${lead.id}:`, e.message);
        }
      }

      // 48hr follow-up: between 47 and 50 hours after submission
      if (hoursElapsed >= 47 && hoursElapsed < 50 && lead.followup1_sent && !lead.followup2_sent) {
        try {
          await base44.asServiceRole.functions.invoke('sendLeadWelcomeSequence', {
            lead_id: lead.id,
            email_type: 'followup2'
          });
          followup2_count++;
          console.log(`[processLeadSequence] followup2 sent to ${lead.email}`);
        } catch (e) {
          console.error(`Failed followup2 for ${lead.id}:`, e.message);
        }
      }
    }

    console.log(`[processLeadSequence] Done. followup1: ${followup1_count}, followup2: ${followup2_count}`);
    return Response.json({ success: true, followup1_count, followup2_count, checked: leads.length });

  } catch (error) {
    console.error('[processLeadSequence] Error:', error.message);
    return Response.json({ error: error.message }, { status: 500 });
  }
});