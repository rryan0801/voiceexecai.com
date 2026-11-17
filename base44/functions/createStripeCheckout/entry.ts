import { createClientFromRequest } from 'npm:@base44/sdk@0.8.38';
import Stripe from 'npm:stripe@17.0.0';

// Owner rules (Richy, audit 2026-11-07):
// - Paid plans only. No free plan, no free trial.
// - ONE deal: "Special pricing for new members: 50% off your first 3 months.
//   We may end or change this offer at any time." First-time members only. No end date. The 50% is applied
//   HERE with Stripe coupon ACTNOW50X3 (50% off, repeating, 3 months). If the coupon
//   can't be applied, checkout is BLOCKED rather than charging full price.
// - Tip box: "Buy us a coffee" $5 / $10 / $25 only, fixed here on the server. A tip
//   never unlocks a plan (stripeWebhook ignores non-subscription sessions).
const DEAL_COUPON_ID = 'ACTNOW50X3';

// Only these plans can be bought online. Enterprise is set up by email (/contact).
const PLAN_PRICES: Record<string, string> = {
  'price_1TdNAuIcky2cOtqj5Yz6Xu82': 'Pro',
};

// What the site shows for each plan, in cents per month (src/lib/plans.js). If the Stripe
// price ever differs from what the page shows, checkout is BLOCKED (ready-to-sell 2026-11-17).
const PLAN_CENTS: Record<string, number> = {
  'price_1TdNAuIcky2cOtqj5Yz6Xu82': 4900,
};

// Return URLs always point at the real site, never at a preview or a spoofed Origin header.
const SITE = 'https://voiceexecai.com';
const ALLOWED_ORIGINS = new Set(['https://voiceexecai.com', 'https://www.voiceexecai.com']);

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

// Server-side price check: the Stripe price must be active, USD, monthly and exactly
// the amount the page shows.
async function priceMatchesPage(stripe: Stripe, priceId: string): Promise<boolean> {
  try {
    const p = await stripe.prices.retrieve(priceId);
    return !!p?.active
      && p.currency === 'usd'
      && p.unit_amount === PLAN_CENTS[priceId]
      && p?.recurring?.interval === 'month'
      && (p.recurring.interval_count || 1) === 1;
  } catch (_e) {
    return false;
  }
}

// The new-member deal is for FIRST-TIME members only. Anyone who has ever had a
// VoiceExecAI plan (any status, including canceled) pays the regular price.
async function isFirstTimeMember(base44: any, stripe: Stripe, email: string): Promise<boolean> {
  const e = email.toLowerCase();
  try {
    const subs = await base44.asServiceRole.entities.Subscription.filter({ user_email: e });
    if (subs.length > 0) return false;
  } catch (_e) { /* fall through to Stripe */ }
  const customers = await stripe.customers.list({ email: e, limit: 10 });
  for (const cu of customers.data) {
    for (const priceId of Object.keys(PLAN_PRICES)) {
      const s = await stripe.subscriptions.list({ customer: cu.id, status: 'all', price: priceId, limit: 1 });
      if (s.data.length > 0) return false;
    }
  }
  return true;
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    let user: { email?: string } | null = null;
    try { user = await base44.auth.me(); } catch (_e) { user = null; }

    const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY') as string);
    const { price_id, mode = 'subscription', amount } = await req.json();
    const reqOrigin = req.headers.get('origin') || '';
    const origin = ALLOWED_ORIGINS.has(reqOrigin) ? reqOrigin : SITE;

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

    // The page price MUST match what Stripe will charge. If not, block checkout.
    if (!(await priceMatchesPage(stripe, price_id))) {
      console.error('Checkout blocked: Stripe price does not match the page price for', price_id);
      return Response.json({
        error: 'Checkout is paused because our price setup needs a check. Please email richy@voiceexecai.com.',
        blocked: true,
      }, { status: 503 });
    }

    // Already on a plan? Don't sell a second one.
    try {
      const mine = await base44.asServiceRole.entities.Subscription.filter({ user_email: user.email.toLowerCase() });
      if (mine.some((s: any) => ['active', 'past_due', 'trialing'].includes(s.status))) {
        return Response.json({ error: 'You already have a VoiceExecAI plan. Open your dashboard, or email richy@voiceexecai.com to change it.' }, { status: 409 });
      }
    } catch (_e) { /* no record: carry on */ }

    // Returning members pay the regular price (deal is first-time members only).
    let firstTime = false;
    try {
      firstTime = await isFirstTimeMember(base44, stripe, user.email);
    } catch (e) {
      console.error('First-time check failed:', (e as Error).message);
      return Response.json({ error: 'Could not start checkout. Please try again in a minute.' }, { status: 503 });
    }

    // For a first-time member the advertised deal MUST be applied. If not, block checkout.
    const couponId = firstTime ? await dealCoupon(stripe) : null;
    if (firstTime && !couponId) {
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
      deal: firstTime ? 'actnow50x3' : 'none_returning_member',
    };

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: price_id, quantity: 1 }],
      mode: 'subscription',
      ...(couponId ? { discounts: [{ coupon: couponId }] } : {}),
      success_url: `${origin}/checkout-success?session_id={CHECKOUT_SESSION_ID}&plan=${encodeURIComponent(planName)}`,
      cancel_url: `${origin}/pricing?canceled=true`,
      metadata: meta,
      client_reference_id: user.email,
      customer_email: user.email,
      subscription_data: { metadata: meta },
    });

    return Response.json({ url: session.url, deal: !!couponId });
  } catch (error) {
    console.error('Stripe checkout error:', error);
    return Response.json({ error: 'Failed to create checkout session' }, { status: 500 });
  }
});
