// Generators for the discovery and freshness surfaces: llms.txt, robots.txt,
// sitemap.xml, the change feed (Atom + JSON), and .well-known agent manifests.

import type { Canon } from "../canon/schema.js";
import type { Page } from "../build/page.js";
import { mdPath } from "./page.js";
import type { TokenManifest } from "./tokens.js";
import { escapeHtml } from "./html.js";

export interface ChangeLog {
  updated: string;
  entries: { date: string; summary: string; areas: string[] }[];
}

export function renderLlmsTxt(
  canon: Canon,
  pages: Page[],
  manifest: TokenManifest,
  siteUrl: string,
): string {
  const pageLines = pages
    .filter((p) => !p.route.startsWith("/newsletter/"))
    .map((p) => {
      const md = mdPath(p.route);
      const tokens = manifest[md]?.tokens;
      return `- [${p.title}](${siteUrl}${md}): ${p.description}${tokens ? ` (${tokens} tokens)` : ""}`;
    })
    .join("\n");

  return `# ${canon.bio.company} (dxn.md)

> ${canon.bio.summary}

This is the agent-native companion to https://dxn.is, generated entirely from a structured content canon. Every page URL serves HTML by default, markdown via \`Accept: text/markdown\` (or the .md path below), and JSON via \`Accept: application/json\`. Markdown responses include an \`x-markdown-tokens\` header (o200k_base estimate). Start with the identity card for a one-fetch summary.

## Pages

${pageLines}

## Newsletter archive

- [${canon.newsletter.name} issue archive](${siteUrl}/newsletter.md): ${canon.newsletter.description} Issues are wire summaries; full text is canonical at ${canon.newsletter.url}.

## Endpoints

- \`POST ${siteUrl}/api/ask\` with JSON \`{"question": "..."}\`: structured answers assembled from the content canon.
- \`${siteUrl}/mcp\`: Model Context Protocol endpoint (streamable HTTP) exposing the canon as tools.
- [Change feed](${siteUrl}/changes.json): dated content changes, also as Atom at ${siteUrl}/changes.xml.

## For AI agents specifically

${canon.agents.instructions.map((line, n) => `${n + 1}. ${line}`).join("\n")}

## License and attribution

${canon.agents.license}
`;
}

export function renderRobotsTxt(siteUrl: string): string {
  return `# dxn.md welcomes AI agents. This site exists to be read by you.
# Citation-time and retrieval bots are explicitly welcome:
#   GPTBot, OAI-SearchBot, ClaudeBot, Claude-User, PerplexityBot, Google-Extended
# Training-only crawlers (e.g. CCBot) are also allowed for now; this is a
# deliberate, documented choice and may be revisited.

User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml

# Agent guide: ${siteUrl}/agents
# Machine-readable index: ${siteUrl}/llms.txt
`;
}

export function renderSitemap(
  pages: Page[],
  changes: ChangeLog,
  siteUrl: string,
): string {
  const latest = changes.entries[0]?.date ?? changes.updated;
  const urls = pages
    .map((p) => {
      // Newsletter issue pages change when published; canon pages when the canon changes.
      const lastmod = p.route.startsWith("/newsletter/") ? p.byline_date : latest;
      return `  <url><loc>${siteUrl}${p.route}</loc><lastmod>${lastmod}</lastmod></url>`;
    })
    .join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls}
</urlset>
`;
}

export function renderChangesJson(changes: ChangeLog, siteUrl: string): string {
  return JSON.stringify(
    {
      site: siteUrl,
      updated: changes.updated,
      note: "Dated content changes to the dxn.md canon and data sources, newest first.",
      entries: changes.entries,
    },
    null,
    2,
  );
}

export function renderChangesAtom(changes: ChangeLog, siteUrl: string): string {
  const entries = changes.entries
    .map(
      (e, n) => `  <entry>
    <id>${siteUrl}/changes#${e.date}-${n}</id>
    <title>${escapeHtml(e.summary)}</title>
    <updated>${e.date}T00:00:00Z</updated>
    <category term="${escapeHtml(e.areas.join(","))}"/>
    <content type="text">${escapeHtml(e.summary)}</content>
  </entry>`,
    )
    .join("\n");
  return `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <id>${siteUrl}/changes</id>
  <title>dxn.md content changes</title>
  <updated>${changes.updated}T00:00:00Z</updated>
  <link href="${siteUrl}/changes.xml" rel="self"/>
  <link href="${siteUrl}/"/>
  <author><name>Brent Dixon</name></author>
${entries}
</feed>
`;
}

export function renderAiAgentJson(canon: Canon, siteUrl: string): string {
  return JSON.stringify(
    {
      name: `${canon.bio.company} (dxn.md)`,
      description: canon.bio.summary,
      protocols: { mcp: `${siteUrl}/mcp`, ask: `${siteUrl}/api/ask` },
      contact: canon.contact.email,
    },
    null,
    2,
  );
}

export function renderAgentCardJson(canon: Canon, siteUrl: string): string {
  // Minimal A2A-style agent card; this site is a content service, not an
  // autonomous agent, and the card says so.
  return JSON.stringify(
    {
      name: `${canon.bio.company} content service`,
      description: `${canon.bio.summary} This endpoint serves facts about Brent Dixon's practice; it is a queryable content service, not an autonomous agent.`,
      url: siteUrl,
      version: "1.0.0",
      capabilities: { streaming: false },
      skills: [
        { id: "ask", name: "Ask about Brent Dixon's practice", description: `POST ${siteUrl}/api/ask` },
        { id: "mcp", name: "MCP tools over the content canon", description: `${siteUrl}/mcp` },
      ],
    },
    null,
    2,
  );
}
