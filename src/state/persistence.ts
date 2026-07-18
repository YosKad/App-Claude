// Local persistence for app state. Keeps the user's subscriptions, settings and
// entitlement across launches. Deliberately storage-injectable so it's testable
// in Node and swappable for a backend later.
import type { AppState } from "./store";

const KEY = "subsentry.state";
const VERSION = 1;

/** The slice of state we persist. Navigation is intentionally NOT persisted. */
export interface PersistedShape {
  version: number;
  subs: AppState["subs"];
  settings: AppState["settings"];
  isPro: boolean;
  onboarded: boolean;
}

type StorageLike = Pick<Storage, "getItem" | "setItem" | "removeItem">;

function safeStorage(): StorageLike | null {
  try {
    return globalThis.localStorage ?? null;
  } catch {
    return null; // e.g. SSR / privacy mode / tests without a DOM
  }
}

/** Load persisted state, or null if absent, unreadable, or a stale version. */
export function loadPersisted(
  storage: StorageLike | null = safeStorage(),
): PersistedShape | null {
  if (!storage) return null;
  const raw = storage.getItem(KEY);
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw) as PersistedShape;
    if (parsed.version !== VERSION) return null; // migration boundary
    return parsed;
  } catch {
    return null;
  }
}

/** Persist the relevant slice of state. No-ops when storage is unavailable. */
export function savePersisted(
  state: AppState,
  storage: StorageLike | null = safeStorage(),
): void {
  if (!storage) return;
  const payload: PersistedShape = {
    version: VERSION,
    subs: state.subs,
    settings: state.settings,
    isPro: state.isPro,
    onboarded: state.onboarded,
  };
  try {
    storage.setItem(KEY, JSON.stringify(payload));
  } catch {
    // Quota or serialization failure — non-fatal.
  }
}

export function clearPersisted(
  storage: StorageLike | null = safeStorage(),
): void {
  try {
    storage?.removeItem(KEY);
  } catch {
    /* ignore */
  }
}
