import { describe, expect, it } from 'vitest';

import {
  mapStripeStatusToSignupStatus,
  shouldEnableJellyfinAccess,
} from '@/lib/provisioning/subscription-state';

describe('subscription-state mapping', () => {
  it('keeps active subscriptions enabled', () => {
    expect(shouldEnableJellyfinAccess('active')).toBe(true);
    expect(mapStripeStatusToSignupStatus('active')).toBe('activated');
  });

  it('suspends access for delinquent subscriptions', () => {
    expect(shouldEnableJellyfinAccess('past_due')).toBe(false);
    expect(shouldEnableJellyfinAccess('unpaid')).toBe(false);
    expect(mapStripeStatusToSignupStatus('past_due')).toBe('suspended');
  });

  it('marks canceled subscriptions as cancelled', () => {
    expect(shouldEnableJellyfinAccess('canceled')).toBe(false);
    expect(mapStripeStatusToSignupStatus('canceled')).toBe('cancelled');
  });
});
