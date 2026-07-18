# SubSentry 🛡️

**Stop paying for subscriptions you forgot about.** Watches your subscriptions,
warns before a free trial charges you, flags price hikes and unused ones, and
cancels them for you. One React + TypeScript codebase → **iOS + Android** via
Capacitor, and runs on the web for development.

> **📌 This README is the project's living status. Whoever works on SubSentry
> (any Claude session) should read this first, and update the three status
> sections below at the end of every working session. The owner shouldn't have
> to re-explain the project.**

---

## 📊 STATUS — updated 2026-07-18

**Where we are:** The full app is built and working as a web app, with all flows
tested (73 unit tests + end-to-end browser QA, all green). App icon + splash,
native status-bar styling, and keyboard-focus a11y are done. It is **not yet a
native app** — the iOS/Android projects get generated on the owner's Mac (see
"Needs the owner" below). Nothing is half-finished or broken.

**Branch:** `claude/mobile-app-concepts-8mvap4` (always work here; commit + push
when a piece is done and green).

---

## ✅ DONE

- **10 screens, all interactive:** onboarding, home, subscription detail,
  cancel concierge, success, alerts, insights, paywall, settings, delete
  account, add subscription.
- **Real logic (unit-tested):** monthly/yearly totals, category breakdown, alert
  detection (trial-ending / price-hike / unused), savings.
- **Cancellation done honestly:** four real routes; Apple/Google-billed subs are
  NOT fake-cancelled — the app sends you to system settings. See
  `docs/HOW_CANCELLATION_WORKS.md`.
- **Pro purchase + Restore** behind a `BillingService` seam (mock now, native
  plugin later). Auto-renew disclosure + Terms/Privacy shown.
- **Account & data deletion** flow (store requirement).
- **Add your own subscriptions** (validated form).
- **Local persistence** — state survives app restarts.
- **Design/compliance:** safe areas (notch/Dynamic Island/home indicator),
  responsive layout, 44–48px touch targets, dark UI.
- **Capacitor configured** (config + scripts); ready for `cap add` on a Mac.
- **App icon + splash** drawn (`resources/`), status-bar styling wired
  (`src/native/init.ts`), keyboard-focus a11y across all controls.

## 🔜 NEXT (in priority order)

1. **[Mac] Generate native apps** — run `docs/NATIVE_SETUP.md`, sign, run on a
   device. *(Owner has a Mac tomorrow.)*
2. **[Mac] Real in-app purchases** — swap the mock `BillingService` for
   RevenueCat/StoreKit + Play Billing; create products `pro_monthly` /
   `pro_yearly`.
3. **Bank/email sync** via Plaid (read-only) — replaces the demo data.
4. Privacy forms, screenshots, demo account → **submit** (see checklist).

## ⏳ NEEDS THE OWNER (blocking native launch)

- **Apple Developer + Google Play accounts** — owner has both ✅ (Apple can take
  ~a day to finish verifying).
- **4 quick answers** for the native setup:
  1. Bundle ID — `com.subsentry.app` or your own?
  2. Apple Team ID (Xcode shows it after you sign in; you keep all credentials).
  3. RevenueCat vs. raw StoreKit for purchases? *(recommended: RevenueCat.)*
  4. iOS first, or iOS + Android together?
- **A Mac** for the iOS build steps (Xcode) — used in `docs/NATIVE_SETUP.md`.

---

## Commands

```bash
npm install
npm run dev          # dev server
npm test             # 73 unit tests
npm run build        # production build
npm run preview      # serve build on :4173
npm run test:e2e     # end-to-end browser QA (build + preview must be running)
```

## Working agreement (for any Claude session)

- Work on branch `claude/mobile-app-concepts-8mvap4`; commit + push each finished,
  green piece.
- **Keep the logic pure and tested.** Business rules live in `src/domain/` and
  `src/services/` behind interfaces — add a unit test with any new rule.
- **Verify before claiming done:** `npm test` and `npm run test:e2e` must pass.
- **Update this README's STATUS / DONE / NEXT sections** before ending a session.

## Docs

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — how the code is layered.
- [`docs/HOW_CANCELLATION_WORKS.md`](docs/HOW_CANCELLATION_WORKS.md) — how "cancel
  for me" really works.
- [`docs/LAUNCH_CHECKLIST.md`](docs/LAUNCH_CHECKLIST.md) — Apple + Google
  publishing requirements, with status.
- [`docs/NATIVE_SETUP.md`](docs/NATIVE_SETUP.md) — the Mac runbook to build the
  iOS/Android apps.
