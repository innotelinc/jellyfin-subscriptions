import { describe, expect, it } from 'vitest';

import { buildInvitePayload } from '@/lib/jfa/client';

describe('buildInvitePayload', () => {
  it('creates a single-use invite payload for paid subscribers', () => {
    const payload = buildInvitePayload({
      profile: 'Subscriber',
      label: 'paid-subscription',
      userLabel: 'subscriber',
    });

    expect(payload['multiple-uses']).toBe(false);
    expect(payload['remaining-uses']).toBe(1);
    expect(payload['no-limit']).toBe(false);
    expect(payload.profile).toBe('Subscriber');
    expect(payload.user_label).toBe('subscriber');
  });

  it('can apply an account expiry window when requested', () => {
    const payload = buildInvitePayload({
      profile: 'Subscriber',
      label: 'trial',
      userLabel: 'trial-user',
      accountExpiry: { months: 1, days: 0, hours: 0, minutes: 0 },
      inviteLifetime: { months: 0, days: 2, hours: 0, minutes: 0 },
    });

    expect(payload['user-expiry']).toBe(true);
    expect(payload['user-months']).toBe(1);
    expect(payload.days).toBe(2);
  });
});
