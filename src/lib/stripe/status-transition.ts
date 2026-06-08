import type { SignupStatus, StripeSubscriptionStatus } from '@/lib/domain/signups';

export function deriveNextSignupStatusFromStripe(
  currentStatus: SignupStatus,
  subscriptionStatus: StripeSubscriptionStatus,
): SignupStatus {
  switch (subscriptionStatus) {
    case 'canceled':
      return 'cancelled';
    case 'past_due':
    case 'unpaid':
    case 'paused':
      return 'suspended';
    case 'active':
    case 'trialing':
      if (currentStatus === 'checkout_pending' || currentStatus === 'paid') {
        return 'pending_approval';
      }
      return currentStatus;
    case 'incomplete':
    default:
      return currentStatus === 'checkout_pending' ? 'paid' : currentStatus;
  }
}
