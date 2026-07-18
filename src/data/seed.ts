import type { Subscription } from "../domain/types";

/** The app's "current day" — fixed so alerts and countdowns are deterministic. */
export const TODAY = "2026-07-18";

/**
 * Realistic starter data: a mix of streaming, music, fitness and cloud, with a
 * trial about to convert, a price hike, and a long-unused subscription so the
 * watchdog logic has something real to find.
 */
export const SEED_SUBSCRIPTIONS: Subscription[] = [
  {
    id: "netflix",
    name: "Netflix Premium",
    glyph: "N",
    color: "#e50914",
    category: "Streaming",
    status: "trial",
    price: 17.99,
    cycle: "monthly",
    nextCharge: "2026-07-19",
    startedOn: "2026-06-19",
    lastUsed: "2026-07-06",
    priceHistory: [
      { date: "2023-05-01", price: 13.99 },
      { date: "2024-06-01", price: 15.99 },
      { date: "2025-06-01", price: 17.99 },
    ],
  },
  {
    id: "spotify",
    name: "Spotify",
    glyph: "♫",
    color: "#1db954",
    category: "Music",
    status: "active",
    price: 10.99,
    cycle: "monthly",
    nextCharge: "2026-07-24",
    startedOn: "2022-02-10",
    lastUsed: "2026-07-18",
    priceHistory: [{ date: "2023-07-01", price: 10.99 }],
  },
  {
    id: "gymapp",
    name: "GymApp",
    glyph: "G",
    color: "#f59e0b",
    category: "Fitness",
    status: "active",
    price: 14.99,
    cycle: "monthly",
    nextCharge: "2026-08-02",
    startedOn: "2025-01-05",
    lastUsed: "2026-07-10",
    priceHistory: [
      { date: "2025-01-05", price: 9.99 },
      { date: "2026-06-01", price: 14.99 },
    ],
  },
  {
    id: "icloud",
    name: "iCloud+",
    glyph: "☁",
    color: "#6366f1",
    category: "Cloud",
    status: "active",
    price: 2.99,
    cycle: "monthly",
    nextCharge: "2026-08-01",
    startedOn: "2021-09-01",
    lastUsed: "2026-07-17",
    priceHistory: [{ date: "2021-09-01", price: 2.99 }],
  },
  {
    id: "applemusic",
    name: "Apple Music",
    glyph: "",
    color: "#fa243c",
    category: "Music",
    status: "active",
    price: 10.99,
    cycle: "monthly",
    nextCharge: "2026-08-04",
    startedOn: "2024-03-01",
    lastUsed: "2026-04-01",
    priceHistory: [{ date: "2024-03-01", price: 10.99 }],
  },
  {
    id: "nyt",
    name: "NYT News",
    glyph: "T",
    color: "#111111",
    category: "News",
    status: "active",
    price: 96,
    cycle: "yearly",
    nextCharge: "2026-11-01",
    startedOn: "2024-11-01",
    lastUsed: "2026-07-12",
    priceHistory: [{ date: "2024-11-01", price: 96 }],
  },
];
