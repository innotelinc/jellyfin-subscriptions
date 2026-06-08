import { describe, expect, it } from 'vitest';

import { deriveNextSignupStatusFromStripe } from '@/lib/stripe/status-transition';

describe('deriveNextSignupStatusFromStripe', () => {
  it('keeps paid signups pending approval after successful payment', () => {
    expect(deriveNextSignupStatusFromStripe('checkout_pending', 'active')).toBe('pending_approval');
    expect(deriveNextSignupStatusFromStripe('paid', 'active')).toBe('pending_approval');
  });

  it('keeps approved accounts activated while billing is healthy', () => {
    expect(deriveNextSignupStatusFromStripe('approved', 'active')).toBe('approved');
    expect(deriveNextSignupStatusFromStripe('invited', 'active')).toBe('invited');
    expect(deriveNextSignupStatusFromStripe('activated', 'active')).toBe('activated');
  });

  it('suspends or cancels access on billing problems', () => {
    expect(deriveNextSignupStatusFromStripe('activated', 'past_due')).toBe('suspended');
    expect(deriveNextSignupStatusFromStripe('invited', 'unpaid')).toBe('suspended');
    expect(deriveNextSignupStatusFromStripe('activated', 'canceled')).toBe('cancelled');
  });
});
