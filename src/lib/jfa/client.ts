import { Buffer } from 'node:buffer';

import type {
  DurationWindow,
  JfaInvitePayload,
  JfaInviteRecord,
  JfaTokenResponse,
  JfaUserRecord,
} from '@/lib/jfa/types';

const defaultInviteLifetime: DurationWindow = {
  months: 7,
  days: 0,
  hours: 0,
  minutes: 0,
};

const zeroDuration: DurationWindow = {
  months: 0,
  days: 0,
  hours: 0,
  minutes: 0,
};

export function buildInvitePayload(input: {
  profile: string;
  label: string;
  userLabel: string;
  inviteLifetime?: DurationWindow;
  accountExpiry?: DurationWindow;
}): JfaInvitePayload {
  const inviteLifetime = input.inviteLifetime ?? defaultInviteLifetime;
  const accountExpiry = input.accountExpiry ?? zeroDuration;
  const hasAccountExpiry = Object.values(accountExpiry).some((value) => value > 0);

  return {
    months: inviteLifetime.months,
    days: inviteLifetime.days,
    hours: inviteLifetime.hours,
    minutes: inviteLifetime.minutes,
    'user-expiry': hasAccountExpiry,
    'user-months': accountExpiry.months,
    'user-days': accountExpiry.days,
    'user-hours': accountExpiry.hours,
    'user-minutes': accountExpiry.minutes,
    'multiple-uses': false,
    'remaining-uses': 1,
    'no-limit': false,
    profile: input.profile,
    label: input.label,
    user_label: input.userLabel,
  };
}

export function createJfaInviteUrl(baseUrl: string, inviteCode: string): string {
  return `${baseUrl.replace(/\/$/, '')}/invite/${inviteCode}`;
}

export class JfaClient {
  constructor(
    private readonly config: {
      baseUrl: string;
      username: string;
      password: string;
    },
  ) {}

  private get apiBaseUrl(): string {
    return this.config.baseUrl.replace(/\/$/, '');
  }

  async login(): Promise<string> {
    const basic = Buffer.from(`${this.config.username}:${this.config.password}`).toString('base64');

    const response = await fetch(`${this.apiBaseUrl}/token/login`, {
      headers: {
        Authorization: `Basic ${basic}`,
      },
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`JFA login failed with status ${response.status}`);
    }

    const data = (await response.json()) as JfaTokenResponse;
    return data.token;
  }

  async createInvite(payload: JfaInvitePayload): Promise<JfaInviteRecord | null> {
    const token = await this.login();
    const before = await this.listInvites(token);

    const response = await fetch(`${this.apiBaseUrl}/invites`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`JFA invite creation failed with status ${response.status}`);
    }

    const after = await this.listInvites(token);
    return after.find((invite) => !before.some((existing) => existing.code === invite.code)) ?? null;
  }

  async listInvites(token?: string): Promise<JfaInviteRecord[]> {
    const bearer = token ?? (await this.login());
    const response = await fetch(`${this.apiBaseUrl}/invites`, {
      headers: {
        Authorization: `Bearer ${bearer}`,
      },
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`JFA invite lookup failed with status ${response.status}`);
    }

    const data = (await response.json()) as { invites: JfaInviteRecord[] };
    return data.invites ?? [];
  }

  async listUsers(): Promise<JfaUserRecord[]> {
    const token = await this.login();
    const response = await fetch(`${this.apiBaseUrl}/users`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`JFA user lookup failed with status ${response.status}`);
    }

    const data = (await response.json()) as { users?: JfaUserRecord[] };
    return data.users ?? [];
  }

  async setUserEnabled(userId: string, enabled: boolean): Promise<void> {
    const token = await this.login();
    const response = await fetch(`${this.apiBaseUrl}/users/enable`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ users: [userId], enabled, notify: false }),
    });

    if (!response.ok) {
      throw new Error(`JFA user state update failed with status ${response.status}`);
    }
  }
}
