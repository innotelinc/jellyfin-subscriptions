import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { ADMIN_AUTH_HEADER } from '@/lib/admin-session';
import { env, hasJfaAdminConfig } from '@/lib/env';
import { buildInvitePayload, createJfaInviteUrl, JfaClient } from '@/lib/jfa/client';
import { deliverInviteEmail } from '@/lib/notifications/invite-delivery';
import { hasSmtpConfig, sendInviteEmail } from '@/lib/notifications/mailer';
import { approveSignup, getSignupById, recordSignupEvent } from '@/lib/signups';

export async function POST(
  _request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const signup = await getSignupById(id);

  if (!signup || (signup.status !== 'pending_approval' && signup.status !== 'paid')) {
    redirect('/admin');
  }

  if (!hasJfaAdminConfig()) {
    redirect('/admin');
  }

  const approverEmail = (await headers()).get(ADMIN_AUTH_HEADER) ?? env.adminEmail;

  const client = new JfaClient({
    baseUrl: env.jfaBaseUrl,
    username: env.jfaAdminUsername!,
    password: env.jfaAdminPassword!,
  });

  const invite = await client.createInvite(
    buildInvitePayload({
      profile: env.jfaInviteProfile,
      label: `signup-${id}`,
      userLabel: env.jfaUserLabel,
    }),
  );

  if (!invite) {
    redirect('/admin');
  }

  const inviteUrl = createJfaInviteUrl(env.jfaBaseUrl, invite.code);
  await approveSignup({
    id,
    approverEmail,
    inviteCode: invite.code,
    inviteUrl,
  });

  const delivery = await deliverInviteEmail(
    {
      email: signup.user.email,
      inviteUrl,
    },
    {
      hasConfig: hasSmtpConfig,
      send: sendInviteEmail,
    },
  );

  if (!delivery.ok && !delivery.skipped) {
    await recordSignupEvent({
      signupId: id,
      type: 'invite_email_failed',
      payload: {
        email: signup.user.email,
        error: delivery.error,
      },
    });
  } else if (!delivery.skipped) {
    await recordSignupEvent({
      signupId: id,
      type: 'invite_email_sent',
      payload: {
        email: signup.user.email,
      },
    });
  }

  redirect('/admin');
}
