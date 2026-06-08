import { NextResponse } from 'next/server';

import { env, hasAdminBasicAuthConfig, hasJfaAdminConfig, hasStripeCheckoutConfig } from '@/lib/env';

export async function GET() {
  return NextResponse.json({
    ok: true,
    appName: env.appName,
    stripeConfigured: hasStripeCheckoutConfig(),
    jfaConfigured: hasJfaAdminConfig(),
    adminAuthConfigured: hasAdminBasicAuthConfig(),
    smtpConfigured: Boolean(env.smtpHost && env.smtpFromEmail),
  });
}
