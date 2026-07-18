import { describe, it, expect } from "vitest";
import {
  chooseMethod,
  MockCancellationService,
  type CancellationEvent,
} from "./cancellation";
import type { Subscription } from "../domain/types";

function sub(partial: Partial<Subscription>): Subscription {
  return {
    id: "netflix", name: "Netflix", glyph: "N", color: "#000",
    category: "Streaming", status: "trial", price: 17.99, cycle: "monthly",
    nextCharge: "2026-07-19", startedOn: "2026-06-19", lastUsed: null,
    priceHistory: [], ...partial,
  };
}

describe("chooseMethod", () => {
  it("routes Apple-billed subs to the store deep link", () => {
    expect(chooseMethod(sub({ id: "icloud", billing: "apple" }))).toBe("store_deeplink");
  });
  it("routes Google-billed subs to the store deep link", () => {
    expect(chooseMethod(sub({ id: "x", billing: "google" }))).toBe("store_deeplink");
  });
  it("routes known API partners to the provider API", () => {
    expect(chooseMethod(sub({ id: "spotify", billing: "card" }))).toBe("provider_api");
  });
  it("falls back to concierge for card-billed non-partners", () => {
    expect(chooseMethod(sub({ id: "netflix", billing: "card" }))).toBe("concierge");
  });
  it("defaults missing billing to card", () => {
    expect(chooseMethod(sub({ id: "netflix", billing: undefined }))).toBe("concierge");
  });
});

describe("MockCancellationService.cancel", () => {
  const collect = async (s: Subscription, opts = {}) => {
    const events: CancellationEvent[] = [];
    const svc = new MockCancellationService({ stepMs: 0, ...opts });
    const outcome = await svc.cancel(s, (e) => events.push(e));
    return { events, outcome };
  };

  it("emits queued → contacting → confirming → confirmed for a card sub", async () => {
    const { events, outcome } = await collect(sub({ id: "netflix", billing: "card" }));
    expect(events.map((e) => e.phase)).toEqual([
      "queued", "contacting", "confirming", "confirmed",
    ]);
    expect(outcome.ok).toBe(true);
    expect(outcome.method).toBe("concierge");
    expect(outcome.confirmationId).toMatch(/^SS-/);
  });

  it("returns needs_user with a deep link for Apple-billed subs", async () => {
    const { outcome } = await collect(sub({ id: "icloud", billing: "apple" }));
    expect(outcome.ok).toBe(false);
    expect(outcome.phase).toBe("needs_user");
    expect(outcome.deepLink).toContain("apps.apple.com");
    expect(outcome.reason).toMatch(/Settings/);
  });

  it("can be forced to fail for error-path testing", async () => {
    const { outcome } = await collect(sub({}), { forceOutcome: "failed" });
    expect(outcome.ok).toBe(false);
    expect(outcome.phase).toBe("failed");
    expect(outcome.reason).toBeTruthy();
  });

  it("honours a forced confirmed outcome even for store billing", async () => {
    const { outcome } = await collect(
      sub({ billing: "apple" }),
      { forceOutcome: "confirmed" },
    );
    expect(outcome.phase).toBe("confirmed");
  });
});
