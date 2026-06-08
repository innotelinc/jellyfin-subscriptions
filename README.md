# Jellyfin Subscriptions

A Next.js app for selling access to a Jellyfin server with Stripe while provisioning users through JFA-Go.

## What it does

- public pricing page with checkout initiation
- Stripe Checkout session creation
- Stripe webhook processing and signup persistence
- Prisma-backed signup queue and event history
- protected admin approval/rejection flows
- server-side JFA-Go invite creation and user reconciliation
- optional Stripe billing portal entry point for customers
- optional SMTP invite-email delivery after approval

## Local development

```bash
npm install
npx prisma generate
npx prisma migrate dev --name init
npm test
npm run dev
```

Open `http://localhost:3000`.

## Required environment variables

Copy `.env.example` to `.env` and fill in your real values.

### Core app

- `DATABASE_URL`
- `APP_NAME`
- `APP_BASE_URL`

### Stripe

- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_ID_MONTHLY`
- `STRIPE_PRICE_ID_YEARLY`

### JFA-Go

- `JFA_BASE_URL`
- `JFA_ADMIN_USERNAME`
- `JFA_ADMIN_PASSWORD`
- `JFA_INVITE_PROFILE`
- `JFA_USER_LABEL`

### Admin

- `ADMIN_EMAIL`
- `ADMIN_USERNAME`
- `ADMIN_PASSWORD`

### Optional email delivery

- `SUPPORT_EMAIL`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USERNAME`
- `SMTP_PASSWORD`
- `SMTP_FROM_EMAIL`

## Main routes

- `/` — public pricing page
- `/signup/success` — customer post-checkout page and billing portal entry
- `/admin` — approval queue
- `/admin/signups/[id]` — signup detail and event history
- `/api/checkout` — Stripe Checkout creation
- `/api/billing-portal` — Stripe customer billing portal session creation
- `/api/stripe/webhook` — Stripe webhook handler
- `/api/jfa/sync` — JFA invite/user reconciliation

## Production notes

### Approval flow

1. customer starts checkout
2. Stripe webhook marks signup paid / pending approval
3. admin approves signup
4. app creates a JFA invite server-side
5. app optionally sends the invite email via SMTP
6. `/api/jfa/sync` can reconcile redeemed invites back into local signup state

### Billing portal

Customers can reopen billing management from `/signup/success` by entering the same email they used at checkout.

### Health and ops

- `GET /api/health` returns basic readiness/config flags
- `npm run jfa:sync` triggers the protected JFA reconciliation route from the shell
- `BASE_URL=http://127.0.0.1:3001 npm run jfa:sync` is useful for local development when the dev server is not on port 3000

### Docker

Example deployment files are included:

- `Dockerfile`
- `docker-compose.example.yml`
- `deploy/Caddyfile.example`

Basic example:

```bash
docker build -t jellyfin-subscriptions .
docker run --env-file .env -p 3000:3000 jellyfin-subscriptions
```

## Remaining real-world setup

This repo is wired for the flow, but these pieces still depend on real external services:

- live Stripe keys and price IDs
- Stripe webhook delivery from your Stripe account
- working JFA-Go admin credentials
- optional SMTP credentials for invite emails
- reverse proxy / DNS / TLS for your production domains
