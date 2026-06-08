import Link from 'next/link';
import { headers } from 'next/headers';

import { AdminSignupActions } from '@/components/admin-signup-actions';
import { ADMIN_AUTH_HEADER } from '@/lib/admin-session';
import { listAdminSignups } from '@/lib/signups';

function formatDate(value: Date | null | undefined) {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
}

export default async function AdminPage() {
  const signups = await listAdminSignups();
  const operatorLabel = (await headers()).get(ADMIN_AUTH_HEADER) ?? 'admin';

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-6 py-12">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">Admin queue</p>
          <h1 className="mt-2 text-4xl font-semibold">Pending subscriber approvals</h1>
        </div>
        <div className="flex flex-col items-start gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-zinc-300 sm:items-end">
          <p>Signed in as: {operatorLabel}</p>
          <form action="/api/admin-session/logout" method="post">
            <button className="rounded-xl border border-white/15 px-3 py-2 text-xs uppercase tracking-[0.2em] text-zinc-200 transition hover:bg-white/5" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </div>

      {signups.length === 0 ? (
        <div className="rounded-3xl border border-dashed border-white/20 bg-white/5 p-8 text-zinc-300">
          No signups yet. Complete a Stripe Checkout session and the queue will populate.
        </div>
      ) : (
        <div className="grid gap-4">
          {signups.map((signup) => (
            <article
              key={signup.id}
              className="grid gap-5 rounded-3xl border border-white/10 bg-white/5 p-6 lg:grid-cols-[1fr_auto]"
            >
              <div className="space-y-3">
                <div className="flex flex-wrap items-center gap-3">
                  <h2 className="text-xl font-semibold text-white">{signup.user.email}</h2>
                  <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-100">
                    {signup.status.replaceAll('_', ' ')}
                  </span>
                  {signup.subscriptionStatus ? (
                    <span className="rounded-full border border-white/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-zinc-300">
                      stripe: {signup.subscriptionStatus}
                    </span>
                  ) : null}
                </div>
                <div className="grid gap-2 text-sm text-zinc-300 sm:grid-cols-2">
                  <p>Created: {formatDate(signup.createdAt)}</p>
                  <p>Approved: {formatDate(signup.approvedAt)}</p>
                  <p>Checkout session: {signup.stripeCheckoutId ?? '—'}</p>
                  <p>Subscription: {signup.stripeSubscriptionId ?? '—'}</p>
                  <p>Invite code: {signup.jfaInviteCode ?? '—'}</p>
                  <p>Jellyfin username: {signup.jellyfinUsername ?? '—'}</p>
                </div>
                <div className="flex flex-wrap gap-4">
                  <Link
                    className="inline-flex text-sm text-cyan-200 underline-offset-4 hover:underline"
                    href={`/admin/signups/${signup.id}`}
                  >
                    View details
                  </Link>
                  {signup.jfaInviteUrl ? (
                    <a
                      className="inline-flex text-sm text-cyan-200 underline-offset-4 hover:underline"
                      href={signup.jfaInviteUrl}
                      rel="noreferrer"
                      target="_blank"
                    >
                      Open invite link
                    </a>
                  ) : null}
                </div>
                <p className="text-sm leading-7 text-zinc-400">{signup.notes ?? 'No notes yet.'}</p>
              </div>
              <AdminSignupActions currentStatus={signup.status} signupId={signup.id} />
            </article>
          ))}
        </div>
      )}
    </main>
  );
}
