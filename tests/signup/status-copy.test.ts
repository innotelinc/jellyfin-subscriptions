import { describe, expect, it } from 'vitest';

import { getSignupStatusCopy } from '@/lib/signup-status-copy';

describe('getSignupStatusCopy', () => {
  it('returns the right headline and guidance for invited customers', () => {
    const copy = getSignupStatusCopy('invited');

    expect(copy.heading).toContain('Invite');
    expect(copy.body).toContain('email');
  });

  it('returns a fallback message for unknown states', () => {
    const copy = getSignupStatusCopy('something-else');

    expect(copy.heading).toContain('Request received');
  });
});
