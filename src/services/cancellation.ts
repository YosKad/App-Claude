// Cancellation service — models how "cancel this for me" actually works.
//
// There is no magic button that cancels any subscription. In the real world a
// subscription manager cancels through one of four routes, and this module
// picks the right one and drives it. Today the driver is a realistic in-memory
// mock; in production the same interface is backed by a real backend (provider
// APIs, an ops/concierge queue, or RPA agents). See
// docs/HOW_CANCELLATION_WORKS.md.
import type { Subscription } from "../domain/types";

/** The four real-world ways a subscription can be cancelled. */
export type CancellationMethod =
  | "provider_api" // the provider exposes an official cancel API/partnership
  | "store_deeplink" // billed by Apple/Google — user must confirm in settings
  | "concierge" // a human ops agent cancels on the user's behalf
  | "rpa"; // an automated agent logs in and cancels

export type CancellationPhase =
  | "queued"
  | "contacting"
  | "confirming"
  | "confirmed"
  | "needs_user"
  | "failed";

export interface CancellationEvent {
  phase: CancellationPhase;
  message: string;
}

export interface CancellationOutcome {
  ok: boolean;
  phase: "confirmed" | "needs_user" | "failed";
  method: CancellationMethod;
  /** Provider confirmation reference when we succeed. */
  confirmationId?: string;
  /** For store-billed subs: where to send the user to finish. */
  deepLink?: string;
  /** Human-readable reason on needs_user / failed. */
  reason?: string;
}

export interface CancellationService {
  cancel(
    sub: Subscription,
    onEvent: (e: CancellationEvent) => void,
  ): Promise<CancellationOutcome>;
}

/**
 * Providers we have a direct cancellation integration with. In production this
 * comes from the backend; here it's a small illustrative registry.
 */
const API_PARTNERS = new Set<string>(["spotify", "nyt"]);

/**
 * Decide which route to use for a given subscription. Pure and unit-tested.
 * Order matters: store billing overrides everything because the platforms
 * forbid third parties from cancelling their subscriptions directly.
 */
export function chooseMethod(sub: Subscription): CancellationMethod {
  const billing = sub.billing ?? "card";
  if (billing === "apple" || billing === "google") return "store_deeplink";
  if (API_PARTNERS.has(sub.id)) return "provider_api";
  return "concierge";
}

const DEEP_LINKS: Record<string, string> = {
  apple: "itms-apps://apps.apple.com/account/subscriptions",
  google: "https://play.google.com/store/account/subscriptions",
};

function methodLabel(m: CancellationMethod): string {
  switch (m) {
    case "provider_api":
      return "the provider";
    case "store_deeplink":
      return "the App Store";
    case "concierge":
      return "our cancellation team";
    case "rpa":
      return "the provider";
  }
}

export interface MockOptions {
  /** Delay between phases, ms. 0 in tests, ~550 in the app. */
  stepMs?: number;
  /** Force an outcome for testing. */
  forceOutcome?: "confirmed" | "needs_user" | "failed";
}

/**
 * Realistic mock backend. Emits the same phase sequence a real request would,
 * with method-appropriate messaging, and resolves to a structured outcome.
 */
export class MockCancellationService implements CancellationService {
  constructor(private opts: MockOptions = {}) {}

  async cancel(
    sub: Subscription,
    onEvent: (e: CancellationEvent) => void,
  ): Promise<CancellationOutcome> {
    const stepMs = this.opts.stepMs ?? 550;
    const method = chooseMethod(sub);
    const wait = () =>
      stepMs > 0 ? new Promise((r) => setTimeout(r, stepMs)) : Promise.resolve();

    onEvent({ phase: "queued", message: "Request received" });
    await wait();
    onEvent({
      phase: "contacting",
      message: `Contacting ${methodLabel(method)}`,
    });
    await wait();
    onEvent({ phase: "confirming", message: "Confirming cancellation" });
    await wait();

    const outcome = this.resolveOutcome(sub, method);
    onEvent({
      phase: outcome.phase,
      message:
        outcome.phase === "confirmed"
          ? "Done — you're safe"
          : outcome.phase === "needs_user"
            ? "One tap needed from you"
            : "Couldn't cancel automatically",
    });
    return outcome;
  }

  private resolveOutcome(
    sub: Subscription,
    method: CancellationMethod,
  ): CancellationOutcome {
    const forced = this.opts.forceOutcome;

    if (forced === "failed" || (!forced && false)) {
      return {
        ok: false,
        phase: "failed",
        method,
        reason: "The provider didn't confirm. We'll retry and keep you posted.",
      };
    }

    // Store-billed subscriptions can't be cancelled by us — the platforms
    // require the user to confirm in their own subscription settings.
    if (method === "store_deeplink" && forced !== "confirmed") {
      const billing = sub.billing ?? "card";
      return {
        ok: false,
        phase: "needs_user",
        method,
        deepLink: DEEP_LINKS[billing],
        reason:
          billing === "apple"
            ? "Apple bills this one, so it's cancelled in Settings › Apple Account › Subscriptions. Tap below and we'll take you there."
            : "Google bills this one, so it's cancelled in Play Store subscriptions. Tap below and we'll take you there.",
      };
    }

    return {
      ok: true,
      phase: "confirmed",
      method,
      confirmationId:
        "SS-" + sub.id.slice(0, 3).toUpperCase() + "-" + randomRef(),
    };
  }
}

function randomRef(): string {
  return Math.random().toString(36).slice(2, 8).toUpperCase();
}

/** Default instance used by the app UI. */
export const cancellationService: CancellationService =
  new MockCancellationService({ stepMs: 550 });
