import { describe, it, expect } from "vitest";
import {
  monthlyCost,
  totalMonthly,
  totalYearly,
  categoryBreakdown,
  isBilling,
  round2,
  formatMoney,
} from "./money";
import type { Subscription } from "./types";

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
    lastUsed: "2026-07-01",
    priceHistory: [],
    ...partial,
  };
}

describe("monthlyCost", () => {
  it("passes monthly prices through", () => {
    expect(monthlyCost(sub({ price: 10.99, cycle: "monthly" }))).toBe(10.99);
  });
  it("divides yearly prices by 12", () => {
    expect(monthlyCost(sub({ price: 120, cycle: "yearly" }))).toBe(10);
  });
});

describe("isBilling", () => {
  it("counts active and trial, not cancelled", () => {
    expect(isBilling(sub({ status: "active" }))).toBe(true);
    expect(isBilling(sub({ status: "trial" }))).toBe(true);
    expect(isBilling(sub({ status: "cancelled" }))).toBe(false);
  });
});

describe("totalMonthly / totalYearly", () => {
  const subs = [
    sub({ id: "a", price: 17.99 }),
    sub({ id: "b", price: 10.99 }),
    sub({ id: "c", price: 120, cycle: "yearly" }), // = 10/mo
    sub({ id: "d", price: 99, status: "cancelled" }), // excluded
  ];
  it("sums only billing subs, normalised, without float drift", () => {
    expect(totalMonthly(subs)).toBe(38.98);
  });
  it("annualises the monthly total", () => {
    expect(totalYearly(subs)).toBe(467.76);
  });
  it("is zero for an empty list", () => {
    expect(totalMonthly([])).toBe(0);
  });
});

describe("categoryBreakdown", () => {
  it("groups, sorts by spend desc, and computes percentages", () => {
    const subs = [
      sub({ id: "a", price: 30, category: "Streaming" }),
      sub({ id: "b", price: 10, category: "Streaming" }),
      sub({ id: "c", price: 10, category: "Music" }),
      sub({ id: "z", price: 999, category: "Gaming", status: "cancelled" }),
    ];
    const rows = categoryBreakdown(subs);
    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({ category: "Streaming", monthly: 40, percent: 80 });
    expect(rows[1]).toMatchObject({ category: "Music", monthly: 10, percent: 20 });
  });
  it("returns an empty array when nothing is billing", () => {
    expect(categoryBreakdown([sub({ status: "cancelled" })])).toEqual([]);
  });
});

describe("round2", () => {
  it("kills binary float drift", () => {
    expect(round2(0.1 + 0.2)).toBe(0.3);
    expect(round2(17.99 + 10.99 + 10)).toBe(38.98);
  });
});

describe("formatMoney", () => {
  it("shows cents for fractional amounts", () => {
    expect(formatMoney(17.9)).toBe("$17.90");
    expect(formatMoney(10.99)).toBe("$10.99");
  });
  it("drops cents for whole amounts", () => {
    expect(formatMoney(40)).toBe("$40.00");
    expect(formatMoney(215, { cents: false })).toBe("$215");
  });
});
