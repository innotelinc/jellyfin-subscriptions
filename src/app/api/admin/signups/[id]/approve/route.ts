import { headers } from 'next/headers';
import { NextResponse } from 'next/server';

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

  if (!signup) {
    return NextResponse.json({ error: 'Signup not found.' }, { status: 404 });
  }

  if (signup.status !== 'pending_approval' && signup.status !== 'paid') {
    return NextResponse.json(
      { error: `Signup is not awaiting approval (current status: ${signup.status}).` },
      { status: 409 },
    );
  }

  if (!hasJfaAdminConfig()) {
    return NextResponse.json(
      { error: 'JFA admin credentials are not configured for approval.' },
      { status: 503 },
    );
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
    return NextResponse.json(
      { error: 'JFA invite was created but could not be discovered after creation.' },
      { status: 502 },
    );
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

  return NextResponse.json({
    approved: true,
    inviteCode: invite.code,
    inviteUrl,
    inviteEmail: delivery,
  });
}
