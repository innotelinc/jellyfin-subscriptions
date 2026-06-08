import { describe, expect, it } from 'vitest';

import { getPlanDetails } from '@/lib/signups';

describe('getPlanDetails', () => {
  it('returns the correct price id and label for monthly plans', () => {
    const details = getPlanDetails('monthly', {
      monthly: 'price_monthly',
      yearly: 'price_yearly',
    });

    expect(details.interval).toBe('monthly');
    expect(details.priceId).toBe('price_monthly');
    expect(details.label).toBe('Monthly');
  });

  it('falls back to the monthly price when yearly is not configured', () => {
    const details = getPlanDetails('yearly', {
      monthly: 'price_monthly',
      yearly: undefined,
    });

    expect(details.priceId).toBe('price_monthly');
    expect(details.interval).toBe('yearly');
  });
});
