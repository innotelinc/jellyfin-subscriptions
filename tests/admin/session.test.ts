import { describe, expect, it } from 'vitest';

import {
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSessionToken,
  readAdminSessionToken,
} from '@/lib/admin-session';

describe('admin session tokens', () => {
  it('creates and validates a signed session token for the configured admin', async () => {
    const token = await createAdminSessionToken({
      password: 'secret',
      secret: 'session-secret',
      username: 'admin',
      now: 1_700_000_000_000,
    });

    await expect(
      readAdminSessionToken(token, {
        expectedPassword: 'secret',
        expectedUsername: 'admin',
        now: 1_700_000_000_000 + 60_000,
        secret: 'session-secret',
      }),
    ).resolves.toEqual({ username: 'admin' });
  });

  it('rejects tampered or mismatched session tokens', async () => {
    const token = await createAdminSessionToken({
      password: 'secret',
      secret: 'session-secret',
      username: 'admin',
      now: 1_700_000_000_000,
    });

    await expect(
      readAdminSessionToken(`${token}x`, {
        expectedPassword: 'secret',
        expectedUsername: 'admin',
        now: 1_700_000_000_000,
        secret: 'session-secret',
      }),
    ).resolves.toBeNull();

    await expect(
      readAdminSessionToken(token, {
        expectedPassword: 'new-secret',
        expectedUsername: 'admin',
        now: 1_700_000_000_000,
        secret: 'session-secret',
      }),
    ).resolves.toBeNull();
  });

  it('rejects expired session tokens', async () => {
    const issuedAt = 1_700_000_000_000;
    const token = await createAdminSessionToken({
      password: 'secret',
      secret: 'session-secret',
      username: 'admin',
      now: issuedAt,
    });

    await expect(
      readAdminSessionToken(token, {
        expectedPassword: 'secret',
        expectedUsername: 'admin',
        now: issuedAt + (ADMIN_SESSION_MAX_AGE_SECONDS + 5) * 1000,
        secret: 'session-secret',
      }),
    ).resolves.toBeNull();
  });
});
