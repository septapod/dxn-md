// The GEO lint gate: substantive pages must carry the content features the
// GEO evidence base ties to citation visibility (statistics +41%, quotations
// +28%, external citations +30%; Princeton GEO paper, ACM SIGKDD 2024).
// Rule per page: >=2 stat blocks, >=1 attributed quote, >=1 external citation,
// dated byline. Pages opt in via page.geo_lint.

import type { Page } from "./page.js";

// Brent's own properties do not count as external citations.
const SELF_HOSTS = new Set(["dxn.is", "dxn.md", "ai4fis.beehiiv.com", "rss.beehiiv.com"]);

export interface LintFailure {
  route: string;
  rule: string;
}

function isExternalUrl(url: string): boolean {
  try {
    const host = new URL(url).hostname.replace(/^www\./, "");
    return !SELF_HOSTS.has(host) && !host.endsWith(".vercel.app");
  } catch {
    return false;
  }
}

export function lintPage(page: Page): LintFailure[] {
  if (!page.geo_lint) return [];
  const failures: LintFailure[] = [];
  const blocks = page.sections.flatMap((s) => s.blocks);

  const stats = blocks.filter((b) => b.kind === "stat").length;
  if (stats < 2) failures.push({ route: page.route, rule: `needs >=2 statistics, has ${stats}` });

  const quotes = blocks.filter((b) => b.kind === "quote" && b.attribution.trim()).length;
  if (quotes < 1) failures.push({ route: page.route, rule: "needs >=1 attributed quotation" });

  const externalCitations = blocks.filter((b) => {
    if (b.kind === "stat" && b.source && isExternalUrl(b.source.url)) return true;
    if (b.kind === "links" && b.items.some((i) => isExternalUrl(i.url))) return true;
    return false;
  }).length;
  if (externalCitations < 1)
    failures.push({ route: page.route, rule: "needs >=1 external citation" });

  if (!/^\d{4}-\d{2}-\d{2}$/.test(page.byline_date))
    failures.push({ route: page.route, rule: "needs a dated byline (YYYY-MM-DD)" });

  return failures;
}

export function lintPages(pages: Page[]): LintFailure[] {
  return pages.flatMap(lintPage);
}
