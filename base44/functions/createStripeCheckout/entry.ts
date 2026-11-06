import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import Stripe from 'npm:stripe@17.0.0';

// Act-now deal (Richy, 2026-11-04): 50% off the first 3 months of any monthly plan.
// No end date is shown to visitors (the site says it can end at any time without
// notice). DEAL_ENDS_AT is a hidden backstop; to end early, set it to a past time
// here AND in src/lib/actNowDeal.js, then publish.
const DEAL_ENDS_AT = Date.parse('2026-11-16T05:59:59Z');
const DEAL_COUPON_ID = 'ACTNOW50X3';

async function dealCoupon(stripe) {
  try {
    const c = await stripe.coupons.retrieve(DEAL_COUPON_ID);
    if (c?.valid) return c.id;
  } catch (_e) { /* not found: create below */ }
  try {
    const c = await stripe.coupons.create({
      id: DEAL_COUPON_ID,
      percent_off: 50,
      duration: 'repeating',
      duration_in_months: 3,
      name: '50% off your first 3 months',
    });
    return c?.id || null;
  } catch (e) {
    console.error('Deal coupon could not be made:', e.message);
    return null;
  }
}

async function isMonthlyPrice(stripe, priceId) {
  try {
    const p = await stripe.prices.retrieve(priceId);
    return p?.recurring?.interval === 'month' && (p.recurring.interval_count || 1) === 1;
  } catch (_e) {
    return false;
  }
}

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

    // SECURITY (2026-11-04): a coupon sent from the browser is never applied. The pricing
    // page used to send a 100%-off code (FULLOFF-...) with every checkout, which could
    // make subscriptions free. Customers can still type a real promotion code on Stripe's
    // own checkout page (allow_promotion_codes below); Stripe checks those itself.
    void coupon_code;
    // No free trials (Richy, 2026-11-06): subscriptions are charged from day one.

    // Act-now deal: monthly plans only, while on.
    const dealCouponId = Date.now() <= DEAL_ENDS_AT && await isMonthlyPrice(stripe, price_id)
      ? await dealCoupon(stripe)
      : null;

    const subscriptionData = {
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        user_email: user.email,
      },
    };

    const buildSession = (withDeal) => stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: price_id,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      ...(withDeal ? { discounts: [{ coupon: dealCouponId }] } : { allow_promotion_codes: true }),
      success_url: `${origin}/checkout-success?session_id={CHECKOUT_SESSION_ID}&plan=${encodeURIComponent(plan_name || 'Pro')}`,
      cancel_url: `${origin}/pricing?canceled=true`,
      metadata: {
        base44_app_id: Deno.env.get("BASE44_APP_ID"),
        user_email: user.email,
        plan_name: plan_name || 'unknown',
        ...(withDeal ? { deal: 'actnow50x3' } : {}),
      },
      client_reference_id: user.email,
      subscription_data: subscriptionData,
    });

    let session = null;
    let deal = false;
    if (dealCouponId) {
      try {
        session = await buildSession(true);
        deal = true;
      } catch (e) {
        console.error('Deal checkout failed, falling back to normal checkout:', e.message);
      }
    }
    if (!session) session = await buildSession(false);

    return Response.json({ url: session.url, deal });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return Response.json({
      error: error.message,
      details: 'Failed to create checkout session'
    }, { status: 500 });
  }
});