import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import Stripe from 'npm:stripe@17.0.0';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY"));

    const {
      price_id,
      plan_name,
      coupon_code,
      mode = 'subscription',
      amount,
      tip_name,
      trial_days,
    } = await req.json();

    const origin = req.headers.get('origin') || 'https://voiceexecai.com';

    // One-time payment (e.g., a Tip). Never use "Support" or "Donate".
    if (mode === 'payment') {
      if (!amount) {
        return Response.json({ error: 'Amount required for one-time payment' }, { status: 400 });
      }
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'usd',
              unit_amount: Math.round(Number(amount)),
              product_data: { name: tip_name || 'Tip' },
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${origin}/checkout-success?session_id={CHECKOUT_SESSION_ID}&tip=true`,
        cancel_url: `${origin}/pricing?canceled=true`,
        metadata: {
          base44_app_id: Deno.env.get("BASE44_APP_ID"),
          user_email: user.email,
          type: 'tip',
        },
        client_reference_id: user.email,
      });
      return Response.json({ url: session.url });
    }

    // Subscription
    if (!price_id) {
      return Response.json({ error: 'Price ID required' }, { status: 400 });
    }

    const discounts = coupon_code ? [{ coupon: coupon_code }] : [];

    const subscriptionData = {
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        user_email: user.email,
      },
      ...(trial_days && Number(trial_days) > 0
        ? { trial_period_days: Number(trial_days) }
        : {}),
    };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      discounts,
      success_url: `${origin}/checkout-success?session_id={CHECKOUT_SESSION_ID}&plan=${encodeURIComponent(plan_name || 'Pro')}`,
      cancel_url: `${origin}/pricing?canceled=true`,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        user_email: user.email,
        plan_name: plan_name || 'unknown',
      },
      client_reference_id: user.email,
      subscription_data: subscriptionData,
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