export const ADMIN_SESSION_COOKIE_NAME = 'innotel_admin_session';
export const ADMIN_SESSION_MAX_AGE_SECONDS = 60 * 60 * 12;
export const ADMIN_AUTH_HEADER = 'x-admin-username';

interface AdminSessionPayload {
  exp: number;
  iat: number;
  u: string;
}

interface CreateAdminSessionTokenOptions {
  username: string;
  password: string;
  secret: string;
  now?: number;
}

interface ReadAdminSessionTokenOptions {
  expectedUsername: string;
  expectedPassword: string;
  secret: string;
  now?: number;
}

const encoder = new TextEncoder();
const decoder = new TextDecoder();

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  for (const byte of bytes) {
    binary += String.fromCharCode(byte);
  }

  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/g, '');
}

function fromBase64Url(value: string): Uint8Array {
  const base64 = value.replace(/-/g, '+').replace(/_/g, '/');
  const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, '=');
  const binary = atob(padded);
  return Uint8Array.from(binary, (char) => char.charCodeAt(0));
}

async function signTokenBody(
  body: string,
  options: { username: string; password: string; secret: string },
): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(options.secret),
    { hash: 'SHA-256', name: 'HMAC' },
    false,
    ['sign'],
  );
  const signature = await crypto.subtle.sign(
    'HMAC',
    key,
    encoder.encode(`${body}.${options.username}.${options.password}`),
  );
  return toBase64Url(new Uint8Array(signature));
}

function safeCompare(left: string, right: string): boolean {
  const leftBytes = encoder.encode(left);
  const rightBytes = encoder.encode(right);

  if (leftBytes.length !== rightBytes.length) {
    return false;
  }

  let mismatch = 0;
  for (let index = 0; index < leftBytes.length; index += 1) {
    mismatch |= leftBytes[index] ^ rightBytes[index];
  }

  return mismatch === 0;
}

export function getAdminSessionSecret(
  explicitSecret: string | undefined,
  adminPassword: string | undefined,
): string | undefined {
  return explicitSecret ?? adminPassword;
}

export async function createAdminSessionToken(options: CreateAdminSessionTokenOptions): Promise<string> {
  const issuedAt = Math.floor((options.now ?? Date.now()) / 1000);
  const payload: AdminSessionPayload = {
    exp: issuedAt + ADMIN_SESSION_MAX_AGE_SECONDS,
    iat: issuedAt,
    u: options.username,
  };
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
  const signature = await signTokenBody(body, options);
  return `${body}.${signature}`;
}

export async function readAdminSessionToken(
  token: string | undefined,
  options: ReadAdminSessionTokenOptions,
): Promise<{ username: string } | null> {
  if (!token || !options.secret) {
    return null;
  }

  const [body, signature] = token.split('.');
  if (!body || !signature) {
    return null;
  }

  const expectedSignature = await signTokenBody(body, {
    password: options.expectedPassword,
    secret: options.secret,
    username: options.expectedUsername,
  });

  if (!safeCompare(signature, expectedSignature)) {
    return null;
  }

  try {
    const payload = JSON.parse(decoder.decode(fromBase64Url(body))) as Partial<AdminSessionPayload>;
    const now = Math.floor((options.now ?? Date.now()) / 1000);

    if (
      typeof payload.u !== 'string' ||
      payload.u !== options.expectedUsername ||
      typeof payload.exp !== 'number' ||
      now >= payload.exp
    ) {
      return null;
    }

    return { username: payload.u };
  } catch {
    return null;
  }
}

export function isSafeAdminRedirect(next: string | null | undefined): boolean {
  return Boolean(next && next.startsWith('/admin') && !next.startsWith('//'));
}
