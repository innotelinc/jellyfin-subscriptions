import type { JfaInviteRecord, JfaUserRecord } from '@/lib/jfa/types';
import { getSignupById, listAdminSignups, markSignupActivated } from '@/lib/signups';

export async function reconcileInvites(input: {
  invites: JfaInviteRecord[];
  users: JfaUserRecord[];
}) {
  const signups = await listAdminSignups();
  let activatedCount = 0;

  for (const signup of signups) {
    if (!signup.jfaInviteCode || signup.status === 'activated') {
      continue;
    }

    const invite = input.invites.find((candidate) => candidate.code === signup.jfaInviteCode);
    const usedByEntries = invite?.used_by ? Object.keys(invite.used_by) : [];

    if (usedByEntries.length === 0) {
      continue;
    }

    const jellyfinUsername = usedByEntries[0];
    const matchedUser = input.users.find((user) => user.name === jellyfinUsername);

    await markSignupActivated({
      id: signup.id,
      jellyfinUsername,
      jellyfinUserId: matchedUser?.id,
    });
    activatedCount += 1;
  }

  return {
    activatedCount,
    inspected: signups.length,
  };
}

export async function getSignupSummary(id: string) {
  return getSignupById(id);
}
