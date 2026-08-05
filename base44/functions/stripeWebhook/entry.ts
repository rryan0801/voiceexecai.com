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

    // Subscription status is queried live from Stripe by checkStripeSubscription,
    // so no entity writes are needed here — acknowledge the event and log it for
    // debugging/fulfillment tracking.
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        console.log('Checkout completed:', session.id, 'mode:', session.mode,
          'email:', session.customer_email || session.metadata?.user_email);
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object;
        console.log('Subscription event:', event.type, 'id:', sub.id, 'status:', sub.status);
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