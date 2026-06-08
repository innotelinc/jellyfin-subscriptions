import Link from 'next/link';

import { env, hasAdminBasicAuthConfig } from '@/lib/env';

interface AdminLoginPageProps {
  searchParams: Promise<{
    error?: string | string[];
    next?: string | string[];
  }>;
}

function getSingleValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

function getErrorCopy(error: string | undefined): string | null {
  if (error === 'invalid') {
    return 'That username or password was not accepted.';
  }

  if (error === 'config') {
    return 'Admin login is not configured yet on this server.';
  }

  return null;
}

export default async function AdminLoginPage({ searchParams }: AdminLoginPageProps) {
  const params = await searchParams;
  const error = getErrorCopy(getSingleValue(params.error));
  const next = getSingleValue(params.next) ?? '/admin';

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center px-6 py-16">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 shadow-2xl shadow-cyan-950/20">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">Admin access</p>
        <h1 className="mt-3 text-4xl font-semibold text-white">Sign in to manage subscribers</h1>
        <p className="mt-4 text-sm leading-7 text-zinc-300">
          Use your administrator credentials to review paid signups, approve invites, and reconcile access.
        </p>

        {error ? (
          <div className="mt-6 rounded-2xl border border-rose-400/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-200">
            {error}
          </div>
        ) : null}

        <form action="/api/admin-session/login" className="mt-8 space-y-4" method="post">
          <input name="next" type="hidden" value={next} />
          <label className="flex flex-col gap-2 text-sm text-zinc-200">
            Username
            <input
              autoComplete="username"
              className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none placeholder:text-zinc-500"
              name="username"
              placeholder="admin"
              required
              type="text"
            />
          </label>
          <label className="flex flex-col gap-2 text-sm text-zinc-200">
            Password
            <input
              autoComplete="current-password"
              className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none placeholder:text-zinc-500"
              name="password"
              placeholder="••••••••"
              required
              type="password"
            />
          </label>
          <button
            className="w-full rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-zinc-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
            disabled={!hasAdminBasicAuthConfig()}
            type="submit"
          >
            Sign in
          </button>
        </form>

        <div className="mt-8 border-t border-white/10 pt-6 text-sm text-zinc-400">
          <p>Need help? Contact {env.supportEmail}.</p>
          <div className="mt-4">
            <Link className="text-cyan-200 underline-offset-4 hover:underline" href="/">
              Return to customer homepage
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
