interface AdminSignupActionsProps {
  signupId: string;
  currentStatus: string;
}

function approvalHint(currentStatus: string) {
  if (currentStatus === 'pending_approval' || currentStatus === 'paid') {
    return null;
  }

  if (currentStatus === 'checkout_pending') {
    return 'Waiting for successful Stripe checkout + webhook before approval can be granted.';
  }

  return `Approval is unavailable while the signup status is ${currentStatus.replaceAll('_', ' ')}.`;
}

export function AdminSignupActions({ signupId, currentStatus }: AdminSignupActionsProps) {
  const canApprove = currentStatus === 'pending_approval' || currentStatus === 'paid';
  const canReject = currentStatus !== 'rejected' && currentStatus !== 'activated';
  const approveHint = approvalHint(currentStatus);

  return (
    <div className="flex flex-col gap-3">
      <form action={`/admin/signups/${signupId}/approve`} method="post">
        <button
          aria-disabled={!canApprove}
          className="rounded-xl bg-cyan-400 px-4 py-2 text-sm font-semibold text-zinc-950 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canApprove}
          title={approveHint ?? undefined}
          type="submit"
        >
          Approve + create invite
        </button>
      </form>
      {approveHint ? <p className="max-w-xs text-xs leading-5 text-zinc-400">{approveHint}</p> : null}
      <form action={`/admin/signups/${signupId}/reject`} method="post">
        <input name="reason" type="hidden" value="Rejected from admin queue" />
        <button
          className="rounded-xl border border-rose-300/30 px-4 py-2 text-sm text-rose-200 disabled:cursor-not-allowed disabled:opacity-50"
          disabled={!canReject}
          type="submit"
        >
          Reject
        </button>
      </form>
    </div>
  );
}
