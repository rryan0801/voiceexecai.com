import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';
import Stripe from 'npm:stripe@17.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

    const { price_id, plan_name, coupon_code } = await req.json();

    if (!price_id) {
      return Response.json({ error: 'Price ID required' }, { status: 400 });
    }

    // Get base URL from origin header or use default
    const origin = req.headers.get('origin') || 'https://preview--voiceexecai-com.base44.app';
    
    // Build discounts array if coupon provided
    const discounts = coupon_code ? [{ coupon: coupon_code }] : [];
    
    // Create checkout session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      discounts: discounts,
      success_url: `${origin}/checkout-success?session_id={CHECKOUT_SESSION_ID}&plan=${encodeURIComponent(plan_name || 'Pro')}`,
      cancel_url: `${origin}/pricing?canceled=true`,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        user_email: user.email,
        plan_name: plan_name || 'unknown'
      },
      client_reference_id: user.email,
      subscription_data: {
        metadata: {
          base44_app_id: Deno.env.get("BASE44_APP_ID"),
          user_email: user.email
        }
      }
    });

    return Response.json({ url: session.url });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return Response.json({ 
      error: error.message,
      details: 'Failed to create checkout session'
    }, { status: 500 });
  }
});