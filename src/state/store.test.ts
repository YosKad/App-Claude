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
