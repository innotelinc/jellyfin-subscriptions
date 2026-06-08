import type Stripe from 'stripe';

import { db } from '@/lib/db';
import type { SignupStatus, StripeSubscriptionStatus } from '@/lib/domain/signups';
import { getCurrentPeriodEndDate } from '@/lib/stripe/subscription-period-end';
import { deriveNextSignupStatusFromStripe } from '@/lib/stripe/status-transition';

export type BillingPlan = 'monthly' | 'yearly';

export interface PlanDetails {
  interval: BillingPlan;
  label: 'Monthly' | 'Yearly';
  priceId: string;
}

export function getPlanDetails(
  plan: BillingPlan,
  prices: { monthly: string; yearly?: string },
): PlanDetails {
  if (plan === 'yearly') {
    return {
      interval: 'yearly',
      label: 'Yearly',
      priceId: prices.yearly ?? prices.monthly,
    };
  }

  return {
    interval: 'monthly',
    label: 'Monthly',
    priceId: prices.monthly,
  };
}

export async function createSignupForCheckout(input: {
  email: string;
  plan: BillingPlan;
}) {
  const user = await db.user.upsert({
    where: { email: input.email },
    update: {},
    create: { email: input.email },
  });

  const signup = await db.signup.create({
    data: {
      userId: user.id,
      status: 'checkout_pending',
      notes: `Requested ${input.plan} subscription`,
      events: {
        create: {
          type: 'checkout_initiated',
          payload: { plan: input.plan, email: input.email },
        },
      },
    },
    include: {
      user: true,
    },
  });

  return signup;
}

export async function attachCheckoutSessionToSignup(input: {
  signupId: string;
  checkoutSessionId: string;
  stripeCustomerId?: string | null;
}) {
  return db.signup.update({
    where: { id: input.signupId },
    data: {
      stripeCheckoutId: input.checkoutSessionId,
      stripeCustomerId: input.stripeCustomerId ?? undefined,
      events: {
        create: {
          type: 'checkout_session_created',
          payload: {
            checkoutSessionId: input.checkoutSessionId,
            stripeCustomerId: input.stripeCustomerId ?? null,
          },
        },
      },
    },
  });
}

export async function markSignupPaidFromCheckoutSession(session: Stripe.Checkout.Session) {
  const signupId = session.metadata?.signupId;

  if (!signupId) {
    return null;
  }

  return db.signup.update({
    where: { id: signupId },
    data: {
      status: 'pending_approval',
      stripeCheckoutId: session.id,
      stripeCustomerId:
        typeof session.customer === 'string' ? session.customer : session.customer?.id ?? undefined,
      stripeSubscriptionId:
        typeof session.subscription === 'string'
          ? session.subscription
          : session.subscription?.id ?? undefined,
      events: {
        create: {
          type: 'checkout_session_completed',
          payload: {
            checkoutSessionId: session.id,
            customerId:
              typeof session.customer === 'string'
                ? session.customer
                : session.customer?.id ?? null,
            subscriptionId:
              typeof session.subscription === 'string'
                ? session.subscription
                : session.subscription?.id ?? null,
          },
        },
      },
    },
  });
}

export async function applyStripeSubscriptionUpdate(subscription: Stripe.Subscription) {
  const stripeCustomerId =
    typeof subscription.customer === 'string' ? subscription.customer : subscription.customer.id;

  const signup = await db.signup.findFirst({
    where: {
      OR: [
        { stripeSubscriptionId: subscription.id },
        { stripeCustomerId },
      ],
    },
  });

  if (!signup) {
    return null;
  }

  const nextStatus = deriveNextSignupStatusFromStripe(
    signup.status as SignupStatus,
    subscription.status as StripeSubscriptionStatus,
  );

  return db.signup.update({
    where: { id: signup.id },
    data: {
      status: nextStatus,
      stripeCustomerId,
      stripeSubscriptionId: subscription.id,
      subscriptionStatus: subscription.status as StripeSubscriptionStatus,
      currentPeriodEnd: getCurrentPeriodEndDate(subscription),
      events: {
        create: {
          type: 'subscription_updated',
          payload: {
            stripeSubscriptionId: subscription.id,
            status: subscription.status,
            currentPeriodEnd: subscription.items.data[0]?.current_period_end ?? null,
          },
        },
      },
    },
  });
}

export async function listAdminSignups() {
  return db.signup.findMany({
    include: { user: true },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getSignupById(id: string) {
  return db.signup.findUnique({
    where: { id },
    include: { user: true, events: { orderBy: { createdAt: 'desc' }, take: 20 } },
  });
}

export async function recordSignupEvent(input: {
  signupId: string;
  type: string;
  payload?: unknown;
}) {
  return db.signupEvent.create({
    data: {
      signupId: input.signupId,
      type: input.type,
      payload: (input.payload ?? null) as never,
    },
  });
}

export async function findLatestSignupByEmail(email: string) {
  return db.signup.findFirst({
    where: {
      user: {
        email,
      },
    },
    include: {
      user: true,
      events: { orderBy: { createdAt: 'desc' }, take: 20 },
    },
    orderBy: {
      createdAt: 'desc',
    },
  });
}

export async function approveSignup(input: {
  id: string;
  approverEmail: string;
  inviteCode: string;
  inviteUrl: string;
}) {
  return db.signup.update({
    where: { id: input.id },
    data: {
      status: 'invited',
      approvedAt: new Date(),
      approverEmail: input.approverEmail,
      jfaInviteCode: input.inviteCode,
      jfaInviteUrl: input.inviteUrl,
      events: {
        create: {
          type: 'signup_approved',
          payload: {
            approverEmail: input.approverEmail,
            inviteCode: input.inviteCode,
            inviteUrl: input.inviteUrl,
          },
        },
      },
    },
  });
}

export async function rejectSignup(input: {
  id: string;
  approverEmail: string;
  reason?: string;
}) {
  return db.signup.update({
    where: { id: input.id },
    data: {
      status: 'rejected',
      rejectedAt: new Date(),
      approverEmail: input.approverEmail,
      notes: input.reason ? `Rejected: ${input.reason}` : 'Rejected by admin',
      events: {
        create: {
          type: 'signup_rejected',
          payload: {
            approverEmail: input.approverEmail,
            reason: input.reason ?? null,
          },
        },
      },
    },
  });
}

export async function markSignupActivated(input: {
  id: string;
  jellyfinUsername: string;
  jellyfinUserId?: string;
}) {
  return db.signup.update({
    where: { id: input.id },
    data: {
      status: 'activated',
      jellyfinUsername: input.jellyfinUsername,
      jellyfinUserId: input.jellyfinUserId,
      events: {
        create: {
          type: 'invite_redeemed',
          payload: {
            jellyfinUsername: input.jellyfinUsername,
            jellyfinUserId: input.jellyfinUserId ?? null,
          },
        },
      },
    },
  });
}
