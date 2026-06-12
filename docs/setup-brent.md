# Setup checklist for Brent

Things only you can do (dashboards and DNS). The site works without all of them; each unlocks a feature.

## 1. Connect the dxn.md domain (whenever you're ready)

1. Vercel dashboard → the `dxn-md` project → Settings → Domains → add `dxn.md`.
2. At your registrar, point the domain per Vercel's instructions (A record to `76.76.21.21` or the nameservers Vercel shows you).
3. In Vercel → Settings → Environment Variables, set `SITE_URL` to `https://dxn.md` (all environments), then redeploy. Every generated absolute URL switches over.

## 2. GA4 (unlocks the AI Assistant traffic channel)

1. Create a GA4 property at analytics.google.com.
2. Copy the Measurement ID (`G-XXXXXXX`).
3. Vercel → Settings → Environment Variables → add `GA4_MEASUREMENT_ID`, redeploy.
4. GA4 auto-tags AI-referred sessions in the "AI Assistant" channel (native since May 2026); no extra config.
5. Without this env var, no analytics script is emitted at all.

## 3. Vercel log drain (unlocks the observatory's bot data)

1. Vercel → Team Settings → Log Drains → add a drain (any destination you like; a simple option is Axiom's free tier).
2. Bot data processing into `data/observatory/*.json` is a follow-up automation (deferred in the plan); until then the observatory shows honest empty states.
3. Zero-cost alternative meanwhile: Vercel dashboard → project → Logs, filter by user agent (`GPTBot`, `ClaudeBot`, `ChatGPT-User`, `PerplexityBot`).

## 4. Repo visibility

The repo was created private. The site's footer links to it; flip it public when you're comfortable (the canon contains only facts that are already on dxn.is).

## 5. /api/ask query log

Agent questions are logged as `ask_query` JSON lines in the function logs (Vercel → project → Logs → filter `ask_query`). That corpus tells you what agents actually want to know — it's the content roadmap.

## 6. The 37-day audit

`docs/audit-37-day.md` — run it around 2026-07-19 (37 days after launch). It tells you whether the site has a structural problem or just needs patience.

## 7. dxn.is follow-ups (deferred by design)

- The dxn.is `llms.txt` is still hand-maintained over there. Long-term plan: dxn.is consumes this repo's canon (a sync PR bot is deferred until dxn.is has a structured content target).
- Consider linking `dxn.is/agents` → `dxn.md` so agents discover the machine-readable companion.
