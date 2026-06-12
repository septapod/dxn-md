# dxn-md — Project Status

Agent-optimized companion site to dxn.is, served at dxn.md: every surface generated from a canonical facts layer, with content negotiation, agent endpoints, and built-in measurement.

## Key dates
- 2026-06-12 — project created; autonomous compound-engineering run: ideate → brainstorm → plan → build → review
- ~2026-07-19 — run `docs/audit-37-day.md` (citation audit)

## Current state
**Phase: built, deploying.** Site builds green (29 pages, 36 tests passing, typecheck clean). Build gates working (GEO lint, 4KB card cap, determinism in CI). Pushing to GitHub and deploying to Vercel next, then code review.

## Decisions made
- Custom TypeScript static generator, no framework (markdown is the primary artifact; zero client JS)
- Content canon in `content/canon/*.yaml` is the source of truth; dxn.md owns the facts going forward, dxn.is sync deferred
- Tri-variant pages (HTML/md/JSON) negotiated by `middleware.ts` via Accept header
- Newsletter archive = abstract + fact box + canonical Beehiiv link (no full-text mirroring)
- MCP via `mcp-handler@1.1.x` + SDK 1.26.0 pinned; rewrite scoped to `/mcp`
- Repo private at creation; Brent flips public when ready
- Full decision record: `docs/plans/2026-06-12-001-feat-dxn-md-agent-site-plan.md`

## Open questions
1. Domain DNS connection timing (Brent; see `docs/setup-brent.md`)
2. GA4 property + `GA4_MEASUREMENT_ID` env var (Brent)
3. Log drain for observatory bot data (Brent, optional)

## Files in this folder
- `PROJECT_STATUS.md` — this file
- `docs/ideation/`, `docs/brainstorms/`, `docs/plans/` — compound-engineering artifacts
- `docs/setup-brent.md` — Brent's dashboard checklist
- `docs/audit-37-day.md` — citation audit, run ~2026-07-19
- `content/canon/` — the facts layer (the only thing to hand-edit)

## Next actions (ordered)
1. GitHub repo + Vercel deploy + live smoke tests
2. Code review pass, fix findings
3. Brent: DNS, GA4, review `docs/setup-brent.md`
