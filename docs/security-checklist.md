# Security Checklist (Draft)

## Auth & Sessions
- Session cookie is httpOnly, sameSite, secure in production.
- CSRF protections on all state-changing endpoints.

## API Abuse Controls
- Rate limit login, register, and play actions.
- Input validation on all public endpoints.

## Secrets & Tokens
- Encrypt OAuth tokens at rest (Lichess).
- Do not log secrets or access tokens.

## Headers
- CSP to reduce script injection risk.
- COOP/COEP where SharedArrayBuffer or Stockfish is used.

