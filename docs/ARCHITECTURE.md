# SubSentry — Architecture

A deliberately simple, well-layered structure so logic stays testable and the UI
stays thin.

## Layers

```
src/
  domain/     Pure business logic — no React, no I/O. Fully unit-tested.
    types.ts      Core data shapes (Subscription, Alert, ...)
    money.ts      Cost normalisation, totals, category breakdown, formatting
    dates.ts      Calendar-day math and relative phrasing
    alerts.ts     Watchdog: trial-ending / price-hike / unused detection
    savings.ts    Savings summaries from cancelled subs
  data/
    seed.ts       Realistic starter subscriptions + the app's "today"
  state/
    store.tsx     React context + useReducer; all actions and navigation stack
  components/     Reusable UI (TabBar, Sparkline)
  screens/        One component per screen; reads state, renders, dispatches
  App.tsx         Routes the current screen from the navigation stack
  main.tsx        Entry point; wraps App in the store provider
```

### Why this shape

- **Domain is pure and framework-free.** Every number the user sees — the
  monthly total, the "+50%" hike, the "$215/yr saved" — comes from a function in
  `domain/` that can be tested in milliseconds without a browser. This is where
  correctness lives.
- **State is a single reducer.** All mutations (cancel, restore, toggle,
  upgrade, navigate) go through `reducer()`, which is a pure function too, so it
  is unit-tested directly.
- **Screens are thin.** They select from state, call domain functions, and
  dispatch actions. No business rules hide in components.

## Navigation

A minimal stack in `state.stack`. `navigate` pushes, `back` pops, `selectTab`
resets to a root tab. This avoids a router dependency while giving real
push/back behaviour — and, being part of the reducer, it is unit-tested.

## Determinism

`data/seed.ts` fixes `TODAY`, so alerts and countdowns ("charges tomorrow") are
stable and testable. In production this becomes the real current date.

## Testing strategy

| Level | Tool | Covers |
|-------|------|--------|
| Unit | Vitest | domain logic + state reducer (`*.test.ts`) |
| End-to-end | Playwright | the built app in a real browser (`tests/e2e.mjs`) |

The E2E suite asserts behaviour, not pixels: it cancels a subscription and
checks the total actually drops, the savings badge appears, and the alert
disappears — the things that would embarrass us if they broke.

## Path to native (iOS + Android)

The app is a self-contained static build (`vite build`, relative `base`). Adding
Capacitor wraps that build in a native shell for both platforms; the
`connect email/bank` and `push notification` hooks become native plugins. No
UI rewrite required.
