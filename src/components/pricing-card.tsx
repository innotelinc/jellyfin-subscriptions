'use client';

import { useState } from 'react';

interface PricingCardProps {
  name: string;
  description: string;
  price: string;
  interval: 'monthly' | 'yearly';
  featured?: boolean;
}

export function PricingCard({
  name,
  description,
  price,
  interval,
  featured = false,
}: PricingCardProps) {
  const [email, setEmail] = useState('');
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setPending(true);
    setError(null);

    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, plan: interval }),
      });

      const data = (await response.json()) as { url?: string; error?: string };

      if (!response.ok || !data.url) {
        throw new Error(data.error ?? 'Unable to start checkout');
      }

      window.location.href = data.url;
    } catch (checkoutError) {
      setError(
        checkoutError instanceof Error ? checkoutError.message : 'Unable to start checkout',
      );
      setPending(false);
    }
  }

  return (
    <div
      className={[
        'flex h-full flex-col gap-4 rounded-3xl border p-6 shadow-sm',
        featured
          ? 'border-cyan-400 bg-cyan-950/40 text-white'
          : 'border-white/10 bg-white/5 text-white',
      ].join(' ')}
    >
      <div className="space-y-2">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">{name}</p>
        <h3 className="text-3xl font-semibold">{price}</h3>
        <p className="text-sm text-zinc-300">{description}</p>
      </div>

      <label className="mt-2 flex flex-col gap-2 text-sm text-zinc-200">
        Email address
        <input
          className="rounded-2xl border border-white/10 bg-black/30 px-4 py-3 outline-none ring-0 placeholder:text-zinc-500"
          onChange={(event) => setEmail(event.target.value)}
          placeholder="you@example.com"
          type="email"
          value={email}
        />
      </label>

      <button
        className="mt-auto rounded-2xl bg-cyan-400 px-4 py-3 font-semibold text-zinc-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:opacity-60"
        disabled={pending || email.trim() === ''}
        onClick={() => void handleCheckout()}
        type="button"
      >
        {pending ? 'Redirecting…' : `Subscribe ${interval === 'monthly' ? 'monthly' : 'yearly'}`}
      </button>

      {error ? <p className="text-sm text-rose-300">{error}</p> : null}
    </div>
  );
}
