# Operations Checklist

Use this list before every production deployment.

## Data & migrations
- [ ] Database backup captured.
- [ ] `pnpm prisma migrate deploy` completed with zero drift.
- [ ] Seed tasks executed (admin user, season config).

## Services
- [ ] Redis reachable (`REDIS_URL`).
- [ ] Announcements worker running (`pnpm worker:announcements`).
- [ ] Queue health clean (Admin → Queues, no failures).

## Security & compliance
- [ ] `SENDGRID_API_KEY` and `SENDGRID_FROM_EMAIL` configured.
- [ ] `STRIPE_SECRET_KEY` and webhook secret configured (test mode default).
- [ ] `SENTRY_DSN` configured for server + client.

## Performance
- [ ] Cache hit confirmed for list pages (tournaments/admin stats).
- [ ] Pagination limits in admin lists verified.

## Monitoring
- [ ] Alerts reviewed for queue failures.
- [ ] Error budget checked in Sentry.

## Smoke checks
- [ ] `pnpm test` passes.
- [ ] Smoke script passes (`node loadtest/smoke.js`).
