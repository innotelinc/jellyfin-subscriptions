import type { SignupStatus } from '@/lib/domain/signups';

export interface SignupStatusCopy {
  heading: string;
  body: string;
}

export function getSignupStatusCopy(status: string | null | undefined): SignupStatusCopy {
  switch (status as SignupStatus) {
    case 'invited':
      return {
        heading: 'Invite sent',
        body: 'Your approval is complete. Check your email for the account setup link.',
      };
    case 'activated':
      return {
        heading: 'Account active',
        body: 'Your Jellyfin account is active and ready to use.',
      };
    case 'rejected':
      return {
        heading: 'Request declined',
        body: 'This signup was rejected. Contact support if you think this was a mistake.',
      };
    case 'pending_approval':
    case 'paid':
      return {
        heading: 'Awaiting approval',
        body: 'Your payment was received and the request is queued for manual approval.',
      };
    default:
      return {
        heading: 'Request received',
        body: 'We have your signup request and will email you when the next step is ready.',
      };
  }
}
