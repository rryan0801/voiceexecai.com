import { createClientFromRequest } from 'npm:@base44/sdk@0.8.40';
import Stripe from 'npm:stripe@17.0.0';
import { secrets } from 'base44:runtime';

export default async function(req: Request): Promise<Response> {
  try {
    // Webhooks arrive without a user token — set up the base44 client (service
    // role context) before validating the Stripe signature.
    const base44 = createClientFromRequest(req);
    const stripe = new Stripe(secrets.get('STRIPE_SECRET_KEY'));

    const body = await req.text();
    const signature = req.headers.get('stripe-signature');
    const webhookSecret = secrets.get('STRIPE_WEBHOOK_SECRET');

    if (!signature || !webhookSecret) {
      console.error('Stripe webhook: missing signature or webhook secret');
      return Response.json({ error: 'Missing signature or secret' }, { status: 400 });
    }

    // Verify the event really came from Stripe. Web Crypto is async, so use
    // constructEventAsync — the synchronous constructEvent() throws.
    let event;
    try {
      event = await stripe.webhooks.constructEventAsync(body, signature, webhookSecret);
    } catch (err) {
      console.error('Stripe webhook signature verification failed:', err.message);
      return Response.json({ error: 'Invalid signature' }, { status: 400 });
    }

    console.log('Stripe webhook received:', event.type, 'id:', event.id);

    // Paid features check the admin-only Subscription entity, written ONLY here
    // (service role). Tips (mode 'payment') never create or change a plan.
    const Subs = base44.asServiceRole.entities.Subscription;
    const upsert = async (subscriptionId, data) => {
      const found = await Subs.filter({ stripe_subscription_id: subscriptionId });
      if (found.length > 0) await Subs.update(found[0].id, data);
      else if (data.user_email) await Subs.create({ stripe_subscription_id: subscriptionId, ...data });
    };
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        if (session.mode !== 'subscription' || !session.subscription) {
          console.log('Ignoring non-subscription checkout (e.g. a tip):', session.id);
          break;
        }
        const sub = await stripe.subscriptions.retrieve(session.subscription);
        await upsert(sub.id, {
          user_email: (session.metadata?.user_email || session.customer_email || session.client_reference_id || '').toLowerCase(),
          plan_name: session.metadata?.plan_name || 'Pro',
          status: sub.status,
          stripe_customer_id: String(sub.customer || ''),
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        });
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        console.log('Subscription event:', event.type, 'id:', sub.id, 'status:', sub.status);
        await upsert(sub.id, {
          ...(sub.metadata?.user_email ? { user_email: String(sub.metadata.user_email).toLowerCase() } : {}),
          ...(sub.metadata?.plan_name ? { plan_name: sub.metadata.plan_name } : {}),
          status: event.type === 'customer.subscription.deleted' ? 'canceled' : sub.status,
          stripe_customer_id: String(sub.customer || ''),
          current_period_end: new Date(sub.current_period_end * 1000).toISOString(),
        });
        break;
      }
      case 'invoice.paid': {
        console.log('Invoice paid:', event.data.object.id);
        break;
      }
      case 'invoice.payment_failed': {
        console.log('Invoice payment failed:', event.data.object.id);
        break;
      }
      default:
        console.log('Unhandled Stripe event type:', event.type);
    }

    return Response.json({ received: true });
  } catch (error) {
    console.error('Stripe webhook handler error:', error);
    return Response.json({ error: error.message }, { status: 500 });
  }
}