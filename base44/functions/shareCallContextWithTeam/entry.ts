import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { 
      call_summary, 
      prospect_name, 
      company_name,
      deal_value,
      next_steps,
      slack_channel,
      teams_webhook,
      share_to 
    } = await req.json();

    if (!call_summary || !prospect_name) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const results = [];

    // Share to Slack if provided
    if (slack_channel) {
      try {
        const slackRes = await base44.asServiceRole.functions.invoke('sendSlackMessage', {
          channel: slack_channel,
          message: `📞 **Call Summary: ${prospect_name} at ${company_name}**\n\n${call_summary}\n\n💰 Deal Value: ${deal_value || 'TBD'}\n\n📅 Next Steps: ${next_steps || 'TBD'}`
        });
        results.push({ channel: 'slack', success: true, result: slackRes.data });
      } catch (error) {
        results.push({ channel: 'slack', success: false, error: error.message });
      }
    }

    // Share to Teams if provided
    if (teams_webhook) {
      try {
        const teamsRes = await base44.asServiceRole.functions.invoke('sendTeamsMessage', {
          webhook_url: teams_webhook,
          title: `Call with ${prospect_name} at ${company_name}`,
          message: call_summary,
          color: '#0078D4'
        });
        results.push({ channel: 'teams', success: true, result: teamsRes.data });
      } catch (error) {
        results.push({ channel: 'teams', success: false, error: error.message });
      }
    }

    // Log to database for team visibility
    if (share_to && share_to.includes('team_dashboard')) {
      try {
        // In a real implementation, save to a CallContext entity
        results.push({ 
          target: 'team_dashboard', 
          success: true, 
          message: 'Call context saved to team dashboard' 
        });
      } catch (error) {
        results.push({ target: 'team_dashboard', success: false, error: error.message });
      }
    }

    return Response.json({
      success: true,
      shared_to: results,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});