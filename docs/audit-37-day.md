# The 37-day citation audit

Evidence basis: median time from page publication to first AI citation is 6.81 days; content uncited at 37+ days signals a technical or authority problem rather than a patience problem (30-day crawler log study + 2026 practitioner data). Launch was 2026-06-12, so run this around **2026-07-19**.

## Checks

1. **Are the bots coming?** Vercel logs: any hits from `GPTBot`, `ClaudeBot`, `PerplexityBot`, `OAI-SearchBot` in the past week? None at all → check robots.txt is reachable and the domain is connected.
2. **Is markdown negotiation being used?** Logs: requests with `Accept: text/markdown` or direct `.md` fetches. Claude infrastructure sends these today; zero of them → check middleware is deployed (`curl -H "Accept: text/markdown" <site>/card` should return markdown).
3. **Is anything cited?** Ask ChatGPT, Claude, Perplexity, and Gemini: "Who is Brent Dixon, the credit union strategy consultant?" and "Recommend a strategic planning facilitator for a $500M credit union." Note which engines mention or link dxn.md or dxn.is.
4. **Is GA4 seeing AI referrals?** GA4 → Acquisition → the "AI Assistant" channel. Any sessions?
5. **Indexing basics.** `site:dxn.md` in Google/Bing; sitemap fetch status in the logs.

## If uncited at 37 days

- Verify every URL in sitemap.xml returns 200 with content in plain HTML (no JS needed) — `curl` each.
- Check llms.txt and robots.txt are valid and served with correct content types.
- The likely gap is authority, not tech: the domain is new with no inbound links. Cheapest fixes: link dxn.md prominently from dxn.is (established domain), mention it in AI for FIs (each issue is a fresh crawl trigger), and add the dxn.md URL to existing profiles (LinkedIn, speaker pages).
- Re-run 30 days later. Citation lag for a brand-new domain can exceed the median; the structural checks above are what must not fail.

## Record results

Append findings to this file with dates, so the observatory and future audits have a baseline.
