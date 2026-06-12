import { describe, expect, it } from "vitest";
import { parse } from "yaml";
import { readFileSync } from "node:fs";
import { loadCanon } from "../src/canon/load.js";
import { bioSchema } from "../src/canon/schema.js";

describe("canon", () => {
  it("loads and validates the full canon", () => {
    const { canon, hash } = loadCanon();
    expect(canon.bio.name).toBe("Brent Dixon");
    expect(hash).toMatch(/^[0-9a-f]{12}$/);
  });

  it("repatriates the drifted bio facts (Moeda Seeds, Communitere)", () => {
    const { canon } = loadCanon();
    const orgs = canon.bio.affiliations.map((a) => a.org);
    expect(orgs).toContain("Moeda Seeds");
    expect(orgs).toContain("Communitere International");
  });

  it("carries the full client list from the dxnis source (27 financial + 11 social)", () => {
    const { canon } = loadCanon();
    expect(canon.clients.clients).toHaveLength(38);
    expect(canon.clients.clients.filter((c) => c.sector === "financial")).toHaveLength(27);
  });

  it("names the missing field when validation fails", () => {
    const raw = parse(readFileSync("content/canon/bio.yaml", "utf8"));
    delete raw.summary;
    const result = bioSchema.safeParse(raw);
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues.some((i) => i.path.join(".") === "summary")).toBe(true);
    }
  });

  it("every domain carries a last_verified date", () => {
    const { canon } = loadCanon();
    for (const domain of Object.values(canon)) {
      expect(domain.last_verified).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    }
  });
});
