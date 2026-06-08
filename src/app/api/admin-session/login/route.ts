import { NextResponse } from 'next/server';

import {
  ADMIN_SESSION_COOKIE_NAME,
  ADMIN_SESSION_MAX_AGE_SECONDS,
  createAdminSessionToken,
  getAdminSessionSecret,
  isSafeAdminRedirect,
} from '@/lib/admin-session';
import { env, hasAdminBasicAuthConfig } from '@/lib/env';

function redirectUrl(path: string) {
  return new URL(path, env.appBaseUrl);
}

function shouldUseSecureCookies() {
  return env.appBaseUrl.startsWith('https://') || process.env.NODE_ENV === 'production';
}

export async function POST(request: Request) {
  const formData = await request.formData();
  const username = formData.get('username');
  const password = formData.get('password');
  const next = formData.get('next');

  const redirectTarget = typeof next === 'string' && isSafeAdminRedirect(next) ? next : '/admin';

  if (!hasAdminBasicAuthConfig()) {
    return NextResponse.redirect(redirectUrl('/admin/login?error=config'));
  }

  if (username !== env.adminUsername || password !== env.adminPassword) {
    const errorUrl = redirectUrl('/admin/login?error=invalid');
    if (typeof next === 'string' && isSafeAdminRedirect(next)) {
      errorUrl.searchParams.set('next', next);
    }
    return NextResponse.redirect(errorUrl);
  }

  const response = NextResponse.redirect(redirectUrl(redirectTarget));
  response.cookies.set({
    httpOnly: true,
    maxAge: ADMIN_SESSION_MAX_AGE_SECONDS,
    name: ADMIN_SESSION_COOKIE_NAME,
    path: '/',
    sameSite: 'lax',
    secure: shouldUseSecureCookies(),
    value: await createAdminSessionToken({
      password: env.adminPassword!,
      secret: getAdminSessionSecret(env.adminSessionSecret, env.adminPassword) ?? env.adminPassword!,
      username: env.adminUsername!,
    }),
  });
  return response;
}
