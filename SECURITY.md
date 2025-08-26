<<<<<<< HEAD
# 🔐 Security Policy

## Reporting Vulnerabilities
Please report via [security@prodigynoted.com](mailto:security@prodigynoted.com). We respond within 72 hours.

## Scope
Covers OAuth, Stripe payouts, session management, admin controls, and moderation logic.

## Disclosure Guidelines
Do not publicly disclose vulnerabilities until patched.

## Payout Logic Protections
- Encrypted, rate-limited payout routes
- Admin-only access to Stripe dashboards
- Automated receipts with audit trails

## Dependency Monitoring
We use Semgrep and GitHub Dependabot to scan for CVEs and misconfigurations.
=======
# Security Policy

## Audit Summary
- Last scan: August 26, 2025
- Tool: Replit Semgrep Scanner
- Result: No known vulnerabilities

## Known Advisory (Deferred)
- esbuild <=0.24.2
- Advisory: [GHSA-67mh-4wv8-2f99](https://github.com/advisories/GHSA-67mh-4wv8-2f99)
- Mitigation: No public exposure. Upgrade deferred pending Vite compatibility audit.
>>>>>>> 6f7e8e0 (Security scan passed: patched and documented)
