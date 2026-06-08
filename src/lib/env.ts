function read(key: string): string | undefined {
  const value = process.env[key];
  return value && value.trim() !== '' ? value : undefined;
}

export const env = {
  appName: read('APP_NAME') ?? 'Innotel Media',
  appBaseUrl: read('APP_BASE_URL') ?? 'http://localhost:3000',
  stripeSecretKey: read('STRIPE_SECRET_KEY'),
  stripeWebhookSecret: read('STRIPE_WEBHOOK_SECRET'),
  stripePriceIdMonthly: read('STRIPE_PRICE_ID_MONTHLY'),
  stripePriceIdYearly: read('STRIPE_PRICE_ID_YEARLY'),
  jellyfinUrl: read('JELLYFIN_URL') ?? 'https://media.innotel.us',
  jfaBaseUrl: read('JFA_BASE_URL') ?? 'https://accounts.innotel.us',
  jfaAdminUsername: read('JFA_ADMIN_USERNAME'),
  jfaAdminPassword: read('JFA_ADMIN_PASSWORD'),
  jfaInviteProfile: read('JFA_INVITE_PROFILE') ?? 'Subscriber',
  jfaUserLabel: read('JFA_USER_LABEL') ?? 'subscriber',
  adminEmail: read('ADMIN_EMAIL') ?? 'admin@example.com',
  supportEmail: read('SUPPORT_EMAIL') ?? read('ADMIN_EMAIL') ?? 'support@example.com',
  adminUsername: read('ADMIN_USERNAME'),
  adminPassword: read('ADMIN_PASSWORD'),
  adminSessionSecret: read('ADMIN_SESSION_SECRET'),
  smtpHost: read('SMTP_HOST'),
  smtpPort: read('SMTP_PORT') ?? '587',
  smtpSecure: read('SMTP_SECURE') ?? 'false',
  smtpUsername: read('SMTP_USERNAME'),
  smtpPassword: read('SMTP_PASSWORD'),
  smtpFromEmail: read('SMTP_FROM_EMAIL'),
  jellyseerrBaseUrl: read('JELLYSEERR_BASE_URL') ?? 'https://req.innotel.us',
  jellyseerrApiKey: read('JELLYSEERR_API_KEY'),
};

export function hasStripeCheckoutConfig(): boolean {
  return Boolean(env.stripeSecretKey && env.stripePriceIdMonthly);
}

export function hasJfaAdminConfig(): boolean {
  return Boolean(env.jfaBaseUrl && env.jfaAdminUsername && env.jfaAdminPassword);
}

export function hasAdminBasicAuthConfig(): boolean {
  return Boolean(env.adminUsername && env.adminPassword);
}

export function hasJellyseerrConfig(): boolean {
  return Boolean(env.jellyseerrBaseUrl && env.jellyseerrApiKey);
}
