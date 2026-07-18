// Savings logic — the reward side of the app. When a user cancels something,
// we record what they no longer pay so the app can celebrate it.
import type { Subscription } from "./types";
import { monthlyCost, round2 } from "./money";

export interface SavingsSummary {
  /** Number of subscriptions cancelled through the app. */
  count: number;
  /** Money no longer leaving each month. */
  monthly: number;
  /** Annualised saving. */
  yearly: number;
}

/**
 * Summarise savings from a list of subscriptions the user has cancelled.
 * Each cancelled sub contributes its normalised monthly cost.
 */
export function savingsSummary(cancelled: Subscription[]): SavingsSummary {
  const monthly = cancelled.reduce((sum, s) => sum + monthlyCost(s), 0);
  return {
    count: cancelled.length,
    monthly: round2(monthly),
    yearly: round2(monthly * 12),
  };
}

/** The yearly saving from cancelling a single subscription. */
export function yearlySavingOf(sub: Subscription): number {
  return round2(monthlyCost(sub) * 12);
}
