// Billing service — the Pro subscription purchase seam.
//
// Apple and Google REQUIRE digital subscriptions to be sold through their own
// billing (StoreKit / Google Play Billing); third-party processors are not
// allowed. This module abstracts that so the UI never talks to a store SDK
// directly. Today it's a realistic mock; in production it's backed by a
// Capacitor plugin (e.g. @revenuecat/purchases-capacitor or a StoreKit/Billing
// bridge). See docs/LAUNCH_CHECKLIST.md §1.

export type PlanId = "pro_monthly" | "pro_yearly";

export interface Product {
  id: PlanId;
  title: string;
  /** Localised price string from the store, e.g. "$39.99". */
  price: string;
  period: string;
  /** Per-month equivalent for display, or null when not applicable. */
  perMonth: string | null;
  trialDays: number;
  badge?: string;
}

export type PurchasePhase =
  | "purchased"
  | "restored"
  | "cancelled"
  | "nothing_to_restore"
  | "error";

export interface PurchaseResult {
  ok: boolean;
  phase: PurchasePhase;
  productId?: PlanId;
  /** Store transaction id / receipt reference when successful. */
  transactionId?: string;
  reason?: string;
}

export interface BillingService {
  getProducts(): Promise<Product[]>;
  purchase(id: PlanId): Promise<PurchaseResult>;
  restore(): Promise<PurchaseResult>;
}

export const PRODUCTS: Product[] = [
  {
    id: "pro_monthly",
    title: "Monthly",
    price: "$5.99",
    period: "per month",
    perMonth: null,
    trialDays: 7,
  },
  {
    id: "pro_yearly",
    title: "Yearly",
    price: "$39.99",
    period: "per year",
    perMonth: "$3.33 / month",
    trialDays: 7,
    badge: "SAVE 44% · BEST",
  },
];

export interface MockBillingOptions {
  delayMs?: number;
  /** Force the next purchase outcome (for tests). */
  purchaseOutcome?: "purchased" | "cancelled" | "error";
  /** Simulate a prior purchase that restore() should find. */
  hasPriorPurchase?: boolean;
}

/**
 * Realistic mock store. Tracks entitlement in-memory so restore() behaves like
 * a real store: it succeeds only if something was actually purchased before.
 */
export class MockBillingService implements BillingService {
  private entitled: boolean;
  constructor(private opts: MockBillingOptions = {}) {
    this.entitled = opts.hasPriorPurchase ?? false;
  }

  async getProducts(): Promise<Product[]> {
    await this.wait();
    return PRODUCTS;
  }

  async purchase(id: PlanId): Promise<PurchaseResult> {
    await this.wait();
    const outcome = this.opts.purchaseOutcome ?? "purchased";
    if (outcome === "cancelled") {
      return { ok: false, phase: "cancelled", reason: "Purchase cancelled." };
    }
    if (outcome === "error") {
      return {
        ok: false,
        phase: "error",
        reason: "Payment could not be completed. You were not charged.",
      };
    }
    this.entitled = true;
    return {
      ok: true,
      phase: "purchased",
      productId: id,
      transactionId: "TXN-" + Math.random().toString(36).slice(2, 10).toUpperCase(),
    };
  }

  async restore(): Promise<PurchaseResult> {
    await this.wait();
    if (this.entitled) {
      return { ok: true, phase: "restored", productId: "pro_yearly" };
    }
    return {
      ok: false,
      phase: "nothing_to_restore",
      reason: "No previous purchase found on this account.",
    };
  }

  private wait() {
    const ms = this.opts.delayMs ?? 700;
    return ms > 0 ? new Promise((r) => setTimeout(r, ms)) : Promise.resolve();
  }
}

/** Default instance used by the app UI. */
export const billingService: BillingService = new MockBillingService({
  delayMs: 700,
});
