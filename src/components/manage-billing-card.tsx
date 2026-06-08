'use client';

import { useState } from 'react';

interface ManageBillingCardProps {
  defaultEmail?: string;
}

export function ManageBillingCard({ defaultEmail = '' }: ManageBillingCardProps) {
  const [email, setEmail] = useState(defaultEmail);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleManageBilling() {
    setPending(true);
    setError(null);

    try {
      const response = await fetch('/api/billing-portal', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email }),
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? 'Unable to open billing management');
      }

      window.location.href = data.url;
    } catch (portalError) {
      setError(portalError instanceof Error ? portalError.message : 'Unable to open billing management');
      setPending(false);
    }
  }

  return (
    <section className="rounded-3xl border border-white/10 bg-white/5 p-6 text-left">
      <h2 className="text-xl font-semibold text-white">Manage your billing</h2>
      <p className="mt-3 text-sm leading-7 text-zinc-300">
        Enter the same email you used at checkout to open your Stripe billing portal.
      </p>
      <label className="mt-4 flex flex-col gap-2 text-sm text-zinc-200">
        Email address
        <input
          className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none placeholder:text-zinc-500"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          type="email"
          value={email}
        />
      </label>
      <button
        className="mt-4 rounded-2xl border border-cyan-300/40 px-4 py-3 font-semibold text-cyan-100 transition hover:bg-cyan-400/10 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending || email.trim() === ''}
        onClick={() => void handleManageBilling()}
        type="button"
      >
        {pending ? 'Opening billing portal…' : 'Manage billing'}
      </button>
      {error ? <p className="mt-3 text-sm text-rose-300">{error}</p> : null}
    </section>
  );
}
