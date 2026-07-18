import { describe, it, expect } from "vitest";
import { loadPersisted, savePersisted, clearPersisted } from "./persistence";
import { reducer, initialState } from "./store";

/** In-memory Storage stand-in for tests. */
class FakeStorage {
  private m = new Map<string, string>();
  getItem(k: string) {
    return this.m.has(k) ? this.m.get(k)! : null;
  }
  setItem(k: string, v: string) {
    this.m.set(k, v);
  }
  removeItem(k: string) {
    this.m.delete(k);
  }
}

describe("persistence", () => {
  it("returns null when nothing is stored", () => {
    expect(loadPersisted(new FakeStorage())).toBeNull();
  });

  it("round-trips the persisted slice", () => {
    const s = new FakeStorage();
    let state = reducer(initialState, { type: "onboard" });
    state = reducer(state, { type: "upgradePro" });
    state = reducer(state, { type: "cancelSub", id: "netflix" });

    savePersisted(state, s);
    const loaded = loadPersisted(s)!;

    expect(loaded.onboarded).toBe(true);
    expect(loaded.isPro).toBe(true);
    expect(loaded.subs.find((x) => x.id === "netflix")?.status).toBe("cancelled");
  });

  it("does not persist navigation state", () => {
    const s = new FakeStorage();
    const state = reducer(initialState, {
      type: "navigate",
      screen: "detail",
      subId: "netflix",
    });
    savePersisted(state, s);
    const loaded = loadPersisted(s)! as unknown as Record<string, unknown>;
    expect(loaded.stack).toBeUndefined();
  });

  it("ignores a stale schema version", () => {
    const s = new FakeStorage();
    s.setItem("subsentry.state", JSON.stringify({ version: 999, subs: [] }));
    expect(loadPersisted(s)).toBeNull();
  });

  it("ignores corrupt JSON", () => {
    const s = new FakeStorage();
    s.setItem("subsentry.state", "{not json");
    expect(loadPersisted(s)).toBeNull();
  });

  it("clear removes the stored state", () => {
    const s = new FakeStorage();
    savePersisted(reducer(initialState, { type: "onboard" }), s);
    clearPersisted(s);
    expect(loadPersisted(s)).toBeNull();
  });
});
