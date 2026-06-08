export interface DurationWindow {
  months: number;
  days: number;
  hours: number;
  minutes: number;
}

export interface JfaInvitePayload extends DurationWindow {
  'user-expiry': boolean;
  'user-months': number;
  'user-days': number;
  'user-hours': number;
  'user-minutes': number;
  'multiple-uses': boolean;
  'remaining-uses': number;
  'no-limit': boolean;
  profile: string;
  label: string;
  user_label: string;
}

export interface JfaTokenResponse {
  token: string;
}

export interface JfaInviteRecord {
  code: string;
  profile?: string;
  used_by?: Record<string, number>;
}

export interface JfaUserRecord {
  id: string;
  name: string;
  disabled: boolean;
}
