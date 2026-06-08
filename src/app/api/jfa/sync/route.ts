import { NextResponse } from 'next/server';

import { env, hasJfaAdminConfig } from '@/lib/env';
import { JfaClient } from '@/lib/jfa/client';
import { reconcileInvites } from '@/lib/jfa/reconcile';

export async function POST() {
  if (!hasJfaAdminConfig()) {
    return NextResponse.json(
      { error: 'JFA admin credentials are not configured for sync.' },
      { status: 503 },
    );
  }

  const client = new JfaClient({
    baseUrl: env.jfaBaseUrl,
    username: env.jfaAdminUsername!,
    password: env.jfaAdminPassword!,
  });

  const invites = await client.listInvites();
  const users = await client.listUsers();
  const result = await reconcileInvites({ invites, users });

  return NextResponse.json({
    ok: true,
    inviteCount: invites.length,
    userCount: users.length,
    ...result,
  });
}
