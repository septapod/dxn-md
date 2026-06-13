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

type Testimonial = Canon["testimonials"]["testimonials"][number];

// Page builders look testimonials up by org name; a canon rename must fail
// with the lookup named, not as an opaque TypeError mid-build.
export function requireTestimonial(canon: Canon, org: string): Testimonial {
  const found = canon.testimonials.testimonials.find((t) => t.org === org);
  if (!found) {
    const orgs = canon.testimonials.testimonials.map((t) => t.org).join(", ");
    throw new Error(`testimonial lookup failed: no quote from "${org}" in canon (have: ${orgs})`);
  }
  return found;
}

export function quoteAttribution(t: Testimonial): string {
  return `${t.author}, ${t.role}, ${t.org}`;
}
