import { describe, it, expect } from "vitest";
import { reducer, initialState, currentScreen, type AppState } from "./store";

describe("reducer navigation", () => {
  it("onboard moves to home and resets the stack", () => {
    const s = reducer(initialState, { type: "onboard" });
    expect(s.onboarded).toBe(true);
    expect(currentScreen(s).screen).toBe("home");
  });

  it("navigate pushes and back pops", () => {
    let s = reducer(initialState, { type: "onboard" });
    s = reducer(s, { type: "navigate", screen: "detail", subId: "netflix" });
    expect(currentScreen(s)).toEqual({ screen: "detail", subId: "netflix" });
    s = reducer(s, { type: "back" });
    expect(currentScreen(s).screen).toBe("home");
  });

  it("back on a single-entry stack is a no-op", () => {
    const s = reducer(initialState, { type: "back" });
    expect(s.stack).toHaveLength(1);
  });

  it("selectTab resets to that root", () => {
    let s = reducer(initialState, { type: "onboard" });
    s = reducer(s, { type: "navigate", screen: "detail", subId: "netflix" });
    s = reducer(s, { type: "selectTab", screen: "insights" });
    expect(s.stack).toEqual([{ screen: "insights" }]);
  });
});

describe("reducer subscription actions", () => {
  const base: AppState = reducer(initialState, { type: "onboard" });

  it("cancelSub marks a sub cancelled and records it", () => {
    const s = reducer(base, { type: "cancelSub", id: "netflix" });
    expect(s.subs.find((x) => x.id === "netflix")?.status).toBe("cancelled");
    expect(s.lastCancelled).toBe("netflix");
  });

  it("restoreSub reactivates a sub", () => {
    let s = reducer(base, { type: "cancelSub", id: "spotify" });
    s = reducer(s, { type: "restoreSub", id: "spotify" });
    expect(s.subs.find((x) => x.id === "spotify")?.status).toBe("active");
  });

  it("does not mutate the original state array", () => {
    const before = base.subs.find((x) => x.id === "netflix")?.status;
    reducer(base, { type: "cancelSub", id: "netflix" });
    expect(base.subs.find((x) => x.id === "netflix")?.status).toBe(before);
  });

  it("addSub prepends the new sub and returns to Home", () => {
    const sub = {
      id: "disney-x", name: "Disney+", glyph: "D", color: "#000",
      category: "Streaming" as const, status: "active" as const, price: 13.99,
      cycle: "monthly" as const, nextCharge: "2026-08-15", startedOn: "2026-08-15",
      lastUsed: null, priceHistory: [],
    };
    const s = reducer(base, { type: "addSub", sub });
    expect(s.subs[0].id).toBe("disney-x");
    expect(s.subs.length).toBe(base.subs.length + 1);
    expect(currentScreen(s).screen).toBe("home");
  });
});

describe("reducer settings & pro", () => {
  it("toggleSetting flips a boolean", () => {
    const s = reducer(initialState, { type: "toggleSetting", key: "unusedNudges" });
    expect(s.settings.unusedNudges).toBe(true);
  });

  it("upgradePro sets isPro", () => {
    const s = reducer(initialState, { type: "upgradePro" });
    expect(s.isPro).toBe(true);
  });
});

describe("reducer account deletion", () => {
  it("deleteAccount wipes state back to a fresh onboarding", () => {
    let s = reducer(initialState, { type: "onboard" });
    s = reducer(s, { type: "upgradePro" });
    s = reducer(s, { type: "cancelSub", id: "netflix" });
    const wiped = reducer(s, { type: "deleteAccount" });
    expect(wiped.onboarded).toBe(false);
    expect(wiped.isPro).toBe(false);
    expect(currentScreen(wiped).screen).toBe("onboarding");
    expect(wiped.subs.find((x) => x.id === "netflix")?.status).not.toBe("cancelled");
  });
});
