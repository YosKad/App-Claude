// Core domain types for SubSentry.
// Everything the app reasons about — money, alerts, savings — is derived from
// these shapes by the pure functions in this folder.

export type BillingCycle = "monthly" | "yearly";

export type SubStatus = "active" | "trial" | "cancelled";

export type Category =
  | "Streaming"
  | "Music"
  | "Fitness"
  | "Cloud"
  | "News"
  | "Gaming"
  | "Other";

export interface PricePoint {
  /** ISO date (YYYY-MM-DD) the price took effect. */
  date: string;
  /** Price charged per billing cycle at that date, in whole currency units. */
  price: number;
}

export interface Subscription {
  id: string;
  name: string;
  /** Single letter or short glyph used for the brand tile. */
  glyph: string;
  /** Brand tile background colour (hex). */
  color: string;
  category: Category;
  status: SubStatus;
  /** Price for one billing cycle (not normalised). */
  price: number;
  cycle: BillingCycle;
  /** ISO date of the next charge. */
  nextCharge: string;
  /** ISO date the subscription (or its trial) started. */
  startedOn: string;
  /** ISO date it was last opened/used, or null if never tracked. */
  lastUsed: string | null;
  /** Price history, oldest first. Empty allowed. */
  priceHistory: PricePoint[];
}

export type AlertKind = "trial_ending" | "price_hike" | "unused";

export type AlertSeverity = "critical" | "warning" | "info";

export interface Alert {
  id: string;
  subId: string;
  kind: AlertKind;
  severity: AlertSeverity;
  title: string;
  detail: string;
  /** Monthly money at stake, for sorting/impact display. */
  monthlyImpact: number;
}

export interface CategoryBreakdown {
  category: Category;
  monthly: number;
  /** 0–100, rounded. */
  percent: number;
}
