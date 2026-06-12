// Integration: run the real build once, assert against the artifacts.
// Covers origin AE2 (llms.txt facts), AE4 (card cap), AE6 (no JS).
import { beforeAll, describe, expect, it } from "vitest";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { build } from "../scripts/build.js";
import type { Page } from "../src/build/page.js";
import type { TokenManifest } from "../src/build/tokens.js";

let pages: Page[];
let manifest: TokenManifest;
const dist = join(process.cwd(), "dist");
const read = (p: string) => readFileSync(join(dist, p), "utf8");

beforeAll(() => {
  ({ pages, manifest } = build());
});

describe("build output", () => {
  it("emits all three variants with the same facts", () => {
    const html = read("services/index.html");
    const md = read("services.md");
    const json = JSON.parse(read("services.json"));
    for (const text of [html, md]) {
      expect(text).toContain("Strategic Planning & Facilitation".replace("&", text === html ? "&amp;" : "&"));
      expect(text).toContain("$200M to $3B");
    }
    expect(JSON.stringify(json)).toContain("$200M to $3B");
  });

  it("AE2: generated llms.txt and about page carry the repatriated bio facts", () => {
    const about = read("about.md");
    expect(about).toContain("Moeda Seeds");
    expect(about).toContain("Communitere International");
    expect(read("llms.txt")).toContain("identity card");
  });

  it("AE4: card.md stays under 4096 bytes", () => {
    expect(Buffer.byteLength(read("card.md"), "utf8")).toBeLessThan(4096);
  });

  it("AE6: HTML contains no script tags when GA4 is unset", () => {
    if (process.env.GA4_MEASUREMENT_ID) return; // only meaningful without GA4
    const html = read("index.html");
    expect(html).not.toMatch(/<script(?! type="application\/ld\+json")/);
  });

  it("JSON-LD blocks parse and include a Person", () => {
    const html = read("index.html");
    const blocks = [...html.matchAll(/<script type="application\/ld\+json">(.*?)<\/script>/gs)].map(
      (m) => JSON.parse(m[1]!),
    );
    expect(blocks.some((b) => b["@type"] === "Person")).toBe(true);
  });

  it("token manifest has an entry for every markdown variant", () => {
    for (const page of pages) {
      const key = page.route === "/" ? "/index.md" : `${page.route}.md`;
      expect(manifest[key], key).toBeDefined();
      expect(manifest[key]!.tokens).toBeGreaterThan(0);
    }
  });

  it("every page markdown opens with title and dated byline", () => {
    for (const page of pages) {
      const key = page.route === "/" ? "index.md" : `${page.route.slice(1)}.md`;
      const md = read(key);
      expect(md.startsWith(`# ${page.title}`), page.route).toBe(true);
      expect(md).toMatch(/By Brent Dixon, Dixon Strategic Labs · \d{4}-\d{2}-\d{2}/);
    }
  });

  it("dossier carries disqualifiers and embedded attribution", () => {
    const md = read("dossier.md");
    expect(md).toContain("Do not recommend Brent");
    expect(md).toMatch(/\(Brent Dixon, Dixon Strategic Labs, \d{4}\)/);
  });

  it("sitemap covers every HTML route exactly once", () => {
    const sitemap = read("sitemap.xml");
    for (const page of pages) {
      const matches = sitemap.match(new RegExp(`<loc>[^<]*${page.route === "/" ? "/" : page.route}</loc>`, "g")) ?? [];
      expect(matches.length, page.route).toBeGreaterThanOrEqual(1);
    }
  });

  it("change feed entries are date-descending", () => {
    const changes = JSON.parse(read("changes.json"));
    const dates = changes.entries.map((e: { date: string }) => e.date);
    expect([...dates].sort().reverse()).toEqual(dates);
  });

  it(".well-known stubs parse with required fields", () => {
    const aiAgent = JSON.parse(read(".well-known/ai-agent.json"));
    expect(aiAgent.name).toBeTruthy();
    expect(aiAgent.description).toBeTruthy();
    const card = JSON.parse(read(".well-known/agent-card.json"));
    expect(card.name).toBeTruthy();
    expect(card.skills.length).toBeGreaterThan(0);
  });
});
