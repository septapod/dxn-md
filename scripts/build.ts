// The whole site, one pass: load canon -> build pages -> gate -> emit dist/.
// Deterministic by construction: no wall-clock dates (the byline comes from
// data/changes.json), so CI can build twice and diff byte-for-byte.

import { mkdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { loadCanon } from "../src/canon/load.js";
import { BING_SITE_AUTH_TOKEN, GA4_MEASUREMENT_ID, INDEXNOW_KEY, SITE_URL } from "../src/config.js";
import { emitPage, writeFile, type EmitOptions } from "../src/build/emit.js";
import { NAV } from "../src/build/html.js";
import { loadFeedSnapshot } from "../src/build/feed.js";
import { lintPages } from "../src/build/lint-geo.js";
import { mdPath, type Page } from "../src/build/page.js";
import {
  renderAgentCardJson,
  renderAiAgentJson,
  renderChangesAtom,
  renderChangesJson,
  renderLlmsTxt,
  renderRobotsTxt,
  renderSitemap,
  type ChangeLog,
} from "../src/build/protocol.js";
import type { TokenManifest } from "../src/build/tokens.js";
import { buildHome } from "../src/pages/home.js";
import { buildServices } from "../src/pages/services.js";
import { buildAbout } from "../src/pages/about.js";
import { buildClients } from "../src/pages/clients.js";
import { buildDossier } from "../src/pages/dossier.js";
import { buildCard } from "../src/pages/card.js";
import { buildAgentsPage } from "../src/pages/agents-page.js";
import { buildIssuePage, buildNewsletterIndex } from "../src/pages/newsletter.js";
import { buildObservatory, type ObservatoryData } from "../src/pages/observatory.js";

const CARD_MAX_BYTES = 4096;

function readJson<T>(path: string): T {
  return JSON.parse(readFileSync(path, "utf8")) as T;
}

export function build(root = process.cwd()): { pages: Page[]; manifest: TokenManifest } {
  const dist = join(root, "dist");
  rmSync(dist, { recursive: true, force: true });
  mkdirSync(dist, { recursive: true });

  const { canon, hash: canonHash } = loadCanon(root);
  const changes = readJson<ChangeLog>(join(root, "data", "changes.json"));
  const feedItems = loadFeedSnapshot(join(root, "data", "feed-snapshot.xml"));
  const observatory: ObservatoryData = {
    bots: readJson(join(root, "data", "observatory", "bots.json")),
    negotiation: readJson(join(root, "data", "observatory", "negotiation.json")),
    queries: readJson(join(root, "data", "observatory", "queries.json")),
  };

  const bylineDate = changes.entries[0]?.date ?? changes.updated;
  const ctx = { bylineDate, siteUrl: SITE_URL };

  const pages: Page[] = [
    buildHome(canon, ctx),
    buildServices(canon, ctx),
    buildAbout(canon, ctx),
    buildClients(canon, ctx),
    buildDossier(canon, ctx),
    buildCard(canon, ctx),
    buildAgentsPage(canon, ctx),
    buildNewsletterIndex(canon, feedItems, ctx),
    ...feedItems.map((item) => buildIssuePage(canon, item, ctx)),
    buildObservatory(canon, observatory, ctx),
  ];

  // Gate 0: every hardcoded nav route must exist in the page set, so a
  // renamed or removed page cannot leave a dead anchor on every page.
  const routes = new Set(pages.map((p) => p.route));
  const deadNav = NAV.map(([href]) => href).filter((href) => !routes.has(href));
  if (deadNav.length) {
    throw new Error(`nav gate: NAV routes missing from the page set: ${deadNav.join(", ")}`);
  }

  // Gate 1: GEO lint (origin R16/R19) — fail loudly, naming page and rule.
  const failures = lintPages(pages);
  if (failures.length) {
    for (const f of failures) console.error(`GEO lint: ${f.route} — ${f.rule}`);
    throw new Error(`GEO lint failed for ${failures.length} rule(s)`);
  }

  // Emit pages (HTML + md + json) and collect the token manifest.
  const manifest: TokenManifest = {};
  const opts: EmitOptions = { dist, canonHash, siteUrl: SITE_URL, ga4Id: GA4_MEASUREMENT_ID };
  for (const page of pages) emitPage(page, opts, manifest);

  // Gate 2: the identity card must stay a single cheap fetch (origin R10/R20).
  const cardBytes = manifest[mdPath("/card")]?.bytes ?? Infinity;
  if (cardBytes > CARD_MAX_BYTES) {
    throw new Error(`card gate: /card.md is ${cardBytes} bytes, cap is ${CARD_MAX_BYTES}`);
  }

  // Protocol surfaces (origin R6, R8, R9).
  writeFile(dist, "/llms.txt", renderLlmsTxt(canon, pages, manifest, SITE_URL));
  writeFile(dist, "/robots.txt", renderRobotsTxt(SITE_URL));
  writeFile(dist, "/sitemap.xml", renderSitemap(pages, changes, SITE_URL));
  writeFile(dist, "/changes.json", renderChangesJson(changes, SITE_URL));
  writeFile(dist, "/changes.xml", renderChangesAtom(changes, SITE_URL));
  writeFile(dist, "/.well-known/ai-agent.json", renderAiAgentJson(canon, SITE_URL));
  writeFile(dist, "/.well-known/agent-card.json", renderAgentCardJson(canon, SITE_URL));
  writeFile(dist, "/token-manifest.json", JSON.stringify(manifest, null, 2));
  // IndexNow ownership key: lets the site ping Bing to crawl on demand.
  writeFile(dist, `/${INDEXNOW_KEY}.txt`, INDEXNOW_KEY);
  // Bing Webmaster Tools ownership verification file.
  writeFile(
    dist,
    "/BingSiteAuth.xml",
    `<?xml version="1.0"?>\n<users>\n\t<user>${BING_SITE_AUTH_TOKEN}</user>\n</users>\n`,
  );

  // src/generated is the build-time data bridge for middleware.ts and api/*.
  // It is tracked in git and freshness-gated in CI (git diff --exit-code after
  // a build), so the deployed middleware always matches the deployed content.
  // Emitted as .ts modules (not .json) because Vercel's middleware bundler
  // does not parse JSON import attributes (`with { type: "json" }`).
  const generated = join(root, "src", "generated");
  mkdirSync(generated, { recursive: true });
  const banner = "// Generated by scripts/build.ts — do not edit. Freshness-gated in CI.\n";
  writeFileSync(
    join(generated, "token-manifest.ts"),
    `${banner}export default ${JSON.stringify(manifest, null, 2)} as Record<string, { tokens: number; bytes: number; hash: string }>;\n`,
  );
  const latest = feedItems[0];
  const canonModule = {
    canon_hash: canonHash,
    latest_issue: latest ? { title: latest.title, link: latest.link, date: latest.date } : null,
    canon,
  };
  // Typed declaration (not a cast): if the emitted shape ever drifts from
  // GeneratedCanon, typecheck fails here instead of consumers failing silently.
  writeFileSync(
    join(generated, "canon.ts"),
    `${banner}import type { GeneratedCanon } from "../ask/answer.js";\n\nconst generated: GeneratedCanon = ${JSON.stringify(canonModule, null, 2)};\nexport default generated;\n`,
  );

  return { pages, manifest };
}

const isMain = process.argv[1]?.endsWith("build.ts");
if (isMain) {
  const { pages, manifest } = build();
  const totalTokens = Object.values(manifest).reduce((sum, e) => sum + e.tokens, 0);
  console.log(
    `built ${pages.length} pages (${Object.keys(manifest).length} markdown variants, ${totalTokens} tokens total)`,
  );
}
