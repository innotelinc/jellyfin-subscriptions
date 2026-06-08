export function hasStripeBillingPortalConfig(input: {
  stripeSecretKey?: string;
  appBaseUrl?: string;
}): boolean {
  return Boolean(input.stripeSecretKey && input.appBaseUrl && input.appBaseUrl.trim() !== '');
}

export function buildBillingPortalReturnUrl(appBaseUrl: string): string {
  return `${appBaseUrl.replace(/\/$/, '')}/signup/success?manage=1`;
}
