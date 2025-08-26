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
