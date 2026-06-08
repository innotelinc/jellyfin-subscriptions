import type { SignupStatus, StripeSubscriptionStatus } from '@/lib/domain/signups';

export function shouldEnableJellyfinAccess(status: StripeSubscriptionStatus): boolean {
  return status === 'active' || status === 'trialing';
}

export function mapStripeStatusToSignupStatus(
  status: StripeSubscriptionStatus,
): SignupStatus {
  switch (status) {
    case 'active':
    case 'trialing':
      return 'activated';
    case 'past_due':
    case 'unpaid':
    case 'paused':
      return 'suspended';
    case 'canceled':
      return 'cancelled';
    case 'incomplete':
    default:
      return 'paid';
  }
}
