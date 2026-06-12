import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { parse } from "yaml";
import { canonSchema, type Canon } from "./schema.js";

const DOMAINS = [
  "bio",
  "services",
  "clients",
  "testimonials",
  "framework",
  "newsletter",
  "contact",
  "agents",
] as const;

export function loadCanon(root = process.cwd()): { canon: Canon; hash: string } {
  const raw: Record<string, unknown> = {};
  const hash = createHash("sha256");
  for (const domain of DOMAINS) {
    const path = join(root, "content", "canon", `${domain}.yaml`);
    const text = readFileSync(path, "utf8");
    hash.update(text);
    raw[domain] = parse(text);
  }
  const parsed = canonSchema.safeParse(raw);
  if (!parsed.success) {
    const issues = parsed.error.issues
      .map((i) => `  ${i.path.join(".")}: ${i.message}`)
      .join("\n");
    throw new Error(`Canon validation failed:\n${issues}`);
  }
  return { canon: parsed.data, hash: hash.digest("hex").slice(0, 12) };
}
