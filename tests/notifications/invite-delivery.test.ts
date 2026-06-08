import { describe, expect, it, vi } from 'vitest';

import { deliverInviteEmail } from '@/lib/notifications/invite-delivery';

describe('deliverInviteEmail', () => {
  it('reports skipped when SMTP is not configured', async () => {
    const result = await deliverInviteEmail(
      {
        email: 'user@example.com',
        inviteUrl: 'https://accounts.innotel.us/invite/abc',
      },
      {
        hasConfig: () => false,
        send: vi.fn(),
      },
    );

    expect(result).toEqual({ ok: true, skipped: true });
  });

  it('captures send failures instead of throwing', async () => {
    const result = await deliverInviteEmail(
      {
        email: 'user@example.com',
        inviteUrl: 'https://accounts.innotel.us/invite/abc',
      },
      {
        hasConfig: () => true,
        send: vi.fn().mockRejectedValue(new Error('smtp down')),
      },
    );

    expect(result.ok).toBe(false);
    expect(result.skipped).toBe(false);
    expect(result.error).toContain('smtp down');
  });
});
