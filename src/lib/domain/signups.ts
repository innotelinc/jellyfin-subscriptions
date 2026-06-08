export const signupStatuses = [
  'started',
  'checkout_pending',
  'paid',
  'pending_approval',
  'approved',
  'invited',
  'activated',
  'suspended',
  'cancelled',
  'rejected',
] as const;

export type SignupStatus = (typeof signupStatuses)[number];

export const stripeSubscriptionStatuses = [
  'incomplete',
  'trialing',
  'active',
  'past_due',
  'unpaid',
  'canceled',
  'paused',
] as const;

export type StripeSubscriptionStatus = (typeof stripeSubscriptionStatuses)[number];
