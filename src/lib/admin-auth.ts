import { Buffer } from 'node:buffer';

export interface AdminCredentials {
  username: string;
  password: string;
}

export function buildBasicAuthHeader(username: string, password: string): string {
  return `Basic ${Buffer.from(`${username}:${password}`).toString('base64')}`;
}

export function parseBasicAuthHeader(headerValue: string | null): AdminCredentials | null {
  if (!headerValue || !headerValue.startsWith('Basic ')) {
    return null;
  }

  try {
    const decoded = Buffer.from(headerValue.slice(6), 'base64').toString('utf8');
    const separator = decoded.indexOf(':');
    if (separator === -1) {
      return null;
    }

    return {
      username: decoded.slice(0, separator),
      password: decoded.slice(separator + 1),
    };
  } catch {
    return null;
  }
}

export function isValidAdminBasicAuth(
  headerValue: string | null,
  expectedUsername: string | undefined,
  expectedPassword: string | undefined,
): boolean {
  if (!expectedUsername || !expectedPassword) {
    return false;
  }

  const parsed = parseBasicAuthHeader(headerValue);
  return Boolean(
    parsed && parsed.username === expectedUsername && parsed.password === expectedPassword,
  );
}
