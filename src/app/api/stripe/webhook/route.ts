import { NextResponse } from 'next/server';
import Stripe from 'stripe';

import { env, hasJfaAdminConfig } from '@/lib/env';
import { JfaClient } from '@/lib/jfa/client';
import { applyStripeSubscriptionUpdate, markSignupPaidFromCheckoutSession } from '@/lib/signups';
import { shouldEnableJellyfinAccess } from '@/lib/provisioning/subscription-state';
import { getStripeClient } from '@/lib/stripe';

export async function POST(request: Request) {
  if (!env.stripeWebhookSecret || !env.stripeSecretKey) {
    return NextResponse.json(
      { error: 'Stripe webhook secrets are not configured.' },
      { status: 503 },
    );
  }

  const signature = request.headers.get('stripe-signature');
  if (!signature) {
    return NextResponse.json({ error: 'Missing stripe-signature header.' }, { status: 400 });
  }

  const body = await request.text();
  const stripe = getStripeClient();

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, signature, env.stripeWebhookSecret);
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Invalid webhook signature.' },
      { status: 400 },
    );
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const signup = await markSignupPaidFromCheckoutSession(session);
    return NextResponse.json({ received: true, type: event.type, signupId: signup?.id ?? null });
  }

  if (
    event.type === 'customer.subscription.created' ||
    event.type === 'customer.subscription.updated' ||
    event.type === 'customer.subscription.deleted'
  ) {
    const subscription = event.data.object as Stripe.Subscription;
    const signup = await applyStripeSubscriptionUpdate(subscription);

    if (signup?.jellyfinUserId && hasJfaAdminConfig()) {
      const client = new JfaClient({
        baseUrl: env.jfaBaseUrl,
        username: env.jfaAdminUsername!,
        password: env.jfaAdminPassword!,
      });

      await client.setUserEnabled(
        signup.jellyfinUserId,
        shouldEnableJellyfinAccess(subscription.status as never),
      );
    }

    return NextResponse.json({
      received: true,
      type: event.type,
      signupId: signup?.id ?? null,
      subscriptionStatus: subscription.status,
    });
  }

  return NextResponse.json({ received: true, type: event.type });
}
