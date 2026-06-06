# SmokeTrace 🌬️

**Quit smoking. Predict cravings before they become relapses.**

SmokeTrace is a mobile-first smoking-cessation and relapse-prevention web app.
It predicts when a user is likely to relapse and helps them intervene *before*
they smoke, through a transparent relapse-risk engine, craving logging,
behavioral analytics, trigger mapping, an emergency craving mode, and
accountability tools.

The experience blends **Duolingo-style** habit reinforcement, **Calm-style**
wellness UX, and **Apple Health-style** dashboards. The tone is supportive,
optimistic, nonjudgmental, and data-driven.

> ⚠️ **Disclaimer:** SmokeTrace provides behavioral support and wellness
> guidance, **not medical advice**. It is not a medical device and does not
> diagnose, treat, or cure addiction. If you are in crisis or experiencing a
> medical emergency, contact your local emergency services or a healthcare
> professional. (US: 911 · 988 Suicide & Crisis Lifeline · 1-800-QUIT-NOW.)

---

## ✨ Features

- **Relapse-risk prediction** — a transparent, rule-based engine scores risk
  0–100 (low / moderate / high / critical) from cravings, stress, sleep,
  recent activity, triggers, location, and time of day, and recommends a
  fitting intervention.
- **Craving logging** — fast check-ins (intensity, mood, stress, sleep, trigger,
  location, outcome) that feed the risk engine.
- **Emergency craving mode** — a full-screen rescue flow: a 5-minute urge timer,
  guided breathing, one-tap accountability reach-out, coping tips, and
  nonjudgmental relapse recovery.
- **Progress & analytics** — Recharts dashboards: smoke-free streak, cigarettes
  avoided, money saved, craving trends, stress vs. cravings, smoking events,
  common triggers, and your best coping strategies.
- **Trigger locations** — a personal map of high-risk places with an interactive
  map (Leaflet + OpenStreetMap) and a "use my current location" capture.
- **Accountability** — store supportive contacts and fire off a pre-written
  check-in via your phone's SMS or email.
- **Onboarding** — a 5-step flow that builds a personalized quit profile.
- **Auth & security** — Supabase email/password auth with protected routes and
  **row-level security** so users only ever see their own data.
- **Polish** — mobile-first, responsive, soft gradients, rounded cards, a
  calming palette, and full **dark mode**.

---

## 🧱 Tech stack

| Layer        | Choice                                             |
| ------------ | -------------------------------------------------- |
| Framework    | Next.js (App Router) + React 19                    |
| Language     | TypeScript                                         |
| Styling      | Tailwind CSS + shadcn/ui (Radix primitives)        |
| Auth / DB    | Supabase (PostgreSQL) with `@supabase/ssr`         |
| Charts       | Recharts                                           |
| Maps         | Leaflet + react-leaflet (OpenStreetMap tiles)      |
| Forms        | React Hook Form + Zod                              |
| Deployment   | Vercel                                             |

---

## 🚀 Getting started

### 1. Prerequisites

