---
date: 2026-06-12
topic: dxn-md-agent-site
---

# Requirements: dxn.md, the agent-native consulting site

## Summary

Build dxn.md as a 100% agent-optimized companion to dxn.is: every published surface (pages, llms.txt, JSON-LD, feeds, robots.txt) is generated at build time from a single structured facts canon, agents get markdown or JSON on any URL via content negotiation, and build gates make content drift and uncitable pages fail the build instead of relying on editorial discipline. Measurement ships on day one; the site runs itself after launch.

## Problem Frame

Brent's web presence has one human-facing site (dxn.is) whose copy is hardcoded in a 750-line HTML file, plus a hand-maintained llms.txt that has already drifted from the site bio once. AI agents are becoming a real referral channel (ChatGPT 63% of B2B AI referrals, Claude 18.5% and climbing as of June 2026), but the current setup makes Brent's strongest credibility signals invisible to them: the 24-client list lives in a JavaScript array no AI crawler reads, the newsletter exists only behind a runtime function, and there is no measurement of agent traffic at all. The dxn.md domain was purchased to fix this and to serve as a lab for agentic search optimization experiments. The build is autonomous: nothing in the design may depend on sustained manual editorial effort.

## Key Decisions

- **The canon lives in dxn.md and is the source of truth for business facts going forward.** dxn.is cannot be the data source (no content layer exists there). v1 imports the facts from dxn.is one time; back-propagation to dxn.is is deferred until that site has a structured target.
- **Markdown-first, generated-everything architecture.** Content is authored as structured data plus markdown; HTML is a generated view. This is the only architecture that satisfies both the sync requirement and the no-human-editorial constraint, and it makes the llms.txt drift class of bug structurally impossible.
- **Correctness and citability are build properties.** A canon-consistency check and a GEO content linter run in the build; violations fail the deploy. Quality enforcement cannot depend on an editor who is not there.
- **Newsletter archive uses abstract + fact box + canonical link, not full-text mirroring.** Full-text republication on a second domain risks canonical-URL conflicts with Beehiiv; the wire-summary format captures the citation value without the hazard.
- **MCP//ask endpoints are stretch scope.** Real prior art (NLWeb), thin demand evidence (65% confidence from ideation). Build after the core ships, skip if effort runs long; the canon makes them cheap to add later.
- **llms.txt claims are scoped to what the evidence supports.** It is fetched by IDE and desktop agents today, not confirmed by search-time crawlers; the site treats it as one surface among several, not the strategy.
- **Schema.org JSON-LD ships but is treated as secondary.** Evidence on its citation effect is contradictory; the content itself (statistics, quotes, fact density) is the primary citation driver.

## Actors

- A1. **Search-time AI crawlers** (GPTBot, ClaudeBot, PerplexityBot, OAI-SearchBot) — fetch HTML/markdown, no JavaScript execution, honor robots.txt, revisit on 2-7 day cadences.
- A2. **User-triggered agent fetchers** (ChatGPT-User, Perplexity-User, Claude infrastructure sending `Accept: text/markdown`) — fetch a specific URL during a live answer.
- A3. **IDE/desktop agents** (Claude Code, Cursor, Windsurf) — fetch llms.txt and follow its links.
- A4. **Interactive agents** (MCP clients) — query the site conversationally. Stretch.
- A5. **Brent** — edits the canon occasionally; otherwise absent. Connects DNS, GA4 property, and Vercel log drain in dashboards.
- A6. **Human visitors** — secondary audience; get a clean, readable, fast page.

## Requirements

**Content canon**

- R1. A structured content canon (data files in the repo) holds every business fact: bio with dated affiliations (including Moeda Seeds and Communitere, currently only in dxn.is llms.txt), services, the full client list, testimonials with attribution, the three-conditions framework, newsletter metadata, contact/CTAs, and the agent instruction set (target client band, disqualifiers, canonical CTAs).
- R2. Every published surface is generated from the canon at build time; no derived artifact is hand-maintained.
- R3. Canon facts carry `last_verified` dates that render on the surfaces that present them.
- R4. Editing one canon file and pushing is the complete editorial workflow; the build regenerates all surfaces.

