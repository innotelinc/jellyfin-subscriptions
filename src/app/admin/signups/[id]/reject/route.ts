import { headers } from 'next/headers';
import { redirect } from 'next/navigation';

import { ADMIN_AUTH_HEADER } from '@/lib/admin-session';
import { env } from '@/lib/env';
import { getSignupById, rejectSignup } from '@/lib/signups';

export async function POST(
  request: Request,
  context: { params: Promise<{ id: string }> },
) {
  const { id } = await context.params;
  const signup = await getSignupById(id);

  if (!signup) {
    redirect('/admin');
  }

  const formData = await request.formData();
  const reasonValue = formData.get('reason');
  const reason = typeof reasonValue === 'string' && reasonValue.trim() !== '' ? reasonValue : undefined;

  const approverEmail = (await headers()).get(ADMIN_AUTH_HEADER) ?? env.adminEmail;

  await rejectSignup({
    id,
    approverEmail,
    reason,
  });

  redirect('/admin');
}
