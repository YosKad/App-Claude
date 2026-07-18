import { describe, it, expect } from "vitest";
import {
  validateSubInput,
  buildSubscription,
  slugify,
  colorFor,
  type SubInput,
} from "./newSubscription";

const valid: SubInput = {
  name: "Disney+",
  price: "13.99",
  cycle: "monthly",
  category: "Streaming",
  billing: "card",
  nextCharge: "2026-08-15",
};

describe("validateSubInput", () => {
  it("accepts valid input", () => {
    expect(validateSubInput(valid)).toEqual([]);
  });
  it("rejects a blank name", () => {
    expect(validateSubInput({ ...valid, name: "  " })).toContain("Give it a name.");
  });
  it("rejects a non-numeric or zero price", () => {
    expect(validateSubInput({ ...valid, price: "abc" })).toContain("Enter a valid price.");
    expect(validateSubInput({ ...valid, price: "0" })).toContain("Price must be more than 0.");
  });
  it("rejects a missing date", () => {
    expect(validateSubInput({ ...valid, nextCharge: "" })).toContain("Pick a next-charge date.");
  });
});

describe("slugify", () => {
  it("makes url-safe ids and never empties", () => {
    expect(slugify("Disney+")).toBe("disney");
    expect(slugify("!!!")).toBe("sub");
    expect(slugify("Amazon Prime Video")).toBe("amazon-prime-video");
  });
});

describe("colorFor", () => {
  it("is deterministic for a given name", () => {
    expect(colorFor("Netflix")).toBe(colorFor("Netflix"));
  });
});

describe("buildSubscription", () => {
  it("builds a normalized active subscription", () => {
    const sub = buildSubscription(valid, { idSuffix: "abcd" });
    expect(sub).toMatchObject({
      id: "disney-abcd",
      name: "Disney+",
      glyph: "D",
      status: "active",
      price: 13.99,
      cycle: "monthly",
      category: "Streaming",
      billing: "card",
    });
    expect(sub.priceHistory).toEqual([{ date: "2026-08-15", price: 13.99 }]);
  });
  it("rounds the price to cents", () => {
    const sub = buildSubscription({ ...valid, price: "9.999" }, { idSuffix: "x" });
    expect(sub.price).toBe(10);
  });
});
