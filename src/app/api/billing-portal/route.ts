import { NextResponse } from 'next/server';
import { z } from 'zod';

import { env } from '@/lib/env';
import { findLatestSignupByEmail } from '@/lib/signups';
import {
  buildBillingPortalReturnUrl,
  hasStripeBillingPortalConfig,
} from '@/lib/stripe/billing-portal';
import { getStripeClient } from '@/lib/stripe';

const billingPortalSchema = z.object({
  email: z.email(),
});

export async function POST(request: Request) {
  const parsed = billingPortalSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ error: 'Please provide a valid email address.' }, { status: 400 });
  }

  if (!hasStripeBillingPortalConfig(env)) {
    return NextResponse.json(
      { error: 'Stripe billing portal is not configured yet.' },
      { status: 503 },
    );
  }

  const signup = await findLatestSignupByEmail(parsed.data.email);

  if (!signup?.stripeCustomerId) {
    return NextResponse.json(
      { error: 'No Stripe customer record was found for that email yet.' },
      { status: 404 },
    );
  }

  const stripe = getStripeClient();
  const session = await stripe.billingPortal.sessions.create({
    customer: signup.stripeCustomerId,
    return_url: buildBillingPortalReturnUrl(env.appBaseUrl),
  });

  return NextResponse.json({ url: session.url, signupId: signup.id });
}
