import Stripe from 'stripe';

import { env } from '@/lib/env';

export type BillingInterval = 'monthly' | 'yearly';

export function getStripeClient(): Stripe {
  if (!env.stripeSecretKey) {
    throw new Error('STRIPE_SECRET_KEY is not configured');
  }

  return new Stripe(env.stripeSecretKey);
}

export function getPriceId(interval: BillingInterval): string {
  if (interval === 'yearly') {
    return env.stripePriceIdYearly ?? env.stripePriceIdMonthly ?? 'price_missing';
  }

  return env.stripePriceIdMonthly ?? 'price_missing';
}
