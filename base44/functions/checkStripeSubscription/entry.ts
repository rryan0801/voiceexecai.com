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

    // Get customer by email
    const customers = await stripe.customers.list({
      email: user.email,
      limit: 1
    });

    if (customers.data.length === 0) {
      return Response.json({ 
        subscribed: false,
        message: 'No active subscription found'
      });
    }

    const customer = customers.data[0];

    // Get subscriptions
    const subscriptions = await stripe.subscriptions.list({
      customer: customer.id,
      status: 'active',
      limit: 1
    });

    if (subscriptions.data.length === 0) {
      return Response.json({ 
        subscribed: false,
        message: 'No active subscription found'
      });
    }

    const subscription = subscriptions.data[0];
    const plan = subscription.items.data[0].plan;

    return Response.json({
      subscribed: true,
      plan_name: plan.product.toString(),
      status: subscription.status,
      current_period_end: new Date(subscription.current_period_end * 1000).toISOString(),
      cancel_at_period_end: subscription.cancel_at_period_end
    });
  } catch (error) {
    console.error('Stripe subscription check error:', error);
    return Response.json({ 
      error: error.message,
      subscribed: false
    }, { status: 500 });
  }
});