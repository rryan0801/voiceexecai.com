import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import { secrets } from 'base44:runtime';

export default async function(req: Request): Promise<Response> {
  try {
    // Auth: require the shared bearer token (MODULE_API_KEY secret)
    const expectedToken = 'Bearer ' + secrets.get('MODULE_API_KEY');
    const authHeader = req.headers.get('authorization') || '';
    if (authHeader !== expectedToken) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Count voice commands from the app's own data (service role — no user auth)
    const base44 = createClientFromRequest(req);
    let commandCount = 0;
    try {
      const commands = await base44.asServiceRole.entities.Command.list('-created_date', 1000);
      commandCount = commands.length;
    } catch (err) {
      console.error('Failed to read commands count:', err.message);
    }

    return Response.json({
      site: 'voiceexecai.com',
      status: 'live',
      category: 'AI Productivity',
      platform: 'base44',
      metrics: {
        label: 'Commands Executed',
        value: String(commandCount),
        trend: 'up'
      },
      lastUpdated: Date.now()
    });
  } catch (error) {
    console.error('module-data error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}