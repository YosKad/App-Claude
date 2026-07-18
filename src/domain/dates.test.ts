import { describe, it, expect } from "vitest";
import { daysBetween, daysUntil, relativeDue, relativeUsed } from "./dates";

describe("daysBetween", () => {
  it("counts forward days as positive", () => {
    expect(daysBetween("2026-07-18", "2026-07-19")).toBe(1);
    expect(daysBetween("2026-07-01", "2026-07-31")).toBe(30);
  });
  it("counts past days as negative and same day as zero", () => {
    expect(daysBetween("2026-07-18", "2026-07-11")).toBe(-7);
    expect(daysBetween("2026-07-18", "2026-07-18")).toBe(0);
  });
  it("spans month and year boundaries", () => {
    expect(daysBetween("2026-12-31", "2027-01-01")).toBe(1);
  });
});

describe("daysUntil", () => {
  it("is positive for future dates", () => {
    expect(daysUntil("2026-07-20", "2026-07-18")).toBe(2);
  });
});

describe("relativeDue", () => {
  const today = "2026-07-18";
  it("phrases today, tomorrow and future", () => {
    expect(relativeDue("2026-07-18", today)).toBe("today");
    expect(relativeDue("2026-07-19", today)).toBe("tomorrow");
    expect(relativeDue("2026-07-23", today)).toBe("in 5 days");
  });
  it("phrases the past", () => {
    expect(relativeDue("2026-07-16", today)).toBe("2d ago");
  });
});

describe("relativeUsed", () => {
  const today = "2026-07-18";
  it("handles never-used", () => {
    expect(relativeUsed(null, today)).toBe("never");
  });
  it("handles days and months", () => {
    expect(relativeUsed("2026-07-17", today)).toBe("yesterday");
    expect(relativeUsed("2026-07-06", today)).toBe("12 days ago");
    expect(relativeUsed("2026-06-18", today)).toBe("1 month ago");
    expect(relativeUsed("2026-04-18", today)).toBe("3 months ago");
  });
});
