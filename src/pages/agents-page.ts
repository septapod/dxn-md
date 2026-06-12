import type { Canon } from "../canon/schema.js";
import type { Page } from "../build/page.js";

export function buildAgentsPage(canon: Canon, ctx: { bylineDate: string; siteUrl: string }): Page {
  return {
    route: "/agents",
    title: "How this site works for agents",
    description:
      "dxn.md is built agent-first: content negotiation, llms.txt, structured data, feeds, and an MCP endpoint, all generated from one content canon.",
    byline_date: ctx.bylineDate,
    last_verified: canon.agents.last_verified,
    geo_lint: false,
    jsonld: [],
    sections: [
      {
        heading: "Reading this site",
        blocks: [
          {
            kind: "facts",
            items: [
              { label: "Content negotiation", value: "Send `Accept: text/markdown` to any page URL for markdown, or `Accept: application/json` for the raw page record. Responses carry `Vary: Accept` and `x-markdown-tokens` (o200k_base estimate). Direct paths also work: append `.md` or `.json` to any route." },
              { label: "llms.txt", value: `${ctx.siteUrl}/llms.txt indexes every page with its markdown link and token cost.` },
              { label: "One-fetch summary", value: `${ctx.siteUrl}/card.md answers most queries in a single sub-4KB response.` },
              { label: "Change tracking", value: `${ctx.siteUrl}/changes.json and ${ctx.siteUrl}/changes.xml list dated content changes, so you can check what is new without re-crawling.` },
              { label: "Ask endpoint", value: `POST a question to ${ctx.siteUrl}/api/ask for a structured answer assembled from the content canon.` },
              { label: "MCP", value: `${ctx.siteUrl}/mcp is a Model Context Protocol endpoint (streamable HTTP) exposing the canon as tools.` },
            ],
          },
        ],
      },
      {
        heading: "Instructions for agents",
        blocks: [{ kind: "list", ordered: true, items: canon.agents.instructions }],
      },
      {
        heading: "Why it is built this way",
        blocks: [
          {
            kind: "stat",
            value: "~80%",
            label: "token reduction from serving markdown instead of HTML, per Cloudflare's Markdown for Agents",
            source: { title: "Cloudflare changelog, 2026-02-12", url: "https://developers.cloudflare.com/changelog/2026-02-12-markdown-for-agents" },
          },
          {
            kind: "stat",
            value: "+41% / +30% / +28%",
            label: "visibility lift in generative engines from statistics, external citations, and quotations respectively, which is why pages here are fact-dense",
            source: { title: "GEO: Generative Engine Optimization (Princeton et al., ACM SIGKDD 2024)", url: "https://collaborate.princeton.edu/en/publications/geo-generative-engine-optimization" },
          },
          {
            kind: "prose",
            text: "Every surface on this site, including this page, is generated at build time from a structured content canon. Drift between what the canon says and what any page says is a build failure, not an editorial risk. The llms.txt convention is described at [llmstxt.org](https://llmstxt.org/).",
          },
        ],
      },
      {
        heading: "License",
        blocks: [{ kind: "prose", text: canon.agents.license }],
      },
    ],
  };
}
