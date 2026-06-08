import Link from 'next/link';

import { ManageBillingCard } from '@/components/manage-billing-card';
import { PricingCard } from '@/components/pricing-card';
import { RequestContentSection } from '@/components/request-content';
import { env, hasJellyseerrConfig } from '@/lib/env';

const plans = [
  {
    name: 'Monthly',
    description: 'Flexible month-to-month access with fast onboarding and easy cancellation.',
    price: '$5/mo',
    interval: 'monthly' as const,
    featured: true,
  },
  {
    name: 'Yearly',
    description: 'Best value for regular viewers who want fewer billing interruptions.',
    price: '$40/yr',
    interval: 'yearly' as const,
  },
];

const perks = [
  'Private Jellyfin streaming access for approved members',
  'Secure online billing with self-serve subscription management',
  'Manual approval to keep the server stable and abuse-resistant',
  'Optional content requests through our connected media request portal',
];

const faqs = [
  {
    answer:
      'After payment, each signup is reviewed before access is granted. Once approved, you receive a one-time invite link by email.',
    question: 'How soon do I get access?',
  },
  {
    answer:
      'Yes. Use the Manage billing form below with the same email address you used at checkout to open the Stripe customer portal.',
    question: 'Can I cancel or update my billing later?',
  },
  {
    answer:
      'Absolutely. If the title is not already available, use the request portal to ask for movies or shows to be added.',
    question: 'Can I request content?',
  },
];

export default function Home() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 py-10 sm:px-10 lg:px-12">
      <header className="relative overflow-hidden rounded-[2rem] border border-white/10 bg-white/5 px-8 py-12 shadow-2xl shadow-cyan-950/20 sm:px-10 lg:px-14 lg:py-16">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(34,211,238,0.18),transparent_35%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.15),transparent_30%)]" />
        <div className="relative grid gap-10 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <div className="inline-flex rounded-full border border-cyan-400/25 bg-cyan-400/10 px-4 py-2 text-sm text-cyan-100">
              Premium Jellyfin access · subscribe.innotel.us
            </div>
            <h1 className="mt-6 max-w-3xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
              Stream your favorite movies and shows with simple, transparent pricing.
            </h1>
            <p className="mt-6 max-w-2xl text-lg leading-8 text-zinc-300">
              Join Innotel Media for curated Jellyfin access, secure billing through Stripe, and a clean approval flow that protects service quality for every subscriber.
            </p>
            <div className="mt-8 flex flex-wrap gap-4 text-sm text-zinc-200">
              <a className="rounded-2xl bg-cyan-400 px-5 py-3 font-semibold text-zinc-950 transition hover:bg-cyan-300" href="#pricing">
                View plans
              </a>
              <a className="rounded-2xl border border-white/15 px-5 py-3 font-semibold transition hover:bg-white/5" href="#billing">
                Manage billing
              </a>
            </div>
          </div>

          <div className="rounded-[1.75rem] border border-white/10 bg-black/20 p-6 backdrop-blur-sm">
            <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">What’s included</p>
            <ul className="mt-5 space-y-4 text-sm leading-7 text-zinc-200">
              {perks.map((perk) => (
                <li key={perk} className="flex gap-3">
                  <span className="mt-1 text-cyan-300">✦</span>
                  <span>{perk}</span>
                </li>
              ))}
            </ul>
            <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-zinc-300">
              Questions before subscribing? Reach us at{' '}
              <a className="text-cyan-200 underline-offset-4 hover:underline" href={`mailto:${env.supportEmail}`}>
                {env.supportEmail}
              </a>
              .
            </div>
          </div>
        </div>
      </header>

      <section className="grid gap-6 py-10 sm:grid-cols-3">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm uppercase tracking-[0.18em] text-cyan-200">Secure checkout</p>
          <h2 className="mt-3 text-xl font-semibold text-white">Powered by Stripe</h2>
          <p className="mt-3 text-sm leading-7 text-zinc-300">
            Payment details are handled by Stripe, with access granted only after successful checkout and review.
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm uppercase tracking-[0.18em] text-cyan-200">Human review</p>
          <h2 className="mt-3 text-xl font-semibold text-white">Approved members only</h2>
          <p className="mt-3 text-sm leading-7 text-zinc-300">
            Every new membership is screened before invites are created, helping us keep playback reliable and communities healthy.
          </p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm uppercase tracking-[0.18em] text-cyan-200">Easy account care</p>
          <h2 className="mt-3 text-xl font-semibold text-white">Manage billing anytime</h2>
          <p className="mt-3 text-sm leading-7 text-zinc-300">
            Update payment methods, review invoices, or cancel your plan from the self-serve billing portal.
          </p>
        </div>
      </section>

      <section className="py-4" id="pricing">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">Plans</p>
          <h2 className="mt-3 text-3xl font-semibold text-white sm:text-4xl">Choose the membership that fits your viewing habits.</h2>
          <p className="mt-4 text-base leading-7 text-zinc-300">
            Both plans include the same approval process and member experience. Pick the billing cadence that works best for you.
          </p>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          {plans.map((plan) => (
            <PricingCard key={plan.interval} {...plan} />
          ))}
        </div>
      </section>

      <section className="grid gap-6 border-t border-white/10 py-10 lg:grid-cols-[0.95fr_1.05fr]" id="billing">
        <ManageBillingCard />
        <div className="rounded-3xl border border-white/10 bg-white/5 p-6">
          <p className="text-sm uppercase tracking-[0.18em] text-cyan-200">Before you subscribe</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">How membership works</h2>
          <ol className="mt-5 space-y-3 text-sm leading-7 text-zinc-300">
            <li>1. Choose a plan and check out securely with your email address.</li>
            <li>2. We review the signup and approve eligible memberships.</li>
            <li>3. You receive an invite link and finish creating your streaming account.</li>
            <li>4. Return anytime to manage billing, invoices, or plan changes.</li>
          </ol>
        </div>
      </section>

      <section className="border-t border-white/10 py-10">
        <div className="mb-8 max-w-2xl">
          <p className="text-sm uppercase tracking-[0.2em] text-cyan-200">FAQ</p>
          <h2 className="mt-3 text-3xl font-semibold text-white">Common questions</h2>
        </div>
        <div className="grid gap-6 lg:grid-cols-3">
          {faqs.map((item) => (
            <article key={item.question} className="rounded-3xl border border-white/10 bg-white/5 p-6">
              <h3 className="text-lg font-semibold text-white">{item.question}</h3>
              <p className="mt-3 text-sm leading-7 text-zinc-300">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>

      {hasJellyseerrConfig() && <RequestContentSection />}

      <footer className="border-t border-white/10 py-8 text-center text-sm text-zinc-500">
        <p>&copy; {new Date().getFullYear()} Innotel Media. All rights reserved.</p>
        <div className="mt-2 flex flex-wrap items-center justify-center gap-4">
          <Link className="transition-colors hover:text-cyan-300" href={env.jellyfinUrl}>
            Jellyfin server
          </Link>
          <span className="text-zinc-700">|</span>
          <Link className="transition-colors hover:text-cyan-300" href={env.jellyseerrBaseUrl}>
            Request content
          </Link>
          <span className="text-zinc-700">|</span>
          <Link className="transition-colors hover:text-cyan-300" href="/signup/success">
            Billing help
          </Link>
        </div>
      </footer>
    </main>
  );
}
