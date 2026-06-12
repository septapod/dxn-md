import { describe, expect, it } from "vitest";
import { lintPage } from "../src/build/lint-geo.js";
import type { Page } from "../src/build/page.js";

const compliantPage = (): Page => ({
  route: "/fixture",
  title: "Fixture",
  description: "A fixture page.",
  byline_date: "2026-06-12",
  last_verified: "2026-06-12",
  geo_lint: true,
  jsonld: [],
  sections: [
    {
      blocks: [
        { kind: "stat", value: "41%", label: "lift", source: { title: "GEO paper", url: "https://example.org/geo" } },
        { kind: "stat", value: "20 years", label: "experience" },
        { kind: "quote", text: "A quote.", attribution: "A. Person, CEO" },
      ],
    },
  ],
});

describe("GEO lint gate (AE3 logic)", () => {
  it("passes a compliant page", () => {
    expect(lintPage(compliantPage())).toEqual([]);
  });

  it("fails when a statistic is removed, naming page and rule", () => {
    const page = compliantPage();
    page.sections[0]!.blocks.shift(); // drop one stat (and with it the external citation)
    const failures = lintPage(page);
    expect(failures.some((f) => f.route === "/fixture" && f.rule.includes("statistics"))).toBe(true);
  });

  it("fails on missing attributed quote", () => {
    const page = compliantPage();
    page.sections[0]!.blocks = page.sections[0]!.blocks.filter((b) => b.kind !== "quote");
    expect(lintPage(page).some((f) => f.rule.includes("quotation"))).toBe(true);
  });

  it("does not count Brent's own properties as external citations", () => {
    const page = compliantPage();
    page.sections[0]!.blocks[0] = {
      kind: "stat",
      value: "41%",
      label: "lift",
      source: { title: "own site", url: "https://dxn.is/page" },
    };
    expect(lintPage(page).some((f) => f.rule.includes("external citation"))).toBe(true);
  });

  it("exempt pages skip the lint", () => {
    const page = compliantPage();
    page.geo_lint = false;
    page.sections = [];
    expect(lintPage(page)).toEqual([]);
  });
});
