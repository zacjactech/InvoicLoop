# Security

Thanks for helping keep InvoicLoop and its users safe. The project ships with
a number of hardening defaults — please read them before deploying.

## Supported versions

Only the `main` branch receives security fixes. Tag a release if you want to
back-port.

## Reporting a vulnerability

**Do not open a public GitHub issue for security bugs.**

Email **security@zacjactech.dev** (placeholder; configure a real inbox before
publishing) with:

- A clear description of the issue and its impact
- Reproduction steps / proof-of-concept
- Anything you've already tried

You should get an acknowledgement within 72 hours. We'll coordinate disclosure
and credit you in the fix.

## What's hardened by default

- **Password storage**: bcrypt, cost 10.
- **Sessions**: 256-bit opaque tokens stored in the DB; HttpOnly + SameSite=Lax
  cookies; `Secure` in production.
- **Login**: constant-time bcrypt, placeholder hash when the user does not
  exist (no email enumeration via response timing).
- **Rate limiting**: per-IP buckets on `/api/auth/login` (10/min),
  `/api/auth/signup` (5/min), `/api/auth/forgot-password` (5/min).
  In-process — see "What you must change before deploying".
- **Public invoice links**: SHA-256-hashed share token persisted on the
  invoice; raw token never stored; `timingSafeEqual` comparison at request
  time.
- **Security headers** (`next.config.ts`): CSP, X-Frame-Options: DENY,
  X-Content-Type-Options: nosniff, Referrer-Policy, Permissions-Policy,
  HSTS (2 years, preload), COOP / CORP.
- **Input validation**: every API route is gated by a Zod schema.
- **CSV export**: formula-injection escaping (`=`, `+`, `-`, `@`, leading
  whitespace).
- **Logging**: the dev mailer no longer logs raw reset tokens.
- **Env validation**: `AUTH_SECRET` is required, must not be the documented
  placeholder, and (in production) must be ≥32 chars.

## Threat model (assumptions)

- Attacker controls the network (TLS terminates upstream; configure that).
- Attacker can guess or share raw invoice URLs — public endpoints require an
  unguessable share token.
- Single-tenant per owner: data is scoped by `userId`; cross-tenant access
  is admin-gated.
- SQLite is fine for single-host / single-writer deployments. Switch to
  Postgres for multi-instance.

## What you MUST change before deploying

The defaults are steady-state **dev** posture. Before going live:

1. **Generate a real `AUTH_SECRET`** (`openssl rand -base64 32`).
2. **Use HTTPS** end-to-end. The HSTS header assumes it.
3. **Swap the in-process rate limiter** (`src/lib/rate-limit.ts`) for a
   distributed one (Upstash, Redis, or your edge provider's quota system).
   In-process limiting undercounts behind a load balancer or in
   serverless replicas.
4. **Wire a real email provider** in `src/lib/mailer.ts` (Resend, Postmark,
   SES, etc.). The current logger output is not a delivery channel.
5. **Migrate off SQLite** for any multi-instance deployment. SQLite is
   single-writer and not designed for concurrent writes from many hosts.
6. **Rotate `dev.db` → production DB**. Never deploy with the development
   database reachable.
7. **Audit log retention.** `ActivityLog` grows unbounded; decide on a
   policy (e.g., move older rows to cold storage after N days).

## Dependency advisories

Run locally:

```bash
pnpm audit
```

CI policy: no `high` or `critical` advisories; `moderate` should be patched
within a release cycle.

## Hardening checklist

- [ ] Strong `AUTH_SECRET` configured (≥32 chars, random)
- [ ] `NODE_ENV=production`
- [ ] HTTPS enforced upstream
- [ ] CSP report-uri in place
- [ ] Distributed rate limiter connected
- [ ] Email provider configured
- [ ] Postgres (or other managed DB) wired
- [ ] Backups / disaster recovery documented
- [ ] Log redaction rules reviewed (`ActivityLog.details` can contain
      customer-controlled text — review sinks that render it as HTML)