- Node.js 18.18+ (Node 20+ recommended)
- A [Supabase](https://supabase.com) project

### 2. Install

```bash
npm install
```

### 3. Configure environment variables

```bash
cp .env.example .env.local
```

Fill in `.env.local`:

| Variable                        | Where to find it                                              |
| ------------------------------- | ------------------------------------------------------------ |
| `NEXT_PUBLIC_SUPABASE_URL`      | Supabase → Project Settings → API → Project URL              |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase → Project Settings → API Keys → Publishable / anon key |
| `NEXT_PUBLIC_APP_URL`           | `http://localhost:3000` in dev; your deployed URL in prod    |

`SUPABASE_SERVICE_ROLE_KEY` is optional and not used by the app today; only set
it if you add server-side features that must bypass row-level security.

### 4. Set up the database

See **Supabase setup** below, then:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

---

## 🗄️ Supabase setup

1. Create a new project at [supabase.com](https://supabase.com). When creating
   it, enable **"Automatically expose new tables"** (under Data API) so the
   tables created by the schema are reachable. Row-level security still protects
   every row.
2. **Enable Email auth:** Authentication → Sign In / Providers → Email. For the
   smoothest local testing, turn **off "Confirm email"** so new sign-ups get a
   session immediately and go straight to onboarding. With confirmation on,
   users confirm via email and are routed through `/auth/callback`.
3. **Run the schema migration** (next section).
4. Copy your API keys into `.env.local`.

### Database migration

The full schema — tables, indexes, triggers, and **row-level security
policies** — lives in [`supabase/schema.sql`](supabase/schema.sql).

**Option A — SQL Editor (quickest):**
Open Supabase → SQL Editor → paste the contents of `supabase/schema.sql` → Run.

**Option B — Supabase CLI:**

```bash
supabase login
supabase link --project-ref <your-project-ref>
supabase db execute --file supabase/schema.sql
```

What the schema provides:

- Tables: `profiles`, `user_quit_profiles`, `cravings`, `smoking_events`,
  `interventions`, `trigger_locations`, `accountability_contacts`,
  `coach_messages`, `achievements`.
- A trigger that auto-creates a `profiles` row on sign-up (`handle_new_user`).
- An `updated_at` trigger on `user_quit_profiles`.
- **RLS enabled on every table**, with policies restricting each row to its
  owner (`auth.uid()`).

> Note: `coach_messages` is included for forward compatibility but is not used by
> the current app. It is harmless to leave in place.
>
> Type generation (optional): the app ships with hand-written domain types in
> `src/lib/types.ts` and narrows query results to them, so it builds without a
> live DB connection.

---

## ☁️ Deploy to Vercel

1. Push this repo to GitHub/GitLab/Bitbucket.
2. In [Vercel](https://vercel.com), **Add New → Project** and import the repo.
   Vercel auto-detects Next.js — no special build settings needed
   (`npm run build`).
3. Add the environment variables (Project → Settings → Environment Variables):
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `NEXT_PUBLIC_APP_URL` → your production URL (e.g. `https://smoketrace.vercel.app`)
4. In **Supabase → Authentication → URL Configuration**, add your Vercel URL to
   **Site URL** and **Redirect URLs** (include `https://<your-app>/auth/callback`).
5. **Deploy.** 🎉

The app uses no local filesystem state and is fully serverless-compatible.

---

## 📁 Project structure

```
src/
  app/
    (auth)/            login, signup, auth server actions
    (app)/             authenticated app (shell + onboarding-gated)
      dashboard/       home dashboard
      cravings/        craving logging + actions
      progress/        analytics
      triggers/        trigger locations CRUD + interactive map
      accountability/  accountability contacts CRUD
      settings/        profile + quit profile + danger zone
    api/               risk-score, cravings, interventions, smoking-events
    auth/callback/     email-confirmation handler
    emergency/         full-screen Emergency Craving Mode
    onboarding/        5-step onboarding flow
    privacy/           privacy & medical disclaimer
    logout/            sign-out route
    page.tsx           landing page
  components/          UI primitives (ui/) + feature components
  lib/
    risk/              calculateRiskScore + current-risk helpers
    supabase/          browser/server/middleware clients + queries
    analytics.ts       chart aggregations
    calculations.ts    streak / cigarettes-avoided / money-saved
    validations.ts     Zod schemas
    types.ts           domain types
  middleware.ts        session refresh + route protection + onboarding routing
supabase/schema.sql    full schema + RLS
```

### Risk engine

[`calculateRiskScore(input)`](src/lib/risk/calculateRiskScore.ts) returns a
`score` (0–100), a `level`, the top contributing `factors`, and a recommended
`intervention`. Point budget: craving intensity (≤25), stress (≤20), poor sleep
(≤15), recent craving frequency (≤15), recent relapse (≤15), known trigger
(≤10), plus smaller location and time-of-day modifiers. A future ML model can be
swapped in behind the same interface.

### REST API

All routes require an authenticated session and respect RLS:

| Route                  | Methods      | Purpose                                  |
| ---------------------- | ------------ | ---------------------------------------- |
| `/api/risk-score`      | POST         | Score a given input, or current risk     |
| `/api/cravings`        | GET, POST    | List / create cravings                   |
| `/api/smoking-events`  | GET, POST    | List / create smoking events             |
| `/api/interventions`   | GET, PATCH   | List / update interventions              |

---

## 🛣️ Future roadmap

Built intentionally as a focused MVP, with clean seams for:

- 📱 **React Native** companion app
- 📍 **True background geofencing** (the `trigger_locations` model is ready)
- 🔔 **Push notifications** & **Twilio** accountability alerts
- ⌚ **Apple HealthKit / Fitbit** + **wearable HRV** stress tracking
- 🧠 **Machine-learning** risk model (drop-in behind the `calculateRiskScore`
  interface) and personalized reinforcement learning
- 💬 An optional **AI coaching** layer
- 🩺 **Clinician** and **employer wellness** dashboards

---

## 📜 Scripts

```bash
npm run dev     # start the dev server
npm run build   # production build
npm run start   # serve the production build
npm run lint    # ESLint
```

---

## 🔒 A note on relapse & tone

Relapse is treated as **recoverable progress, not failure**. Copy throughout the
app is deliberately supportive and shame-free, because that's what actually
helps people quit.
