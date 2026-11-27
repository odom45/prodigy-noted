# Prodigy Noted Product Requirements

## Product vision
Prodigy Noted is a music-first social network and competitive artist platform. It combines discovery, artist pages, public music catalogs, listener voting, solo and crew battles, progression, seasonal tournaments, and a collaborative recording studio. The competitive inspiration is the former RocBattle experience; Prodigy Noted must have its own identity, product design, and implementation.

## Core experience
- A rotating home feed showcases active battle entries and music from artists who are not currently competing.
- Artist pages show profile art, bio, genres, uploaded tracks, releases, battle history, wins/losses, XP, rankings, awards, crew membership, and collaboration invitations.
- Free members can discover, listen, follow artists, and vote in eligible battles.
- Regular and VIP subscribers can compete in solo and crew battles only after meeting progression, participation, verification, and account-standing requirements.
- A crew has exactly one active leader/admin. Members can be invited, collaborate, and enter eligible crew battles.
- The product roadmap includes an in-app multitrack studio with recording/import, editing, plugins/effects, autosave, export, and collaboration rooms.

## Battle and vote integrity
Each battle has exactly two competing sides. A member can vote only after listening to at least 50% of each side's canonical track duration. Both sides have the same threshold and comparable playback opportunity. The server must validate listen sessions; client progress alone is never proof. Seeking, replaying the same segment, playback-rate manipulation, reconnects, and background playback must be considered. Enforce one vote per member per battle with a database uniqueness constraint and transactional write. Log assignment, listen qualification, vote, timestamps, and fraud/moderation signals. Provide a results appeal process.

Free voting remains open. Randomized voting assignments should be balanced by genre and event and avoid repeatedly assigning the same artists to the same listener.

## Competition membership and progression
- Regular competitors complete five assigned qualifying votes per participation cycle.
- VIP competitors complete three assigned qualifying votes per participation cycle.
- Every third cycle uses a one-vote requirement as an incentive.
- Cycle duration, reset, carryover, and missed-cycle behavior must be configurable.
- These competitor participation rules do not remove free members' ability to vote.
- Solo/crew competition requires an active paid entitlement, verified account and eligibility, configured XP/win thresholds, completed voting participation, and good community standing.
- XP must be earned through auditable activity; no XP for spam, fake plays, or vote manipulation. Show the user exactly what remains to unlock the next level.

## Crews
One active leader/admin per crew. Leaders manage invitations, approvals, roster, settings, battle submissions, and audited leadership transfer. Crew battles have configured roster, XP, win, participation, subscription, and conduct requirements. Members can accept/decline invitations and collaborate. Crew spaces require report, block, and privacy controls.

## Quarterly seasons and annual championship
Run four quarterly seasons with published eligibility, entry windows, battle rules, voting/judging, tie-breakers, prizes, and appeals. Quarterly results qualify artists for the annual 64-person championship. Group stage: eight groups of eight; top four from each group advance. Knockout rounds: 32, 16, 8, 4, 2, then Grand Champion. Seeding, group allocation, results, replacements, disqualifications, and appeals must be auditable and publicly explainable.

## Studio roadmap
Build an original browser-based studio experience, not a copy of another company's proprietary interface. Planned features: microphone recording and audio import; multitrack timeline; trim/split/move/loop; non-destructive editing; volume/pan/mute/solo; EQ, compression, reverb, delay, limiter; presets; autosave/version history; mixdown/export; crew collaboration with explicit roles and permissions. Add live collaboration only after latency, sync, recovery, and recording consent are solved. Do not claim BandLab integration or import support without an official supported API and user authorization.

## Community standards
Strong language, explicit themes, diss tracks, and challenging subject matter in music are not automatically violations. Artistic expression is distinct from conduct. Prohibit targeted bullying, harassment, threats, doxxing, stalking, hate-directed abuse, brigading, vote buying, bots, impersonation, and retaliation against voters. Criticism of music and performance is allowed when it is not a personal attack.

Standard enforcement: first substantiated non-severe violation receives a documented warning; repeated violations can lead to temporary account/competition suspension; continued or serious repeated abuse can lead to permanent ban. Credible threats, doxxing, exploitation, or urgent safety issues may require immediate protective action. Every action records reason, evidence, timestamp, moderator, appeal status, and retention policy. Provide block, mute, report, moderator review, and appeal workflows.

## Payments, rewards, and rights
Regular/VIP are explicit server-side entitlements. A payment intent or checkout start is not an active subscription. Entitlements change only from verified, idempotent billing-provider events and reconciliation. Handle renewal, cancellation, failed payment, refund, dispute, and tier change. Never grant competition access from client-provided roles or subscription flags.

Do not hard-code an assumed revenue split or promise prize pools funded by speculative future subscriptions. Model gross receipts, taxes, refunds, processing, chargebacks, storage/CDN, transcoding, moderation, support, marketing, reserves, prize commitments, and company contribution separately. Prize rules and subscription-linked competitions require qualified legal review in each launch jurisdiction. Payouts require recipient eligibility/onboarding, a documented ledger, admin review, idempotency, and legal/provider approval before real transfers.

Creators must declare rights to uploads and samples. Before launch, implement copyright complaints/takedowns, repeat-infringer handling, licensing/consent rules for collaboration, privacy, age/jurisdiction eligibility, subscription disclosures/cancellation, and data deletion. This spec is product direction, not legal advice.

## MVP order
1. Stable build, CI, authentication, database migrations.
2. Artist profiles, track upload/storage, playback, discovery feed.
3. Two-sided battles, server-validated listening, reliable voting.
4. Subscription entitlements, voting participation, XP and unlocks.
5. Crews and crew battles.
6. Reports, moderation, warning/suspension/ban, appeals.
7. Quarterly seasons and annual 64-person championship.
8. Studio recording/import, multitrack editing, effects, export, then collaboration.
9. Prize ledger and payout simulation; real payouts only after legal and financial gates.
