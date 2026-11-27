# Prodigy Noted 🎶

Prodigy Noted is a music-first social network and competitive artist platform. Artists publish music, listeners discover and vote, creators compete in solo and crew battles, and qualified winners progress through quarterly seasons toward an annual 64-contestant championship.

The competitive inspiration is the community-driven music battle experience of the former RocBattle platform. Prodigy Noted has its own product identity and implementation.

## Product pillars

- **Music discovery:** a rotating home feed featuring active battles and independent artists who are not currently competing.
- **Artist profiles:** music catalogs, genre, biography, battle history, wins, experience, rankings, awards, and crew membership.
- **Fair voting:** free members can vote; every vote requires listening to at least 50% of each competing track.
- **Earned competition:** Regular and VIP subscriptions unlock competition only when experience, wins, voting participation, verification, and account standing requirements are met.
- **Crews:** one leader/admin per crew, invitations, collaboration, and crew battles.
- **Seasons:** four quarterly competitions feed an annual 64-person championship: eight groups of eight, top four advance, then 32/16/8/4/2 and Grand Champion.
- **Creator studio:** staged roadmap for recording, import, multitrack editing, effects, autosave, export, and collaboration.
- **Community safety:** strong language in music is not automatically misconduct; bullying, threats, doxxing, vote manipulation, and targeted harassment are prohibited.

## Repository status

This is an active rebuild branch and is not yet production-ready. Legacy repository history is preserved. See:
- [Product requirements](docs/PRODUCT_REQUIREMENTS.md)
- [Engineering roadmap and current audit](docs/ENGINEERING_ROADMAP.md)
- [Deployment and migration notes](docs/DEPLOYMENT.md)

## Technology

- Frontend: React, TypeScript, Vite
- Backend: Node.js, Express, TypeScript
- Database: PostgreSQL with Drizzle ORM
- Payments: Stripe integration exists in legacy code; recurring subscriptions and payouts must be rebuilt and verified.

## Local development

Requirements: Node.js 20+ and npm.

```bash
npm ci
npm run dev
```

Quality checks:

```bash
npm run check
npm test
npm run build
```

Configure required environment variables locally. Never commit credentials, session secrets, database passwords, payment keys, or private audio URLs.

## Legal and trust requirements

Copyright and music licensing, samples, covers/remixes, DMCA procedures, subscription disclosures, contest/prize rules, age eligibility, privacy, moderation, and payout compliance require qualified review before public launch. Product documentation is not legal advice.
