import { buildInvitePayload, createJfaInviteUrl } from '@/lib/jfa/client';

export function createMockInvite(baseUrl: string, profile = 'Subscriber') {
  const code = 'mock-invite-code';

  return {
    code,
    payload: buildInvitePayload({
      profile,
      label: 'mock-subscription',
      userLabel: 'subscriber',
    }),
    url: createJfaInviteUrl(baseUrl, code),
  };
}
