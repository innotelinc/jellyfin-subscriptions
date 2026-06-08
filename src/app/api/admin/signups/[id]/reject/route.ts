import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { z } from 'zod';

import { ADMIN_AUTH_HEADER } from '@/lib/admin-session';
import { env } from '@/lib/env';
import { getSignupById, rejectSignup } from '@/lib/signups';

const rejectSchema = z.object({
  reason: z.string().trim().min(1).optional(),
});

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const signup = await getSignupById(id);

  if (!signup) {
    return NextResponse.json({ error: 'Signup not found.' }, { status: 404 });
  }

  const body = rejectSchema.safeParse(await request.json().catch(() => ({})));
  const approverEmail = (await headers()).get(ADMIN_AUTH_HEADER) ?? env.adminEmail;

  await rejectSignup({
    id,
    approverEmail,
    reason: body.success ? body.data.reason : undefined,
  });

  return NextResponse.json({ rejected: true, signupId: id });
}
