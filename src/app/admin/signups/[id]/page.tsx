import Link from 'next/link';

import { AdminSignupActions } from '@/components/admin-signup-actions';
import { getSignupById } from '@/lib/signups';

interface AdminSignupDetailPageProps {
  params: Promise<{ id: string }>;
}

function formatDate(value: Date | null | undefined) {
  if (!value) {
    return '—';
  }

  return new Intl.DateTimeFormat('en-US', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(value);
}

export default async function AdminSignupDetailPage({ params }: AdminSignupDetailPageProps) {
  const { id } = await params;
  const signup = await getSignupById(id);

  if (!signup) {
    return (
      <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-12">
        <Link className="text-cyan-200 underline-offset-4 hover:underline" href="/admin">
          ← Back to admin queue
        </Link>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8">
          <h1 className="text-3xl font-semibold">Signup not found</h1>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 px-6 py-12">
      <Link className="text-cyan-200 underline-offset-4 hover:underline" href="/admin">
        ← Back to admin queue
      </Link>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <div className="flex flex-wrap items-center gap-3">
          <h1 className="text-3xl font-semibold">{signup.user.email}</h1>
          <span className="rounded-full border border-cyan-400/30 bg-cyan-400/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-cyan-100">
            {signup.status.replaceAll('_', ' ')}
          </span>
        </div>

        <div className="mt-6 grid gap-3 text-sm text-zinc-300 sm:grid-cols-2">
          <p>Created: {formatDate(signup.createdAt)}</p>
          <p>Updated: {formatDate(signup.updatedAt)}</p>
          <p>Approved: {formatDate(signup.approvedAt)}</p>
          <p>Rejected: {formatDate(signup.rejectedAt)}</p>
          <p>Checkout session: {signup.stripeCheckoutId ?? '—'}</p>
          <p>Subscription: {signup.stripeSubscriptionId ?? '—'}</p>
          <p>Customer: {signup.stripeCustomerId ?? '—'}</p>
          <p>Invite code: {signup.jfaInviteCode ?? '—'}</p>
          <p>Jellyfin user ID: {signup.jellyfinUserId ?? '—'}</p>
          <p>Jellyfin username: {signup.jellyfinUsername ?? '—'}</p>
        </div>

        {signup.jfaInviteUrl ? (
          <a
            className="mt-4 inline-flex text-sm text-cyan-200 underline-offset-4 hover:underline"
            href={signup.jfaInviteUrl}
            rel="noreferrer"
            target="_blank"
          >
            Open invite link
          </a>
        ) : null}

        <p className="mt-4 text-sm leading-7 text-zinc-400">{signup.notes ?? 'No notes yet.'}</p>

        <div className="mt-6">
          <AdminSignupActions currentStatus={signup.status} signupId={signup.id} />
        </div>
      </section>

      <section className="rounded-3xl border border-white/10 bg-white/5 p-8">
        <h2 className="text-2xl font-semibold">Event history</h2>
        <div className="mt-6 grid gap-4">
          {signup.events.map((event) => (
            <article key={event.id} className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <p className="font-medium text-white">{event.type}</p>
                <p className="text-xs uppercase tracking-[0.16em] text-zinc-400">
                  {formatDate(event.createdAt)}
                </p>
              </div>
              <pre className="mt-3 overflow-x-auto whitespace-pre-wrap break-words text-xs leading-6 text-zinc-300">
                {JSON.stringify(event.payload ?? {}, null, 2)}
              </pre>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
