# Native setup — iOS & Android (do this on your Mac)

The app is already Capacitor-ready (`capacitor.config.ts` + scripts). This turns
the web build into real iOS and Android apps you can run and submit. **iOS steps
require macOS + Xcode**, which is why they're here for your Mac day.

We'll do this together — this is the reference; ping me and I'll walk each step.

---

## 0. One-time prerequisites (Mac)

```bash
# Xcode from the App Store, then its command-line tools:
xcode-select --install
sudo xcodebuild -license accept

# CocoaPods (iOS dependency manager):
sudo gem install cocoapods           # or: brew install cocoapods

# Node 18+ (if not already):
node -v
```

For Android (optional, can be later): install **Android Studio** (includes the
SDK).

## 1. Get the project

```bash
git clone <repo-url> subsentry && cd subsentry
git checkout claude/mobile-app-concepts-8mvap4
npm install
npm test          # sanity: all unit tests should pass
npm run build     # produces dist/
```

## 2. Add the native platforms (one time)

```bash
npm run native:add:ios       # creates ios/  (runs pod install)
npm run native:add:android   # creates android/  (optional now)
npm run native:sync          # build web + copy into native projects
```

`ios/` and `android/` are git-ignored — they're generated, not source.

## 3. Run on a simulator / device

```bash
npm run native:ios       # opens Xcode
```

In Xcode: pick a simulator (e.g. iPhone 15) and press ▶. To run on your own
iPhone, plug it in, select it, and set the signing team (next step).

Android:

```bash
npm run native:android   # opens Android Studio, then press Run
```

## 4. Signing (needs your Apple account)

In Xcode → target **App** → **Signing & Capabilities**:
- Team: your Apple Developer team.
- Bundle Identifier: `com.subsentry.app` (change if you want a different one —
  tell me and I'll update `capacitor.config.ts` to match).

That's all that's needed to run on a real device.

## 5. In-app purchases (Pro subscription)

The app sells Pro through a `BillingService` seam
(`src/services/billing.ts`) that currently uses a tested mock. To make purchases
real:

1. **Recommended plugin:** RevenueCat — one integration for both stores.
   ```bash
   npm install @revenuecat/purchases-capacitor
   npx cap sync
   ```
2. In **App Store Connect** and **Play Console**, create the subscription
   products with IDs `pro_monthly` and `pro_yearly` (matching `PRODUCTS` in
   `billing.ts`).
3. I'll write `RevenueCatBillingService implements BillingService` and swap the
   one exported `billingService` line — no UI changes.
4. Test with an **Xcode StoreKit configuration file** (local) and sandbox
   accounts before going live.

## 6. Account linking (bank/email) — later, but plan for it

- Bank/subscription detection: **Plaid** (`react-plaid-link` or the Capacitor
  plugin), read-only scope.
- Email receipt parsing (optional): Gmail restricted scopes → requires Google's
  OAuth verification (weeks of lead time). See LAUNCH_CHECKLIST §3.

## 7. App icon & splash screen (required for the stores)

**Already provided** — a shield app icon and splash live in `resources/`
(`icon.png` 1024², `splash.png` / `splash-dark.png` 2732²). Just generate all the
platform sizes:

```bash
npm install -D @capacitor/assets
npx capacitor-assets generate
npx cap sync
```

To restyle the icon later, edit `scripts/icon.html` / `scripts/splash.html` and
re-run `node scripts/render-assets.mjs`.

The native **status bar** is already wired (`src/native/init.ts`, runs only on
device) — light icons on the dark background, no extra setup needed.

## 8. Submit

Follow `docs/LAUNCH_CHECKLIST.md`. Highlights: privacy nutrition labels + Google
Data safety form, Financial features declaration, demo account for review,
screenshots, app icon, and the ToS/Privacy URLs.

---

## What I'll need from you tomorrow

1. Confirm the **bundle ID** (`com.subsentry.app` or your own).
2. Your **Apple Team ID** (Xcode shows it once you sign in) — only so I can set
   config; you keep all credentials.
3. A yes/no on **RevenueCat** vs. raw StoreKit/Play Billing for purchases
   (I recommend RevenueCat).
4. Whether we launch iOS first or both together.

I can't run Xcode from my side, so on Mac day you'll run the commands and share
what you see (or screenshots), and I'll fix anything that comes up in real time.
