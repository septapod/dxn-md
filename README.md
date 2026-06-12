# dxn.md — the agent-native site

The machine-readable companion to [dxn.is](https://dxn.is). Every surface — pages, llms.txt, JSON-LD, feeds, robots.txt — is generated at build time from a structured content canon in `content/canon/`. Drift between the canon and any surface is a build failure, not an editorial risk.

## How it works

- **One canon, three variants.** Each page URL serves HTML to browsers, markdown via `Accept: text/markdown` (with `x-markdown-tokens`), and JSON via `Accept: application/json`. Direct `.md` / `.json` paths work too. Negotiation happens in `middleware.ts`.
- **Build gates.** The build fails if a substantive page lacks the GEO content rule (2 statistics, 1 attributed quote, 1 external citation, dated byline), if `/card.md` exceeds 4KB, or (in CI) if a second build isn't byte-identical.
- **Self-refreshing.** A weekly GitHub Action pulls the AI for FIs feed snapshot, regenerates the change log from git history, and pushes — which redeploys the site. No human required.
- **Agent endpoints.** `POST /api/ask` answers questions from the canon; `/mcp` is a Model Context Protocol endpoint exposing the canon as tools.

## Editing content

Edit a YAML file in `content/canon/`, commit, push. That is the entire editorial workflow — every surface regenerates. Update the fact's `last_verified` date when you verify it.

## Commands

```bash
npm run build       # generate dist/ (gates run inside)
npm test            # vitest suite
npm run typecheck   # tsc --noEmit
npm run refresh     # pull the latest feed snapshot (normally the weekly Action's job)
npm run changes     # regenerate data/changes.json from git history
```

## Layout

- `content/canon/` — the facts. The only thing a human edits.
- `src/pages/` — page definitions (structured blocks, not templates).
- `src/build/` — emitters (HTML/markdown/JSON), protocol surfaces, gates.
- `src/generated/` — build-written bridge files imported by `middleware.ts` and `api/*` (tracked in git, freshness-gated in CI).
- `data/` — feed snapshot, change log, observatory data files.
- `api/` — `/api/ask` and `/mcp` serverless functions.
- `docs/` — plans, brainstorms, ideation, setup notes, audit checklist.

Owner setup steps (DNS, GA4, log drain) live in `docs/setup-brent.md`.
