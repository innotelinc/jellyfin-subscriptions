import { NextResponse } from 'next/server';

import { ADMIN_SESSION_COOKIE_NAME } from '@/lib/admin-session';
import { env } from '@/lib/env';

function redirectUrl(path: string) {
  return new URL(path, env.appBaseUrl);
}

function shouldUseSecureCookies() {
  return env.appBaseUrl.startsWith('https://') || process.env.NODE_ENV === 'production';
}

export async function POST() {
  const response = NextResponse.redirect(redirectUrl('/admin/login'));
  response.cookies.set({
    expires: new Date(0),
    httpOnly: true,
    maxAge: 0,
    name: ADMIN_SESSION_COOKIE_NAME,
    path: '/',
    sameSite: 'lax',
    secure: shouldUseSecureCookies(),
    value: '',
  });
  return response;
}
