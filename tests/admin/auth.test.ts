import { describe, expect, it } from 'vitest';

import { buildBasicAuthHeader, isValidAdminBasicAuth } from '@/lib/admin-auth';

describe('admin basic auth', () => {
  it('accepts a matching username and password pair', () => {
    const header = buildBasicAuthHeader('admin', 'secret');

    expect(isValidAdminBasicAuth(header, 'admin', 'secret')).toBe(true);
  });

  it('rejects invalid or missing credentials', () => {
    expect(isValidAdminBasicAuth(null, 'admin', 'secret')).toBe(false);
    expect(isValidAdminBasicAuth('Basic bad', 'admin', 'secret')).toBe(false);
    expect(isValidAdminBasicAuth(buildBasicAuthHeader('admin', 'wrong'), 'admin', 'secret')).toBe(
      false,
    );
  });
});
