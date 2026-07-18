// Alert detection — the "watchdog" logic that makes SubSentry useful.
// Pure: given the subscriptions and today's date, produce the alerts.
import type { Alert, Subscription } from "./types";
import { monthlyCost } from "./money";
import { daysUntil, relativeUsed } from "./dates";

/** A trial firing within this many days is "ending soon". */
export const TRIAL_WINDOW_DAYS = 3;
/** No activity for this many days flags a subscription as unused. */
export const UNUSED_THRESHOLD_DAYS = 60;

const severityRank: Record<Alert["severity"], number> = {
  critical: 0,
  warning: 1,
  info: 2,
};

/**
 * Detect every alert for the given subscriptions as of `today`.
 * Results are sorted by severity, then by monthly money at stake (desc).
 */
export function detectAlerts(subs: Subscription[], today: string): Alert[] {
  const alerts: Alert[] = [];

  for (const sub of subs) {
    if (sub.status === "cancelled") continue;

    // Trial about to convert to a paid charge.
    if (sub.status === "trial") {
      const days = daysUntil(sub.nextCharge, today);
      if (days >= 0 && days <= TRIAL_WINDOW_DAYS) {
        alerts.push({
          id: `${sub.id}:trial`,
          subId: sub.id,
          kind: "trial_ending",
          severity: "critical",
          title: "Free trial ending",
          detail: `${sub.name} will charge $${sub.price.toFixed(2)} ${
            days === 0 ? "today" : days === 1 ? "tomorrow" : `in ${days} days`
          }.`,
          monthlyImpact: monthlyCost(sub),
        });
      }
    }

    // Price increase: latest price higher than the previous one.
    const hike = detectHike(sub);
    if (hike) {
      alerts.push({
        id: `${sub.id}:hike`,
        subId: sub.id,
        kind: "price_hike",
        severity: "warning",
        title: `Price went up ${hike.percent}%`,
        detail: `${sub.name} rose from $${hike.from.toFixed(2)} to $${hike.to.toFixed(
          2,
        )}.`,
        monthlyImpact: monthlyCost(sub),
      });
    }

    // Paid but unused for a long time.
    if (sub.status === "active" && sub.lastUsed) {
      const idle = -daysUntil(sub.lastUsed, today);
      if (idle >= UNUSED_THRESHOLD_DAYS) {
        alerts.push({
          id: `${sub.id}:unused`,
          subId: sub.id,
          kind: "unused",
          severity: "info",
          title: "Unused subscription",
          detail: `You haven't opened ${sub.name} in ${relativeUsed(
            sub.lastUsed,
            today,
          )}, but pay $${sub.price.toFixed(2)}.`,
          monthlyImpact: monthlyCost(sub),
        });
      }
    }
  }

  alerts.sort(
    (a, b) =>
      severityRank[a.severity] - severityRank[b.severity] ||
      b.monthlyImpact - a.monthlyImpact,
  );
  return alerts;
}

/** Returns the most recent price increase, or null if prices never rose. */
export function detectHike(
  sub: Subscription,
): { from: number; to: number; percent: number } | null {
  const h = sub.priceHistory;
  if (h.length < 2) return null;
  const to = h[h.length - 1].price;
  const from = h[h.length - 2].price;
  if (to <= from) return null;
  return { from, to, percent: Math.round(((to - from) / from) * 100) };
}
