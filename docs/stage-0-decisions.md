# Stage 0 Decisions (Draft)

Purpose: lock core policy and architecture choices before remediation work.

## Decision Log

| ID | Decision | Status | Owner | Notes |
| --- | --- | --- | --- | --- |
| D-01 | Payout entitlement source (placements -> payout schedule) | ACCEPTED | Product | Use final standings and a configured payout schedule. |
| D-02 | Payout initiation (user request vs admin initiated) | ACCEPTED | Product | Admin initiated only. |
| D-03 | Gift-card fulfillment model | ACCEPTED | Ops | Secure inventory table + issuance log. |
| D-04 | Realtime architecture (serverless vs long-lived) | ACCEPTED | Tech | Redis pub/sub for play stream and admin alerts. |
| D-05 | Audit log scope | ACCEPTED | Product | Money actions, admin actions, tournament state changes. |

## Proposed Defaults (Adopted)

- Payouts: admin initiated only; users can view eligibility and history.
- Entitlements: payout amounts derive from final standings and a configured payout schedule per tournament.
- Gift cards: stored as encrypted codes; issued via admin action with audit log.
- Realtime: Redis-backed pub/sub for play stream and admin alerts.
- Audit: log all money actions, admin actions, tournament transitions.

## Open Questions

- What is the default payout schedule (top 1, top 3, percent split)?
- Should gift cards be issued automatically at tournament completion or manually by admin?
- Should anonymous players be allowed to enter casual matchmaking in production?
