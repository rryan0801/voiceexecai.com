import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@17.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user || user.role !== 'admin') {
      return Response.json({ error: 'Unauthorized' }, { status: 403 });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

    // Create a 100% off coupon
    const coupon = await stripe.coupons.create({
      percent_off: 100,
      duration: 'repeating',
      duration_in_months: 1,
      id: `FULLOFF-${Date.now()}`
    });

    console.log('Coupon created:', coupon.id);
    return Response.json({ coupon_code: coupon.id, percent_off: coupon.percent_off });
  } catch (error) {
    console.error('Coupon creation error:', error);
    return Response.json({ 
      error: error.message,
      details: 'Failed to create coupon'
    }, { status: 500 });
  }
});