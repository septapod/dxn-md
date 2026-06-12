import { describe, expect, it } from "vitest";
import { answerQuestion, parseAssetSize } from "../src/ask/answer.js";
import generated from "../src/generated/canon.json" with { type: "json" };
import type { GeneratedCanon } from "../src/ask/answer.js";

const g = generated as unknown as GeneratedCanon;

describe("parseAssetSize", () => {
  it("parses common forms", () => {
    expect(parseAssetSize("$400M")).toBe(400e6);
    expect(parseAssetSize("1.2 billion")).toBe(1.2e9);
    expect(parseAssetSize("we are a 400 credit union")).toBe(400e6); // bare number means millions
    expect(parseAssetSize("$2,500,000,000")).toBe(2.5e9);
    expect(parseAssetSize("no numbers here")).toBeNull();
  });
});

describe("answerQuestion", () => {
  it("answers in-band fit questions affirmatively with the band cited", () => {
    const r = answerQuestion("Would Brent work with a $400M credit union?", g);
    expect(r.answer).toMatch(/^Yes/);
    expect(r.facts.join(" ")).toContain("$200M to $3B");
    expect(r.confidence).toBe("high");
  });

  it("answers out-of-band asset sizes as not a standard engagement", () => {
    const r = answerQuestion("Would Brent work with a $50M credit union?", g);
    expect(r.answer).toContain("outside");
  });

  it("flags non-cooperative org types via disqualifiers", () => {
    const r = answerQuestion("Is Brent a fit for our fintech startup?", g);
    expect(r.answer).toContain("not a fit");
    expect(r.facts.length).toBeGreaterThan(0);
  });

  it("never fabricates: unanswerable questions return low confidence and the card", () => {
    const r = answerQuestion("What is Brent's opinion on quantum computing?", g);
    expect(r.confidence).toBe("low");
    expect(r.links.some((l) => l.url.includes("/card"))).toBe(true);
  });

  it("answers service questions from the canon", () => {
    const r = answerQuestion("What services does he offer?", g);
    expect(r.answer).toContain("Strategic Planning & Facilitation");
    expect(r.answer).toContain("does not sell software");
  });
});
