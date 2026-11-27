# Prodigy Noted Deployment and Data Migration Notes

## Current deployment contract

The current server requires:
- `DATABASE_URL`: PostgreSQL connection string.
- `REPLIT_DOMAINS`: comma-separated hostnames configured for the existing Replit OIDC integration.
- `REPL_ID`: OIDC client identifier for the existing Replit authentication integration.
- `SESSION_SECRET`: long, random session signing secret.
- `ISSUER_URL`: optional OIDC issuer; defaults to the Replit OIDC issuer.
- `PORT`: optional HTTP port; defaults to 5000.

The application currently remains coupled to Replit OIDC. Do not deploy it to another cloud host and assume login will work. Select and implement the production identity provider before moving to a different host. The stable OIDC subject is now stored as the application user ID.

## Build and verification

Use Node.js 20+:

```bash
npm ci
npm run check
npm test
npm run build
npm start
```

GitHub Actions runs the same dependency installation, typecheck, domain tests, and production build.

## Database migration

The new schema is described in `shared/schema.ts` and the foundational SQL is in `migrations/0001_music_social_foundation.sql`.

Before applying it:
1. Provision a separate staging PostgreSQL database.
2. Take and verify a backup.
3. Inspect the existing database and confirm its legacy tables match the expected schema.
4. Check for duplicate non-null `(user_id, battle_id)` rows in `votes`; the migration deliberately stops if duplicates exist rather than deleting user data.
5. Apply the migration to staging and verify every table, index, and foreign key.
6. Run authenticated end-to-end tests against staging.
7. Only then schedule a production migration with a rollback/restore plan.

Example staging command:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f migrations/0001_music_social_foundation.sql
```

Do not apply this migration to production from an unreviewed branch. It has not been executed against the user's live database.

## Deliberately disabled legacy operations

The following old endpoints return a not-ready response while the secure replacements are built:
- Battle creation until server-side membership, XP, wins, and standing checks exist.
- Track submission until authenticated object-storage upload, duration extraction, rights declaration, and moderation are implemented.
- Voting until the server can verify at least 50% listening on both sides and enforce a unique vote.
- Legacy social-post trial upgrades.
- One-time PaymentIntent subscription activation. It previously marked a user active before payment confirmation and was not a recurring subscription.

Do not re-enable these endpoints by changing their status response. Implement and test the replacement server workflows first.

## Production launch blockers

- Choose the production identity provider and configure verified email/age eligibility.
- Provision and secure object storage, audio transcoding, and CDN delivery.
- Implement playback telemetry that the server can validate.
- Implement recurring Regular/VIP billing with signed, idempotent webhook processing.
- Implement moderation, reports, enforcement, appeals, and operational escalation.
- Complete copyright/DMCA, creator-rights, privacy, age, subscription, contest/prize, and payout legal reviews.
- Add monitoring, backups, recovery tests, rate limits, abuse controls, and support procedures.
