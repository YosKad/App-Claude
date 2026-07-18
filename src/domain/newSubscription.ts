// Building a Subscription from user form input. Pure and validated so the
// "add subscription" flow is fully testable without any UI.
import type {
  BillingCycle,
  BillingProvider,
  Category,
  Subscription,
} from "./types";

export interface SubInput {
  name: string;
  /** Raw price string from the input field. */
  price: string;
  cycle: BillingCycle;
  category: Category;
  billing: BillingProvider;
  /** ISO date of the next charge. */
  nextCharge: string;
}

/** Brand-tile colours assigned deterministically by name. */
const PALETTE = [
  "#ef4444", "#f59e0b", "#10b981", "#3b82f6", "#6366f1",
  "#a855f7", "#ec4899", "#14b8a6", "#f97316", "#0ea5e9",
];

export function colorFor(name: string): string {
  let hash = 0;
  for (let i = 0; i < name.length; i++) hash = (hash * 31 + name.charCodeAt(i)) | 0;
  return PALETTE[Math.abs(hash) % PALETTE.length];
}

export function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "sub"
  );
}

/** Returns a list of human-readable problems; empty means valid. */
export function validateSubInput(input: SubInput): string[] {
  const errors: string[] = [];
  if (!input.name.trim()) errors.push("Give it a name.");
  const price = Number(input.price);
  if (!input.price.trim() || Number.isNaN(price)) {
    errors.push("Enter a valid price.");
  } else if (price <= 0) {
    errors.push("Price must be more than 0.");
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input.nextCharge)) {
    errors.push("Pick a next-charge date.");
  }
  return errors;
}

/**
 * Build a Subscription from validated input. Assumes `validateSubInput` already
 * passed. `id` is unique-ish (slug + short suffix) so multiple subs with the
 * same name don't collide.
 */
export function buildSubscription(
  input: SubInput,
  opts: { idSuffix?: string } = {},
): Subscription {
  const name = input.name.trim();
  const price = Math.round(Number(input.price) * 100) / 100;
  const suffix = opts.idSuffix ?? Math.random().toString(36).slice(2, 6);
  const glyph = name[0]?.toUpperCase() ?? "?";
  return {
    id: `${slugify(name)}-${suffix}`,
    name,
    glyph,
    color: colorFor(name),
    category: input.category,
    status: "active",
    price,
    cycle: input.cycle,
    billing: input.billing,
    nextCharge: input.nextCharge,
    startedOn: input.nextCharge,
    lastUsed: null,
    priceHistory: [{ date: input.nextCharge, price }],
  };
}
