# SubSentry — App Store & Play Store launch checklist

Everything Apple and Google require to approve an app like SubSentry, based on
their 2026 requirements. Status: ☐ = to do, ◐ = partially in place, ☑ = done.
Because SubSentry touches **financial data** and sells a **subscription**, the
sensitive-data and in-app-purchase sections carry the highest rejection risk.

---

## 0. Accounts & tooling
- ☐ **Apple Developer Program** membership ($99/yr).
- ☐ **Google Play Developer** account ($25 one-time) — new personal accounts must
  complete identity verification and (for personal accounts) a **closed test with
  ~12 testers for 14 days** before production access.
- ☐ Apple: build with the **iOS 26 SDK or later** (required for uploads after
  28 Apr 2026).
- ◐ Wrap the web build with **Capacitor** to produce the native iOS/Android
  binaries; configure signing (Xcode automatic signing / Android keystore).
  _Capacitor installed + configured (`capacitor.config.ts`, npm scripts); run
  `cap add ios/android` on the Mac — see docs/NATIVE_SETUP.md._

## 1. In-app purchase — the Pro subscription (highest risk)
- ◐ Sell the $5.99/mo · $39.99/yr Pro plan through **Apple StoreKit** and
  **Google Play Billing** — you may **not** use Stripe/PayPal/etc. for a digital
  subscription inside the app (Apple 3.1.1, Google Payments policy). _Built behind
  the `BillingService` seam (`src/services/billing.ts`) with a tested mock;
  swap in the native plugin (StoreKit/Play Billing bridge) to go live._
- ☑ Add a **Restore Purchases** control (Apple 3.1.1 — mandatory). _Implemented
  in the paywall, calls `billingService.restore()`._
- ☑ Subscription delivers **ongoing value** and runs **≥ 7 days** — 7-day trial +
  monthly/yearly plans across devices (Apple 3.1.2).
- ☑ Show price, billing period, and a link to terms **before** purchase;
  auto-renew disclosure text. _Paywall now shows trial→price, "auto-renews until
  cancelled", and Terms/Privacy links._
- ☐ Configure products in App Store Connect and Play Console; test with sandbox
  accounts.
- Note: this is separate from *cancelling other people's* subscriptions — that's
  our product feature, not an IAP.

## 2. Privacy — data collection & disclosure
- ☐ **Privacy policy** URL, reachable both in the store listing **and** inside the
  app.
- ☐ Apple **App Privacy "nutrition" labels**: declare every data type collected,
  why, and whether it's linked to the user (financial info, contact info, usage).
- ☐ Google Play **Data safety form**: declare collection/sharing, security
  practices (encryption in transit/at rest), and retention — **including data
  handled by any SDK** (e.g. Plaid).
- ☐ Google Play **Financial features declaration** (every app must complete it,
  even to say "none"; we will declare our financial features).
- ◐ **Account & data deletion**: an in-app path to delete the account/data, and
  disclosure of how to revoke consent (Apple 5.1.1(v); Google account-deletion
  policy — must also offer web-based deletion). _In-app delete flow built
  (Settings › Data & privacy › Delete account); backend erase + web-based
  deletion form still to add._
- ☐ Request only the permissions we use; justify any sensitive ones.

## 3. Bank / email linking (sensitive financial data)
- ☐ Integrate account linking via **Plaid** (or equivalent) with **read-only**
  scope; never store raw bank credentials (tokenized access only).
- ☐ Present clear consent screens stating exactly what is accessed and that we
  can't move money — matches the onboarding copy already in the app.
- ☐ Encrypt sensitive data in transit (TLS) and at rest (AES-256); document it in
  both privacy forms.
- ☐ If parsing email for receipts, use the minimum scope (e.g. Gmail restricted
  scopes) and pass **Google OAuth API verification / security assessment** —
  budget weeks for this.
- ☐ Comply with data-broker/financial regulations for the launch region.

## 4. Cancellation feature integrity
- ☐ Never claim to auto-cancel **Apple/Google-billed** subscriptions — deep-link
  to system settings instead (already implemented; see
  HOW_CANCELLATION_WORKS.md).
- ☐ Capture explicit user **authorization** before acting on their behalf for
  concierge/API cancellations.
- ☐ Keep an audit trail + real confirmation references.

## 5. App review submission package
- ☐ **Demo account / demo mode** with instructions so reviewers can reach every
  feature (Apple explicitly requires this for login- and subscription-gated apps).
  A seeded demo mode already exists — expose it for review.
- ☐ App must be **complete and functional** — no placeholders, no broken links,
  no "coming soon".
- ☐ Store listing: name, subtitle, description, keywords, **support URL**,
  marketing URL.
- ☐ **Screenshots** for required device sizes + optional preview video.
- ☐ **App icon** (all sizes), age rating questionnaire, category (Finance).
- ☐ Test on real devices; handle offline and error states gracefully.

## 6. Design & screen compliance (Apple HIG / Android)
- ☑ **Safe areas** honoured — content clears the notch / Dynamic Island / status
  bar (top) and the home indicator / gesture bar (bottom) via
  `env(safe-area-inset-*)` and `viewport-fit=cover`.
- ☑ **Responsive layout** — fluid within a centred mobile column; internal
  scrolling with a fixed tab bar; no fixed widths that clip on small devices.
- ☑ **Touch targets** — primary controls ≥ 44–48px (Apple 44pt / Android 48dp).
- ☑ **Dark UI** committed and legible; semantic colours for danger/warning.
- ◐ **Dynamic Type / larger text** — layout is flexible; a full large-text audit
  is still worth doing before submission.
- ☐ App **icon** (all sizes) + **splash** via `@capacitor/assets` — see
  NATIVE_SETUP §7.
- ☐ Store **screenshots** at required device sizes.
- ☐ Native **status bar** style via `@capacitor/status-bar` (dark content on our
  dark background).

## 7. Legal & content
- ☐ **Terms of Service** and the **subscription terms** (auto-renew, refunds).
- ☐ Use of third-party brand names/logos (Netflix, Spotify…) limited to nominative,
  factual reference — no implication of endorsement or partnership.
- ☐ Accessibility pass (labels, contrast, dynamic type) — already partly in place
  (ARIA roles/labels on controls).

---

## Current standing

**Built and verified now:** the full app experience, honest cancellation
behaviour (incl. the Apple/Google deep-link rule), ARIA labelling, and automated
tests. This is the "complete and functional app" bar reviewers look for.

**The gating work before submission** is mostly integrations and paperwork, not
UI: developer accounts, StoreKit/Play Billing for Pro, Plaid + (if used) Google
email-scope verification, the two privacy forms, account deletion, and the
demo-account handoff. None of it requires rewriting what's built — the code is
structured so these slot in behind existing seams.

_Sources: Apple App Review Guidelines; Apple privacy-label & account-deletion
requirements; Google Play Data safety and Financial features declaration docs
(2026)._
