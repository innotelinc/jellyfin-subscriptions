import { describe, expect, it } from 'vitest';

import { getCurrentPeriodEndDate } from '@/lib/stripe/subscription-period-end';

describe('getCurrentPeriodEndDate', () => {
  it('returns a Date when Stripe provides a current period end', () => {
    const date = getCurrentPeriodEndDate({
      items: {
        data: [
          {
            current_period_end: 1_800_000_000,
          },
        ],
      },
    });

    expect(date?.toISOString()).toBe('2027-01-15T08:00:00.000Z');
  });

  it('returns null when the subscription has no current period end data', () => {
    expect(getCurrentPeriodEndDate({ items: { data: [] } })).toBeNull();
  });
});