**Generated surfaces**

- R5. Site pages: home, services, about (the authority record with dated affiliations and sameAs links), clients, vendor-diligence dossier, identity card, newsletter archive, observatory, and a page explaining how the site works for agents.
- R6. `llms.txt` per the llmstxt.org convention, generated from the canon, linking the markdown version of every page.
- R7. JSON-LD (Person, WebSite, ProfessionalService, Review) generated from the canon into page heads.
- R8. `robots.txt` welcoming citation-time bots with explicit policy comments; `.well-known` agent-manifest stubs hedged across the current competing specs; an accurate sitemap with real `lastmod` values.
- R9. A change feed (Atom and JSON) derived from git history of the canon, so revisiting crawlers can cheaply see what changed.
- R10. The identity card at `/card`: a single resource under 4KB in its markdown form that answers who/what/for whom/proof/disqualifiers/CTAs; other surfaces reference it.

**Agent access**

- R11. Every content URL serves HTML by default, markdown when the request prefers `text/markdown`, and JSON when it prefers `application/json`, with `Vary: Accept` and an `x-markdown-tokens` header on markdown responses.
- R12. All content is present in static HTML; no content requires JavaScript execution to read.
- R13. Responses carry accurate `ETag` and `Last-Modified` headers.
- R14. URLs are stable; the site works fully on its temporary vercel.app URL with absolute URLs derived from configuration, so connecting dxn.md later is a config change.

**Citation content**

- R15. The vendor-diligence dossier states fit criteria, explicit disqualifiers, engagement models, and diligence-phrased Q&A; key claims are formatted as quotable units with attribution embedded in the extractable text.
- R16. Every substantive content page contains at least two statistics, one attributed quotation, one external citation, and a dated byline (the GEO lint rule, R19).
- R17. The newsletter archive renders each AI for FIs issue from the Beehiiv RSS feed as a static dated page: abstract, key-facts box, canonical link to the Beehiiv post.

**Build gates**

- R18. The build fails if any derived surface is stale relative to the canon (canon-hash consistency check).
- R19. The build fails if a substantive content page violates the GEO lint rule (R16); the linter's page inclusion list is explicit so structural pages (card, feeds, observatory) are exempt.
- R20. The build fails if `/card`'s markdown form exceeds 4KB.

**Measurement**

- R21. GA4 wiring via environment variable, off gracefully when unset; documentation for enabling the AI Assistant channel.
- R22. A scheduled weekly rebuild (cron via GitHub Actions) refreshes the newsletter archive and observatory data with no human involvement.
- R23. The `/observatory` page renders whatever instrument data exists (bot visits, markdown-negotiation counts, query log) from committed data files, with honest empty states when a source is not yet wired; a documented 37-day citation audit checklist lives in the repo.

**Stretch**

- R24. An `/ask` endpoint accepts a natural-language question and returns a structured answer assembled from the canon, with each query logged.
- R25. An MCP endpoint exposes the canon as queryable tools/resources for MCP clients.

## Key Flows

- F1. **Agent fetch with negotiation.** **Trigger:** A2 requests any page with `Accept: text/markdown`. **Steps:** middleware detects preference; serves the pre-built markdown variant with `Vary: Accept`, `x-markdown-tokens`, `ETag`. **Outcome:** the agent gets the full content at ~20% of the HTML token cost. **Covers R11, R13.**
- F2. **Crawler discovery.** **Trigger:** A1 fetches `robots.txt`, sitemap, then pages. **Steps:** robots welcomes it; sitemap lastmod steers it to changed pages; static HTML carries all content; JSON-LD in heads. **Outcome:** full crawl with zero JS. **Covers R7, R8, R12.**
- F3. **Canon edit.** **Trigger:** A5 edits a canon file and pushes. **Steps:** build regenerates all surfaces; hash check and GEO lint gate the deploy; change feed gains an entry. **Outcome:** every surface updates atomically or the build fails loudly. **Covers R2, R4, R9, R18, R19.**
- F4. **Weekly self-refresh.** **Trigger:** scheduled cron. **Steps:** action pulls Beehiiv RSS, regenerates archive pages, refreshes observatory data files, commits, deploy runs with gates. **Outcome:** the site stays fresh with nobody touching it. **Covers R17, R22, R23.**

