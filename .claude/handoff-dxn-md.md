# Handoff — dxn-md

**Timestamp:** 2026-06-12 ~17:30 PT
**Session:** Autonomous compound-engineering run (started from a pini-rooted session; this project was created mid-session).

## What happened
Full pipeline in one shot per Brent's kickoff note: ce-ideate → curate → ce-brainstorm (doc written directly; no human in loop) → ce-plan (+ fresh-context plan review, 11 findings fixed) → build → deploy → code review (7 finder angles) → fixes → redeploy → verified live.

## State
- **Live:** https://dxn-md.vercel.app · repo `septapod/dxn-md` (private) · Vercel project `septapods-projects/dxn-md`, git-connected (push = deploy)
- CI green; 36 tests; gates: GEO lint, 4KB card, nav coverage, determinism, src/generated freshness
- Weekly refresh workflow: Mondays 06:00 UTC, pulls Beehiiv snapshot + regenerates changes.json, bot push redeploys

## Key decisions
- Custom TS static generator (no framework); tri-variant pages (HTML/.md/.json) from one canon (`content/canon/*.yaml` — the only thing humans edit)
- Middleware negotiates via Accept; vercel.json owns .md Content-Type; token counts from generated manifest (src/generated is tracked + CI freshness-gated)
- MCP: mcp-handler, basePath "" (functions see ORIGINAL path on rewrites — hard-won fact), rewrite scoped to exactly /mcp
- Vercel middleware bundler rejects JSON import attributes → generated bridge files are .ts modules
- Newsletter: abstracts + canonical links only (no full-text mirroring)

## Files touched
Everything in ~/dev/dxn-md (greenfield). Artifacts: docs/ideation/, docs/brainstorms/, docs/plans/ (2026-06-12-* files). Last modified: PROJECT_STATUS.md.

## Next steps
Brent-side: DNS + SITE_URL env, GA4 env var, repo visibility (see docs/setup-brent.md). 2026-07-19: docs/audit-37-day.md. Deferred: dxn.is sync bot, observatory log-drain automation, CU-AI glossary.

## Unresolved
- ai-agent.json stub fields unvalidated against Aiia's validator (spec page is JS-rendered; stub is name+description+protocols, schema-minimal)
- Observatory shows honest empty states until log drain is wired
