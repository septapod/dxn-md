// Regenerate data/changes.json from git history of the content sources.
// Runs where full history exists (the weekly Action checks out fetch-depth: 0,
// or a local repo) — never inside the Vercel build, whose clone is shallow.
import { execFileSync } from "node:child_process";
import { readFileSync, writeFileSync } from "node:fs";

interface Entry {
  date: string;
  summary: string;
  areas: string[];
}

function areasFor(files: string[]): string[] {
  const areas = new Set<string>();
  for (const f of files) {
    if (f.startsWith("content/canon/")) areas.add(f.replace("content/canon/", "").replace(".yaml", ""));
    else if (f === "data/feed-snapshot.xml") areas.add("newsletter-feed");
    else areas.add("site");
  }
  return [...areas].sort();
}

const log = execFileSync(
  "git",
  ["log", "--format=%H|%as|%s", "--", "content/", "data/feed-snapshot.xml"],
  { encoding: "utf8" },
).trim();

const existing = JSON.parse(readFileSync("data/changes.json", "utf8")) as {
  entries: Entry[];
};

const entries: Entry[] = [];
if (log) {
  for (const line of log.split("\n")) {
    const [hash, date, ...rest] = line.split("|");
    if (!hash || !date) continue;
    const files = execFileSync(
      "git",
      ["show", "--name-only", "--format=", hash, "--", "content/", "data/feed-snapshot.xml"],
      { encoding: "utf8" },
    )
      .trim()
      .split("\n")
      .filter(Boolean);
    entries.push({ date, summary: rest.join("|"), areas: areasFor(files) });
  }
}

// Preserve the hand-seeded initial entry if git history is empty or missing it.
if (!entries.length) {
  console.log("regen-changes: no git history for content paths; keeping existing file");
  process.exit(0);
}
const initial = existing.entries[existing.entries.length - 1];
if (initial && !entries.some((e) => e.summary === initial.summary)) entries.push(initial);

const updated = entries[0]?.date ?? "2026-06-12";
writeFileSync(
  "data/changes.json",
  JSON.stringify({ updated, entries }, null, 2) + "\n",
  "utf8",
);
console.log(`regen-changes: ${entries.length} entries, updated ${updated}`);
