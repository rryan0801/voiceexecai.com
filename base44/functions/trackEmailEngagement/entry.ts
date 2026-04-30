import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { prospect_id, client_id, email_id, subject, prospect_email } = await req.json();

    if (!prospect_id || !client_id || !email_id || !prospect_email) {
      return Response.json({ error: 'Missing required fields' }, { status: 400 });
    }

    // Create initial tracking record
    const trackingEvent = await base44.entities.EmailTrackingEvent.create({
      prospect_id,
      client_id,
      email_id,
      prospect_email,
      subject: subject || 'Tracked Email',
      sent_by: user.email,
      sent_at: new Date().toISOString(),
      open_count: 0,
      click_count: 0,
      engagement_score: 0,
      status: 'sent'
    });

    // Generate tracking pixel URL (mock implementation)
    const trackingPixelUrl = `${Deno.env.get('APP_URL')}/api/track/pixel/${email_id}`;
    const trackingClickUrl = `${Deno.env.get('APP_URL')}/api/track/click`;

    return Response.json({
      success: true,
      tracking_id: trackingEvent.id,
      email_id,
      prospect_email,
      tracking_pixel_url: trackingPixelUrl,
      tracking_click_url: trackingClickUrl,
      instructions: {
        pixel: 'Add this pixel to the end of your email body in an <img> tag',
        clicks: 'Wrap URLs in your email with the click tracking URL, appending ?url=YOUR_URL'
      }
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});