## Acceptance Examples

- AE1. `curl -H "Accept: text/markdown" <url>/services` returns markdown with `Vary: Accept` and `x-markdown-tokens` headers; the same URL without the header returns HTML. **Covers R11.**
- AE2. The generated `llms.txt` contains the Moeda Seeds and Communitere affiliations (proof the drifted bio is repatriated and generation works). **Covers R1, R6.**
- AE3. Deleting a statistic from the dossier page source makes the build fail with a GEO-lint error naming the page and rule. **Covers R16, R19.**
- AE4. `/card.md` byte size < 4096; build fails if a canon edit pushes it over. **Covers R10, R20.**
- AE5. With network access to the Beehiiv feed, the build emits at least one newsletter archive page with abstract, fact box, and canonical link; with the feed unreachable, the build succeeds using the last committed feed snapshot. **Covers R17, R22.**
- AE6. Viewing any page with JavaScript disabled shows the complete content. **Covers R12.**

## Scope Boundaries

**Deferred for later**

- dxn.is-side sync automation (PR bot opening changes against `septapod/dxnis`) — blocked on dxn.is gaining a structured content target; the canon is designed to support it.
- Paired-variant GEO experiments — the harness depends on months of traffic; design pages so variants are easy to add.
- Credit-union-AI glossary — strong candidate, highest refresh burden; revisit once the observatory shows what agents ask for.
- Citation-tracking SaaS (Otterly) — decision deferred until the 37-day audit gives a baseline.

**Outside this product's identity**

- x402 agent payments, DNS TXT identity records — rejected in ideation for weak evidence or audience friction.
- Full-text newsletter mirroring — canonical-URL hazard.
- Persuasion-oriented marketing copy — that is dxn.is's job; dxn.md is the facts layer.

## Dependencies / Assumptions

- The Beehiiv RSS feed (`rss.beehiiv.com/feeds/R3iSBAQYmq.xml`) is reachable at build time and carries usable abstracts. Unverified at requirements time: actual feed item shape. The build must degrade to title+date+link if abstracts are truncated, and the repo keeps a committed feed snapshot as fallback.
- Facts imported from dxn.is (content inventory captured 2026-06-12) are accurate; `last_verified` dates start at 2026-06-12.
- Brent-side dashboard tasks, documented but not blocking: connect dxn.md DNS in Vercel, create the GA4 property and set the env var, optionally configure a Vercel log drain for observatory bot data.
- GitHub repo creation and Vercel project linking are available from this machine (gh CLI authenticated, vercel CLI or dashboard).

## Outstanding Questions

**Deferred to Planning**

- Framework choice. Constraint it must satisfy: static-first output on Vercel with edge middleware for content negotiation, markdown-native content pipeline.
- Canon file layout (single file vs per-domain files) and format (YAML vs JSON).
- Token-count computation for `x-markdown-tokens` (estimator choice).
- `/ask` mechanism if stretch scope is reached (static retrieval over canon vs anything heavier).
- Whether the human-facing HTML shell reuses the dxn.is design tokens (`dsl-tokens.css` via CDN) or ships minimal self-contained styles.

## Sources / Research

- `docs/ideation/2026-06-12-dxn-md-agent-site-ideation.md` — ranked ideas, bases, rejection record.
- Grounding dossiers (session scratch, `/tmp/compound-engineering/ce-ideate/ca05bcc5/`): `grounding-context.md` (dxn.is content inventory and pain points), `web-research-result.md` (GEO/AEO evidence base with sources).
- Key external evidence: Princeton GEO paper (SIGKDD 2024) content-tactic lifts; Cloudflare Markdown for Agents (2026-02-12); 44-day markdown-negotiation tracking study; 30-day AI-crawler log study; GA4 AI Assistant channel (2026-05-13); llms.txt adoption research (presenc.ai 2026).
