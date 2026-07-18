# SubSentry

**Stop paying for subscriptions you forgot about.** SubSentry watches all your
subscriptions, warns you before a free trial charges you, flags price hikes and
unused "ghost" subscriptions, and cancels them for you.

One React + TypeScript codebase, built mobile-first and structured for
[Capacitor](https://capacitorjs.com/) so it ships as a native app on **iOS and
Android** — and runs on the web for development and QA.

## Quick start

```bash
npm install
npm run dev        # local dev server
npm test           # unit tests (domain + state logic)
npm run build      # production build
npm run preview    # serve the production build on :4173
node tests/e2e.mjs # end-to-end QA (drives the built app in a real browser)
```

## What's built (v0.1)

Nine screens, all working:

| Screen | What it does |
|--------|--------------|
| Onboarding | Connect email/bank, sets up the account |
| Home | Live monthly total, spend chart, top alert, subscription list |
| Detail | Price history, next charge, usage, cancel/keep |
| Concierge | Animated "cancel-for-me" flow, commits the cancellation |
| Success | Celebrates the saving |
| Alerts | Trials ending, price hikes, unused subs — grouped by urgency |
| Insights | Category donut, savings to date |
| Paywall | The $5.99/mo (or $39.99/yr) Pro upsell — real purchase + restore |
| Settings | Connected accounts, notification toggles, plan, security, privacy |
| Delete account | Store-required account & data deletion flow |

Everything on screen is **derived from data** by the pure functions in
`src/domain/` — totals, alerts, savings and dates are all unit-tested.

## Docs

- [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md) — how the code is layered.
- [`docs/HOW_CANCELLATION_WORKS.md`](docs/HOW_CANCELLATION_WORKS.md) — what really
  happens when you cancel a subscription, and why Apple/Google-billed ones can't
  be auto-cancelled.
- [`docs/LAUNCH_CHECKLIST.md`](docs/LAUNCH_CHECKLIST.md) — everything Apple and
  Google require before we can publish.
- [`docs/NATIVE_SETUP.md`](docs/NATIVE_SETUP.md) — the Mac runbook to build and
  run the iOS/Android apps.

## Quality

- **64 unit tests** across money, dates, alert detection, savings, the state
  reducer, persistence, and the cancellation + billing services (`npm test`).
- **End-to-end QA** that drives the whole user journey in a browser and asserts
  every state change — both cancellation paths, the Pro purchase/restore flow,
  reload persistence, and account deletion (`node tests/e2e.mjs`).

## Roadmap

- Add-subscription flow and manual entry
- Real email/bank sync (Plaid + inbox parsing) behind the read-only promise
- Persisted state (local storage -> backend)
- Capacitor wrap + App Store / Play Store builds
- Push notifications for trial/price alerts
