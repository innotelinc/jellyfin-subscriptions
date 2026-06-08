import nodemailer from 'nodemailer';

import { env } from '@/lib/env';
import { buildInviteEmailMessage } from '@/lib/notifications/invite-email';

function parsePort(value: string | undefined): number {
  const port = Number(value ?? '587');
  return Number.isFinite(port) ? port : 587;
}

export function hasSmtpConfig(): boolean {
  return Boolean(env.smtpHost && env.smtpFromEmail);
}

export async function sendInviteEmail(input: { email: string; inviteUrl: string }): Promise<void> {
  if (!hasSmtpConfig()) {
    return;
  }

  const message = buildInviteEmailMessage({
    email: input.email,
    inviteUrl: input.inviteUrl,
    supportEmail: env.supportEmail,
    appName: env.appName,
  });

  const transporter = nodemailer.createTransport({
    host: env.smtpHost,
    port: parsePort(env.smtpPort),
    secure: env.smtpSecure === 'true',
    auth:
      env.smtpUsername && env.smtpPassword
        ? {
            user: env.smtpUsername,
            pass: env.smtpPassword,
          }
        : undefined,
  });

  await transporter.sendMail({
    from: env.smtpFromEmail,
    to: message.to,
    subject: message.subject,
    text: message.text,
    html: message.html,
  });
}
