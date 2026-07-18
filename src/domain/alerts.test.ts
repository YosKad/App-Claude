import { describe, it, expect } from "vitest";
import { detectAlerts, detectHike } from "./alerts";
import type { Subscription } from "./types";

const today = "2026-07-18";

function sub(partial: Partial<Subscription>): Subscription {
  return {
    id: "x",
    name: "X",
    glyph: "X",
    color: "#000",
    category: "Other",
    status: "active",
    price: 10,
    cycle: "monthly",
    nextCharge: "2026-08-01",
    startedOn: "2026-01-01",
    lastUsed: "2026-07-15",
    priceHistory: [],
    ...partial,
  };
}

describe("detectHike", () => {
  it("returns null without at least two points", () => {
    expect(detectHike(sub({ priceHistory: [] }))).toBeNull();
    expect(detectHike(sub({ priceHistory: [{ date: "2025-01-01", price: 9 }] }))).toBeNull();
  });
  it("returns null when price did not rise", () => {
    expect(
      detectHike(
        sub({ priceHistory: [
          { date: "2025-01-01", price: 12 },
          { date: "2026-01-01", price: 10 },
        ] }),
      ),
    ).toBeNull();
  });
  it("computes the percentage increase", () => {
    expect(
      detectHike(
        sub({ priceHistory: [
          { date: "2025-01-01", price: 9.99 },
          { date: "2026-01-01", price: 14.99 },
        ] }),
      ),
    ).toEqual({ from: 9.99, to: 14.99, percent: 50 });
  });
});

describe("detectAlerts", () => {
  it("flags a trial ending within the window", () => {
    const alerts = detectAlerts(
      [sub({ id: "n", name: "Netflix", status: "trial", price: 17.99, nextCharge: "2026-07-19" })],
      today,
    );
    expect(alerts).toHaveLength(1);
    expect(alerts[0]).toMatchObject({ kind: "trial_ending", severity: "critical" });
    expect(alerts[0].detail).toContain("tomorrow");
  });

  it("does NOT flag a trial far in the future", () => {
    const alerts = detectAlerts(
      [sub({ status: "trial", nextCharge: "2026-09-01" })],
      today,
    );
    expect(alerts).toHaveLength(0);
  });

  it("flags a price hike", () => {
    const alerts = detectAlerts(
      [sub({ priceHistory: [
        { date: "2025-01-01", price: 9.99 },
        { date: "2026-01-01", price: 14.99 },
      ] })],
      today,
    );
    expect(alerts.some((a) => a.kind === "price_hike")).toBe(true);
  });

  it("flags an unused active subscription past the threshold", () => {
    const alerts = detectAlerts(
      [sub({ status: "active", lastUsed: "2026-04-01" })],
      today,
    );
    expect(alerts.some((a) => a.kind === "unused")).toBe(true);
  });

  it("does NOT flag a recently used subscription", () => {
    const alerts = detectAlerts([sub({ lastUsed: "2026-07-15" })], today);
    expect(alerts).toHaveLength(0);
  });

  it("ignores cancelled subscriptions entirely", () => {
    const alerts = detectAlerts(
      [sub({ status: "cancelled", lastUsed: "2020-01-01", nextCharge: "2026-07-19" })],
      today,
    );
    expect(alerts).toHaveLength(0);
  });

  it("sorts critical before warning before info", () => {
    const subs = [
      sub({ id: "u", status: "active", lastUsed: "2026-01-01" }), // info: unused
      sub({ id: "h", priceHistory: [
        { date: "2025-01-01", price: 9 },
        { date: "2026-01-01", price: 12 },
      ] }), // warning: hike
      sub({ id: "t", status: "trial", nextCharge: "2026-07-19" }), // critical
    ];
    const kinds = detectAlerts(subs, today).map((a) => a.severity);
    expect(kinds).toEqual(["critical", "warning", "info"]);
  });
});
