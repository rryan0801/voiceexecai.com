import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const { accessToken } = await base44.asServiceRole.connectors.getCurrentAppUserConnection('69efbb8b3d25346a6ed84481');

    // Quick verify by fetching current user profile
    const res = await fetch('https://graph.microsoft.com/v1.0/me', {
      headers: { 'Authorization': `Bearer ${accessToken}` }
    });

    if (!res.ok) throw new Error('Not connected');
    const profile = await res.json();

    return Response.json({ connected: true, email: profile.mail || profile.userPrincipalName });
  } catch (error) {
    return Response.json({ error: 'Not connected' }, { status: 401 });
  }
});