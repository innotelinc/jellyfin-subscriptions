import { describe, expect, it } from 'vitest';

import {
  buildBillingPortalReturnUrl,
  hasStripeBillingPortalConfig,
} from '@/lib/stripe/billing-portal';

describe('billing portal helpers', () => {
  it('detects when the portal is fully configured', () => {
    expect(
      hasStripeBillingPortalConfig({
        stripeSecretKey: 'sk_test_123',
        appBaseUrl: 'https://subscribe.innotel.us',
      }),
    ).toBe(true);
  });

  it('requires both the Stripe secret key and app base URL', () => {
    expect(hasStripeBillingPortalConfig({ stripeSecretKey: undefined, appBaseUrl: 'https://x.test' })).toBe(false);
    expect(hasStripeBillingPortalConfig({ stripeSecretKey: 'sk_test_123', appBaseUrl: '' })).toBe(false);
  });

  it('builds a stable return URL for a customer returning from billing management', () => {
    expect(buildBillingPortalReturnUrl('https://subscribe.innotel.us/')).toBe(
      'https://subscribe.innotel.us/signup/success?manage=1',
    );
  });
});
