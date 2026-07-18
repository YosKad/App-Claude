import { describe, it, expect } from "vitest";
import { savingsSummary, yearlySavingOf } from "./savings";
import type { Subscription } from "./types";

function sub(partial: Partial<Subscription>): Subscription {
  return {
    id: "x", name: "X", glyph: "X", color: "#000", category: "Other",
    status: "cancelled", price: 10, cycle: "monthly",
    nextCharge: "2026-08-01", startedOn: "2026-01-01", lastUsed: null,
    priceHistory: [], ...partial,
  };
}

describe("savingsSummary", () => {
  it("is empty for no cancellations", () => {
    expect(savingsSummary([])).toEqual({ count: 0, monthly: 0, yearly: 0 });
  });
  it("sums normalised monthly cost and annualises", () => {
    const s = savingsSummary([
      sub({ price: 17.99 }),
      sub({ price: 120, cycle: "yearly" }), // 10/mo
    ]);
    expect(s).toEqual({ count: 2, monthly: 27.99, yearly: 335.88 });
  });
});

describe("yearlySavingOf", () => {
  it("annualises a single subscription", () => {
    expect(yearlySavingOf(sub({ price: 17.99 }))).toBe(215.88);
  });
});
