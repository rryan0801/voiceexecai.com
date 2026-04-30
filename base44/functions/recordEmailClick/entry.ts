import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  // This endpoint is called by link click tracking (no auth required for redirect)
  try {
    const url = new URL(req.url);
    const emailId = url.searchParams.get('email_id');
    const targetUrl = url.searchParams.get('url');

    if (!emailId || !targetUrl) {
      return new Response('Invalid parameters', { status: 400 });
    }

    // Use service role to update tracking
    const base44 = createClientFromRequest(req);

    const events = await base44.asServiceRole.entities.EmailTrackingEvent.filter(
      { email_id: emailId },
      '-created_date',
      1
    );

    if (events && events.length > 0) {
      const event = events[0];
      const now = new Date().toISOString();

      // Initialize links_clicked if not present
      const linksClicked = event.links_clicked || [];
      const existingLink = linksClicked.find(l => l.url === targetUrl);

      if (existingLink) {
        existingLink.click_count = (existingLink.click_count || 0) + 1;
      } else {
        linksClicked.push({
          url: targetUrl,
          click_count: 1,
          first_click: now
        });
      }

      // Update tracking
      await base44.asServiceRole.entities.EmailTrackingEvent.update(event.id, {
        click_count: (event.click_count || 0) + 1,
        first_click_at: event.first_click_at || now,
        links_clicked: linksClicked,
        status: 'clicked',
        engagement_score: Math.min(100, (event.engagement_score || 0) + 30)
      });
    }

    // Redirect to actual URL
    return new Response(null, {
      status: 302,
      headers: { 'Location': targetUrl }
    });
  } catch (error) {
    console.error('Error recording email click:', error);
    // Redirect anyway on error
    const url = new URL(req.url);
    const targetUrl = url.searchParams.get('url');
    return new Response(null, {
      status: 302,
      headers: { 'Location': targetUrl || 'https://example.com' }
    });
  }
});