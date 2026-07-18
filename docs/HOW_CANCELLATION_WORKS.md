# How "Cancel this for me" actually works

This is the honest engineering answer to *"when I tap cancel Netflix, what happens
behind the scenes?"* — both what the app does today and what production needs.

## There is no universal "cancel" button

No API lets one app cancel any subscription anywhere. A subscription manager
cancels through **one of four real routes**, chosen per subscription. SubSentry
picks the route in `chooseMethod()` (`src/services/cancellation.ts`) and drives
it through the `CancellationService` interface.

| Method | When it's used | What happens |
|--------|----------------|--------------|
| `provider_api` | Provider offers an official cancel API / partnership | Backend calls the provider's API with the user's authorization and gets a confirmation reference. |
| `store_deeplink` | Subscription is billed by **Apple or Google** | The app **cannot** cancel it — the platforms forbid third parties from doing so. We deep-link the user to *Settings › Subscriptions* (iOS) or *Play Store › Subscriptions* (Android). |
| `concierge` | Card/PayPal-billed provider with no API (e.g. Netflix) | A back-office agent (human or assisted) cancels on the user's behalf using the authorization the user granted, then records the confirmation. |
| `rpa` | Card-billed, automatable login flow | An automated agent logs in and completes the provider's cancel flow. Brittle and provider-specific; used only where reliable. |

### The Apple/Google rule is not optional

Apple (Settings › Apple Account › Subscriptions) and Google (Play subscriptions)
are the **only** places their subscriptions can be cancelled. Any app that claims
to auto-cancel an App Store subscription is misleading users and will be rejected.
SubSentry surfaces this truthfully — see the `needs_user` outcome and the
"Open subscription settings" screen.

## The request lifecycle

Every cancellation is asynchronous and moves through phases the UI reflects live:

```
queued → contacting → confirming → confirmed        (success, with a reference)
                                  ↘ needs_user        (store-billed: finish in Settings)
                                  ↘ failed            (retry / notify the user)
```

Crucially, the app only marks a subscription cancelled **after** the service
returns `confirmed` — never optimistically. (`src/screens/Concierge.tsx`
dispatches `cancelSub` inside the `confirmed` branch only.)

## What's real today vs. what production needs

**Today (v0.1):** `MockCancellationService` runs the exact same phase sequence and
outcome logic against in-memory data, so the whole flow — including the honest
store-billed path and the failure path — is real and unit-/E2E-tested. What it
does *not* do is contact a real provider.

**For production, the same `CancellationService` interface is backed by:**

1. **A backend service** that owns the cancellation queue, retries, and audit log.
2. **User authorization** to act on their behalf — an explicit mandate captured at
   request time (required legally and by the providers). Without it we can only
   deep-link.
3. **Account linking** via a provider like **Plaid** (read-only) to *detect*
   subscriptions and confirm a charge stopped after cancellation.
4. **Provider integrations**: official APIs where they exist; a vetted
   **operations team** for concierge cancellations; RPA agents where safe.
5. **Confirmation capture**: store the provider's confirmation email/reference so
   the "receipt" shown on the success screen is a real artifact.

## Why it's built behind an interface

`CancellationService` is a single seam. Swapping `MockCancellationService` for
`HttpCancellationService` (talking to the backend) changes **one line** in
`src/services/cancellation.ts` — no screen or state code changes. The mock also
stays as the test double, so QA never depends on live providers.
