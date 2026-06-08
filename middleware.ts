import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

import { isValidAdminBasicAuth, parseBasicAuthHeader } from '@/lib/admin-auth';
import {
  ADMIN_AUTH_HEADER,
  ADMIN_SESSION_COOKIE_NAME,
  getAdminSessionSecret,
  readAdminSessionToken,
} from '@/lib/admin-session';

async function getAuthenticatedAdminUsername(request: NextRequest): Promise<string | null> {
  const username = process.env.ADMIN_USERNAME;
  const password = process.env.ADMIN_PASSWORD;

  if (!username || !password) {
    return null;
  }

  const authorization = request.headers.get('authorization');
  if (isValidAdminBasicAuth(authorization, username, password)) {
    return parseBasicAuthHeader(authorization)?.username ?? username;
  }

  const session = await readAdminSessionToken(request.cookies.get(ADMIN_SESSION_COOKIE_NAME)?.value, {
    expectedPassword: password,
    expectedUsername: username,
    secret: getAdminSessionSecret(process.env.ADMIN_SESSION_SECRET, password) ?? '',
  });

  return session?.username ?? null;
}

export async function middleware(request: NextRequest) {
  const pathname = request.nextUrl.pathname;
  const protectedPath =
    pathname.startsWith('/admin') ||
    pathname.startsWith('/api/admin') ||
    pathname.startsWith('/api/jfa');

  if (!protectedPath) {
    return NextResponse.next();
  }

  if (pathname === '/admin/login') {
    const authenticatedUsername = await getAuthenticatedAdminUsername(request);

    if (authenticatedUsername && request.method === 'GET') {
      return NextResponse.redirect(new URL('/admin', request.url));
    }

    return NextResponse.next();
  }

  const authenticatedUsername = await getAuthenticatedAdminUsername(request);

  if (authenticatedUsername) {
    const requestHeaders = new Headers(request.headers);
    requestHeaders.set(ADMIN_AUTH_HEADER, authenticatedUsername);
    return NextResponse.next({ request: { headers: requestHeaders } });
  }

  if (pathname.startsWith('/admin') && request.method === 'GET') {
    const loginUrl = new URL('/admin/login', request.url);
    const next = `${pathname}${request.nextUrl.search}`;
    loginUrl.searchParams.set('next', next);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
}

export const config = {
  matcher: ['/admin/:path*', '/api/admin/:path*', '/api/jfa/:path*'],
};
