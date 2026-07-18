// Pure money helpers. No dates, no state — just arithmetic that must be exact.
import type {
  Subscription,
  Category,
  CategoryBreakdown,
} from "./types";

/** Statuses that still cost the user money right now. */
export function isBilling(sub: Subscription): boolean {
  return sub.status === "active" || sub.status === "trial";
}

/**
 * Normalise a subscription's price to a per-month figure.
 * Yearly plans are divided by 12; monthly plans pass through.
 */
export function monthlyCost(sub: Subscription): number {
  if (sub.cycle === "yearly") return sub.price / 12;
  return sub.price;
}

/** Total monthly spend across everything still billing. */
export function totalMonthly(subs: Subscription[]): number {
  return round2(
    subs.filter(isBilling).reduce((sum, s) => sum + monthlyCost(s), 0),
  );
}

/** Total yearly spend across everything still billing. */
export function totalYearly(subs: Subscription[]): number {
  return round2(totalMonthly(subs) * 12);
}

/**
 * Spend grouped by category, largest first, with each share as a rounded
 * percentage of the billing total. Cancelled subs are excluded.
 */
export function categoryBreakdown(subs: Subscription[]): CategoryBreakdown[] {
  const billing = subs.filter(isBilling);
  const total = billing.reduce((sum, s) => sum + monthlyCost(s), 0);

  const byCat = new Map<Category, number>();
  for (const s of billing) {
    byCat.set(s.category, (byCat.get(s.category) ?? 0) + monthlyCost(s));
  }

  const rows: CategoryBreakdown[] = [...byCat.entries()].map(
    ([category, monthly]) => ({
      category,
      monthly: round2(monthly),
      percent: total === 0 ? 0 : Math.round((monthly / total) * 100),
    }),
  );

  rows.sort((a, b) => b.monthly - a.monthly);
  return rows;
}

/** Round to 2 decimal places, avoiding binary float drift (e.g. 71.42). */
export function round2(n: number): number {
  return Math.round((n + Number.EPSILON) * 100) / 100;
}

/** Format a number as USD, e.g. 17.9 -> "$17.90", 40 -> "$40". */
export function formatMoney(n: number, opts: { cents?: boolean } = {}): string {
  const cents = opts.cents ?? true;
  const rounded = round2(n);
  const whole = Number.isInteger(rounded);
  const digits = cents && !whole ? 2 : cents ? 2 : 0;
  return "$" + rounded.toFixed(digits);
}
