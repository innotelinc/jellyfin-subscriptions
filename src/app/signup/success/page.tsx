import Link from 'next/link';

import { ManageBillingCard } from '@/components/manage-billing-card';
import { getSignupStatusCopy } from '@/lib/signup-status-copy';

interface SignupSuccessPageProps {
  searchParams: Promise<{
    email?: string | string[];
    manage?: string | string[];
    status?: string | string[];
  }>;
}

function getSingleValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

export default async function SignupSuccessPage({ searchParams }: SignupSuccessPageProps) {
  const params = await searchParams;
  const email = getSingleValue(params.email);
  const manage = getSingleValue(params.manage);
  const status = getSingleValue(params.status);
  const copy = getSignupStatusCopy(status);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col justify-center px-6 py-16">
      <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
        <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">
          {manage === '1' ? 'Billing updated' : 'Subscription status'}
        </p>
        <h1 className="mt-4 text-5xl font-semibold">{copy.heading}</h1>
        <p className="mt-6 text-lg leading-8 text-zinc-300">{copy.body}</p>
        <p className="mt-4 text-sm leading-7 text-zinc-400">
          Once approved, the system creates a single-use JFA-Go invite and can email the account
          setup link to the customer.
        </p>
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          <Link className="rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-zinc-950" href="/">
            Back to pricing
          </Link>
        </div>
      </div>

      <div className="mt-6">
        <ManageBillingCard defaultEmail={email} />
      </div>
    </main>
  );
}
