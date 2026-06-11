# LeadRelay

A lead marketplace for trade contractors: homeowner job leads get posted, contractors browse and buy them, sellers get paid. Next.js web app + React Native (Expo) mobile app sharing one backend.

## Stack

| Piece | Tech |
|---|---|
| Web + API | Next.js 14 (App Router), Tailwind |
| Mobile | Expo SDK 56 / React Native, expo-router (in [`mobile/`](mobile)) |
| Database | Supabase Postgres via Prisma |
| Auth | Supabase Auth — cookies on web, `Authorization: Bearer` token from mobile |
| Payments | Stripe Checkout (one-time lead purchases + Pro/Elite subscriptions) |
| Email | Resend (lead alerts, weekly/monthly reports) |
| Jobs | Vercel cron → `/api/cron/*` (cleanup, weekly summary, monthly report) |

The API degrades gracefully when services aren't configured: without Stripe keys, buy/upgrade endpoints return a friendly 503; without a Resend key, emails are skipped and logged. The production build requires no secrets.

## Local setup

```bash
npm install                 # root deps (web)
cp .env.example .env        # fill in (see below)
npx prisma db push          # create tables in Supabase
npm run db:seed             # 6 sample leads + demo users
npm run dev                 # web + API on http://localhost:3000
```

Required in `.env`:
- `DATABASE_URL` / `DIRECT_URL` — Supabase → Connect → ORMs → Prisma (password must be URL-encoded)
- `NEXT_PUBLIC_SUPABASE_URL` / `NEXT_PUBLIC_SUPABASE_ANON_KEY` — Supabase → Settings → API
- `ADMIN_EMAIL` — sign up with this email to get the admin console
- `CRON_SECRET` — any long random string

Optional until go-live: `STRIPE_*` (payments), `RESEND_API_KEY` + `EMAIL_FROM` (email).

### Mobile

```bash
cd mobile
npm install
cp .env.example .env        # same Supabase values, EXPO_PUBLIC_ prefixed
npx expo start              # scan the QR with Expo Go (same Wi-Fi)
```

Set `EXPO_PUBLIC_API_URL` to your machine's LAN IP (e.g. `http://192.168.0.114:3000`) so a phone can reach the dev API; Android emulators can use `http://10.0.2.2:3000`.

### Notes

- Demo users from the seed exist only in Prisma (not Supabase Auth) — create your own account via `/signup`.
- If Supabase email confirmation is ON (default), signup sends a confirm link; with it OFF, signup logs straight in. Toggle: Supabase → Authentication → Sign In / Providers → Email.
- Windows: if `prisma generate` fails with `EPERM ... query_engine-windows.dll.node`, stop running node processes (they lock the engine DLL) and retry.

## Go-live runbook

1. **Stripe** (test mode first): create account → copy `STRIPE_SECRET_KEY` → create two recurring prices (Pro $29/mo, Elite $99/mo) → set `STRIPE_PRICE_PRO` / `STRIPE_PRICE_ELITE`. For webhooks locally: `stripe listen --forward-to localhost:3000/api/stripe/webhook` → `STRIPE_WEBHOOK_SECRET`.
2. **Resend**: create account + API key; verify a sending domain for `EMAIL_FROM`.
3. **Vercel**: import the repo → set all `.env` values in project settings → deploy. [`vercel.json`](vercel.json) already schedules the cron routes; set `NEXT_PUBLIC_APP_URL` to the deployed URL and create a production Stripe webhook pointing at `/api/stripe/webhook`.
4. **Mobile build**: `cd mobile && eas build --profile preview --platform android` (EAS project is configured in [`app.json`](mobile/app.json)); set `EXPO_PUBLIC_API_URL` to the production URL for release builds.

## CI

GitHub Actions ([`.github/workflows/ci.yml`](.github/workflows/ci.yml)) runs on every push/PR to `main`/`dev`: web typecheck + production build, mobile typecheck.
