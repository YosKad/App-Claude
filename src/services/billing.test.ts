import { describe, it, expect } from "vitest";
import { MockBillingService, PRODUCTS } from "./billing";

describe("MockBillingService", () => {
  it("lists the two Pro products", async () => {
    const svc = new MockBillingService({ delayMs: 0 });
    const products = await svc.getProducts();
    expect(products.map((p) => p.id)).toEqual(["pro_monthly", "pro_yearly"]);
    expect(PRODUCTS[1].badge).toContain("BEST");
  });

  it("completes a purchase and returns a transaction id", async () => {
    const svc = new MockBillingService({ delayMs: 0 });
    const r = await svc.purchase("pro_yearly");
    expect(r.ok).toBe(true);
    expect(r.phase).toBe("purchased");
    expect(r.productId).toBe("pro_yearly");
    expect(r.transactionId).toMatch(/^TXN-/);
  });

  it("reports a user-cancelled purchase without charging", async () => {
    const svc = new MockBillingService({ delayMs: 0, purchaseOutcome: "cancelled" });
    const r = await svc.purchase("pro_monthly");
    expect(r.ok).toBe(false);
    expect(r.phase).toBe("cancelled");
  });

  it("reports a payment error", async () => {
    const svc = new MockBillingService({ delayMs: 0, purchaseOutcome: "error" });
    const r = await svc.purchase("pro_monthly");
    expect(r.ok).toBe(false);
    expect(r.phase).toBe("error");
    expect(r.reason).toMatch(/not charged/i);
  });

  it("restore finds a prior purchase", async () => {
    const svc = new MockBillingService({ delayMs: 0, hasPriorPurchase: true });
    const r = await svc.restore();
    expect(r.ok).toBe(true);
    expect(r.phase).toBe("restored");
  });

  it("restore reports nothing to restore for a fresh account", async () => {
    const svc = new MockBillingService({ delayMs: 0 });
    const r = await svc.restore();
    expect(r.ok).toBe(false);
    expect(r.phase).toBe("nothing_to_restore");
  });

  it("restore succeeds after a purchase in the same session", async () => {
    const svc = new MockBillingService({ delayMs: 0 });
    await svc.purchase("pro_monthly");
    const r = await svc.restore();
    expect(r.ok).toBe(true);
    expect(r.phase).toBe("restored");
  });
});
