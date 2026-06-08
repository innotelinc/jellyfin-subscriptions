export interface InviteDeliveryInput {
  email: string;
  inviteUrl: string;
}

export interface InviteDeliveryDeps {
  hasConfig: () => boolean;
  send: (input: InviteDeliveryInput) => Promise<void>;
}

export interface InviteDeliveryResult {
  ok: boolean;
  skipped: boolean;
  error?: string;
}

export async function deliverInviteEmail(
  input: InviteDeliveryInput,
  deps: InviteDeliveryDeps,
): Promise<InviteDeliveryResult> {
  if (!deps.hasConfig()) {
    return { ok: true, skipped: true };
  }

  try {
    await deps.send(input);
    return { ok: true, skipped: false };
  } catch (error) {
    return {
      ok: false,
      skipped: false,
      error: error instanceof Error ? error.message : 'Unknown invite email delivery error',
    };
  }
}
