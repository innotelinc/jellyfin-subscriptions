import { NextResponse } from 'next/server';
import { z } from 'zod';

import { env, hasStripeCheckoutConfig } from '@/lib/env';
import { createSignupForCheckout, attachCheckoutSessionToSignup, getPlanDetails } from '@/lib/signups';
import { getStripeClient } from '@/lib/stripe';

const checkoutSchema = z.object({
  email: z.email(),
  plan: z.enum(['monthly', 'yearly']),
});

export async function POST(request: Request) {
  const parsed = checkoutSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Please provide a valid email and plan.' },
      { status: 400 },
    );
  }

  if (!hasStripeCheckoutConfig()) {
    return NextResponse.json(
      {
        error:
          'Stripe is not configured yet. Add STRIPE_SECRET_KEY and STRIPE_PRICE_ID_MONTHLY to continue.',
      },
      { status: 503 },
    );
  }

  const signup = await createSignupForCheckout(parsed.data);
  const plan = getPlanDetails(parsed.data.plan, {
    monthly: env.stripePriceIdMonthly!,
    yearly: env.stripePriceIdYearly,
  });

  const stripe = getStripeClient();
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: parsed.data.email,
    line_items: [{ price: plan.priceId, quantity: 1 }],
    success_url: `${env.appBaseUrl}/signup/success?session_id={CHECKOUT_SESSION_ID}&email=${encodeURIComponent(parsed.data.email)}&status=pending_approval`,
    cancel_url: `${env.appBaseUrl}/`,
    metadata: {
      signupId: signup.id,
      source: 'public-subscription-page',
      requestedPlan: parsed.data.plan,
    },
  });

  await attachCheckoutSessionToSignup({
    signupId: signup.id,
    checkoutSessionId: session.id,
    stripeCustomerId: typeof session.customer === 'string' ? session.customer : session.customer?.id,
  });

  return NextResponse.json({ signupId: signup.id, url: session.url });
}
