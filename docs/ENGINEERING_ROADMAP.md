# Prodigy Noted Engineering Roadmap

## Repository strategy
The legacy repository and history are preserved. All rebuild work occurs on `feature/prodigy-noted-music-social-rebuild`; do not force-push, delete history, or merge to main until the release gates pass.

## Audit baseline (2026-11-26)
Current stack: Vite, React, TypeScript, Express, Drizzle ORM, PostgreSQL, Stripe. Existing code is a prototype, not a production-ready platform.

Confirmed issues:
- `client/src/App.tsx` references `OnboardingFlow` without importing it.
- `client/src/pages/OnboardingFlow.tsx` contains pasted Markdown fences and references missing legacy components/API methods.
- CI uses Node 18, installs with npm install, and runs npm test although package.json has no test script.
- Battle card player is a visual placeholder; it does not stream audio or validate playback.
- Random/mock ranking and revenue values are not real platform metrics.
- Schema lacks the complete artist profile/follow, crew, XP/levels, assignment, listen-session, moderation, season/bracket, studio-project, and payout-ledger models.
- Vote route checks existing vote in application code but lacks database uniqueness and qualifying listen proof.
- Subscription route creates a one-time PaymentIntent and marks the user active before payment confirmation.
- Stripe webhook contains placeholder lookup logic and does not safely reconcile subscription lifecycle.
- Authentication is tied to Replit OIDC configuration; deployment identity provider must be deliberately selected and configured.

## Phase 0 — Stabilize (current)
- Fix broken onboarding and missing route import.
- Align CI with Node 20, deterministic install where lockfile exists, typecheck, build, and actual tests.
- Add testable domain rules for 50% listening threshold and competitor voting quota.
- Clearly label or remove fake player/rank/revenue behaviors.
- Document environment variables and deployment assumptions.

Exit gate: branch CI typecheck/build/tests pass; no missing imports or missing scripts.

## Phase 1 — Identity and artist profiles
Implement account identity, artist/producer/listener profiles, privacy, genres, follows, blocks, and account verification. Server-side authorization and age/jurisdiction rules must be tested.

## Phase 2 — Audio and discovery
Add signed object-storage uploads, file validation, duration extraction, transcoding, CDN playback, rights declarations, content labels, takedown state, and a rotating discovery feed with active battles and non-competing creators.

## Phase 3 — Battle/voting engine
Represent exactly two immutable battle entries. Add randomized balanced assignments, server-validated playback sessions, 50%-per-side qualification, one-vote database uniqueness, fraud controls, audit events, and appeals.

## Phase 4 — Billing and progression
Use recurring Stripe Checkout subscriptions with configured Price IDs. Verify signed, idempotent webhooks and reconcile all subscription lifecycle events. Implement Regular/VIP vote quotas (5/3) and every-third-cycle one-vote incentive as configurable policy. Add XP, wins, levels, and unlock rules. Free voting remains open.

## Phase 5 — Crews
Add crew, membership, invitation, leadership handoff, roles, crew progression, and crew battle authorization. Enforce exactly one active leader.

## Phase 6 — Safety
Add comments, reporting, blocking, moderator queues, warnings, temporary suspension, permanent bans, urgent safety action, audit logs, and appeals.

## Phase 7 — Seasons/championship
Add four quarterly seasons, scoring, qualification, tie-breakers, 64 finalists, eight groups of eight, top-four advancement, and 32/16/8/4/2/champion bracket. Test deterministic seeding.

## Phase 8 — Studio
Start with recording/import, multitrack timeline, editing, autosave, and export. Add effects, presets, versions, collaboration permissions, and sync incrementally.

## Phase 9 — Rewards/payouts
Build auditable prize accounting and payout ledger; simulate in test mode. Enable real transfers only after provider setup, recipient verification, tax/legal review, and explicit admin controls.

## Release levels
- Prototype: mock/local behavior.
- Internal alpha: authenticated workflows and backend integration under test.
- Private beta: core flows work, privacy/security review completed, controlled cohort and incident response ready.
- Public launch: legal, payment, moderation, monitoring, backup/recovery, privacy and support gates complete.
