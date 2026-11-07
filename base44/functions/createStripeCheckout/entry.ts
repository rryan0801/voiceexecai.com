import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import Stripe from 'npm:stripe@17.0.0';

// Owner rules (Richy, audit 2026-11-07):
// - Paid plans only. No free plan, no free trial.
// - ONE deal: "Special pricing for new members: 50% off your first 3 months.
//   We may end or change this offer at any time." No end date. The 50% is applied
//   HERE with Stripe coupon ACTNOW50X3 (50% off, repeating, 3 months). If the coupon
//   can't be applied, checkout is BLOCKED rather than charging full price.
// - Tip box: "Buy us a coffee" $5 / $10 / $25 only, fixed here on the server. A tip
//   never unlocks a plan (stripeWebhook ignores non-subscription sessions).
const DEAL_COUPON_ID = 'ACTNOW50X3';

// Only these plans can be bought online. Enterprise is set up by email (/contact).
const PLAN_PRICES: Record<string, string> = {
  'price_1TdNAuIcky2cOtqj5Yz6Xu82': 'Pro',
};

// Tip amounts in cents. Anything else is refused.
const TIP_AMOUNTS = new Set([500, 1000, 2500]);

async function dealCoupon(stripe: Stripe): Promise<string | null> {
  try {
    const c = await stripe.coupons.retrieve(DEAL_COUPON_ID);
    if (c?.valid && c.percent_off === 50 && c.duration === 'repeating' && c.duration_in_months === 3) return c.id;
    if (c) {
      console.error('Coupon ACTNOW50X3 exists but is not 50% / repeating / 3 months, or is invalid.');
      return null;
    }
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
    console.error('Deal coupon could not be made:', (e as Error).message);
    return null;
  }
}

async function isMonthlyPrice(stripe: Stripe, priceId: string): Promise<boolean> {
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
    let user: { email?: string } | null = null;
    try { user = await base44.auth.me(); } catch (_e) { user = null; }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string);
    const { price_id, mode = 'subscription', amount } = await req.json();
    const origin = req.headers.get('origin') || 'https://voiceexecai.com';

    // ---- Tip ("Buy us a coffee"): one-time payment, fixed amounts, signed-out is fine.
    if (mode === 'payment') {
      const cents = Math.round(Number(amount));
      if (!TIP_AMOUNTS.has(cents)) {
        return Response.json({ error: 'Tips are $5, $10 or $25.' }, { status: 400 });
      }
      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [{
          price_data: {
            currency: 'usd',
            unit_amount: cents,
            product_data: { name: 'Tip - Buy us a coffee (does not include a plan)' },
          },
          quantity: 1,
        }],
        mode: 'payment',
        success_url: `${origin}/checkout-success?session_id={CHECKOUT_SESSION_ID}&tip=true`,
        cancel_url: `${origin}/?tip=canceled`,
        metadata: {
          base44_app_id: Deno.env.get('BASE44_APP_ID') || '',
          type: 'tip',
          ...(user?.email ? { user_email: user.email } : {}),
        },
      });
      return Response.json({ url: session.url });
    }

    // ---- Subscription: must be signed in.
    if (!user?.email) {
      return Response.json({ error: 'Please sign in first.' }, { status: 401 });
    }
    const planName = PLAN_PRICES[price_id];
    if (!planName) {
      return Response.json({ error: 'That plan cannot be bought online. Email richy@voiceexecai.com.' }, { status: 400 });
    }

    // The advertised deal MUST be applied. If not, block checkout.
    const monthly = await isMonthlyPrice(stripe, price_id);
    const couponId = monthly ? await dealCoupon(stripe) : null;
    if (!couponId) {
      console.error('Checkout blocked: deal coupon could not be applied for', price_id);
      return Response.json({
        error: 'Checkout is paused for a moment because we could not apply your 50% new-member price. Please try again later or email richy@voiceexecai.com.',
        blocked: true,
      }, { status: 503 });
    }

    const meta = {
      base44_app_id: Deno.env.get('BASE44_APP_ID') || '',
      user_email: user.email,
      plan_name: planName,
      deal: 'actnow50x3',
    };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: price_id, quantity: 1 }],
      mode: 'subscription',
      discounts: [{ coupon: couponId }],
      success_url: `${origin}/checkout-success?session_id={CHECKOUT_SESSION_ID}&plan=${encodeURIComponent(planName)}`,
      cancel_url: `${origin}/pricing?canceled=true`,
      metadata: meta,
      client_reference_id: user.email,
      customer_email: user.email,
      subscription_data: { metadata: meta },
    });

    return Response.json({ url: session.url, deal: true });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return Response.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
});
