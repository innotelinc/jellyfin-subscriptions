import { describe, expect, it } from 'vitest';

import { buildInviteEmailMessage } from '@/lib/notifications/invite-email';

describe('buildInviteEmailMessage', () => {
  it('builds an approval email with the invite URL and support contact', () => {
    const message = buildInviteEmailMessage({
      email: 'subscriber@example.com',
      inviteUrl: 'https://accounts.innotel.us/invite/abc123',
      supportEmail: 'support@innotel.us',
      appName: 'Innotel Media',
    });

    expect(message.to).toBe('subscriber@example.com');
    expect(message.subject).toContain('Innotel Media');
    expect(message.text).toContain('https://accounts.innotel.us/invite/abc123');
    expect(message.text).toContain('support@innotel.us');
  });
});
