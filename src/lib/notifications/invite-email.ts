export interface InviteEmailMessageInput {
  email: string;
  inviteUrl: string;
  supportEmail: string;
  appName: string;
}

export interface InviteEmailMessage {
  to: string;
  subject: string;
  text: string;
  html: string;
}

export function buildInviteEmailMessage(input: InviteEmailMessageInput): InviteEmailMessage {
  const subject = `Your ${input.appName} invite is ready`;
  const text = [
    `Your ${input.appName} signup has been approved.`,
    '',
    `Use this invite link to finish creating your account: ${input.inviteUrl}`,
    '',
    `If you need help, reply to ${input.supportEmail}.`,
  ].join('\n');

  const html = [
    `<p>Your <strong>${input.appName}</strong> signup has been approved.</p>`,
    `<p><a href="${input.inviteUrl}">Complete account setup</a></p>`,
    `<p>If you need help, contact <a href="mailto:${input.supportEmail}">${input.supportEmail}</a>.</p>`,
  ].join('');

  return {
    to: input.email,
    subject,
    text,
    html,
  };
}
