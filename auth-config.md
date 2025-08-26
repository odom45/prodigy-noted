# Google OAuth Configuration

## 🔐 Credentials
- **Client ID**: `GOOGLE_CLIENT_ID`
- **Client Secret**: `GOOGLE_CLIENT_SECRET`
- **Redirect URI (Production)**: `https://note-genius-benjaminjodom45.replit.app/api/auth/google/callback`
- **Redirect URI (Local)**: `http://localhost:5000/api/auth/google/callback`

## 🧾 Scopes
- `profile`
- `email`

## 🍪 Session
- TTL: 7 days
- Store: PostgreSQL via `connect-pg-simple`
- Table: `sessions`
- Secure cookies: Enabled in production
- Proxy trust: Enabled

## 🔄 Routes
- `/api/login`: Initiates Google login
- `/api/auth/google/callback`: Handles OAuth callback
- `/api/logout`: Destroys session and logs out

## 🧠 Notes
- `upsertUser()` ensures idempotent user creation
- `getUser()` fetches minimal user data for session hydration
- All secrets pulled from `.env` for audit safety
