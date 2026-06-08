interface StripeSubscriptionLike {
  items?: {
    data?: Array<{
      current_period_end?: number | null;
    }>;
  };
}

export function getCurrentPeriodEndDate(subscription: StripeSubscriptionLike): Date | null {
  const unixTimestamp = subscription.items?.data?.[0]?.current_period_end;

  if (typeof unixTimestamp !== 'number' || !Number.isFinite(unixTimestamp)) {
    return null;
  }

  return new Date(unixTimestamp * 1000);
}
