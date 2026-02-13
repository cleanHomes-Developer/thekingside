# The King Side

## Environment variables

Core:
- `DATABASE_URL` Postgres connection string
- `REDIS_URL` Redis connection string
- `NEXT_PUBLIC_APP_URL` App base URL (e.g., http://localhost:3000)
- `AUTH_SECRET` Session signing secret
- `TOKEN_ENCRYPTION_KEY` Secret for encrypting OAuth tokens at rest (optional, falls back to AUTH_SECRET)

Stripe:
- `STRIPE_SECRET_KEY` Stripe secret key (test mode)
- `STRIPE_WEBHOOK_SECRET` Stripe webhook secret
- `STRIPE_CONNECT_CLIENT_ID` Stripe Connect client id

Lichess:
- `LICHESS_BASE_URL` Lichess base URL
- `LICHESS_CLIENT_ID` OAuth client id
- `LICHESS_CLIENT_SECRET` OAuth client secret
- `LICHESS_PLATFORM_TOKEN` Bot/platform token for challenges

Monitoring:
- `SENTRY_DSN` Sentry DSN (optional)

Season controls:
- `SEASON_MODE` Set to `free` to waive entry fees, `paid` for normal pricing
- `FREE_PRIZE_POOL` Seed amount for free-season prize pools (USD)
- `PRIZE_MODE` Set to `gift_card` or `cash` for prize fulfillment
- `SPONSORSHIP_ENABLED` Set to `true` to show sponsor slots
- `SPONSOR_SLOTS` Active sponsor slots (1-5)
- `NEXT_PUBLIC_SEASON_MODE` Client-side mirror of `SEASON_MODE`
- `NEXT_PUBLIC_FREE_PRIZE_POOL` Client-side mirror of `FREE_PRIZE_POOL`

Affiliate marketing:
- Manage programs in `/admin/affiliates`, seed the catalog once, and enable partners as contracts are signed.
- Public page lives at `/affiliates` and only shows enabled programs.

---

This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load web fonts.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
