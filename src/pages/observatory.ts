import type { Canon } from "../canon/schema.js";
import type { Page, Block } from "../build/page.js";

export interface ObservatoryData {
  bots: { updated: string | null; entries: { week: string; bot: string; hits: number }[] };
  negotiation: { updated: string | null; entries: { week: string; markdown_requests: number; json_requests: number }[] };
  queries: { updated: string | null; entries: { date: string; question: string }[] };
}

function instrument(
  name: string,
  updated: string | null,
  rows: string[],
  emptyNote: string,
): { heading: string; blocks: Block[] } {
  return {
    heading: name,
    blocks:
      updated && rows.length
        ? [
            { kind: "facts" as const, items: [{ label: "Last updated", value: updated }] },
            { kind: "list" as const, ordered: false, items: rows },
          ]
        : [{ kind: "prose" as const, text: `Not yet wired. ${emptyNote}` }],
  };
}

export function buildObservatory(
  canon: Canon,
  data: ObservatoryData,
  ctx: { bylineDate: string },
): Page {
  return {
    route: "/observatory",
    title: "Observatory — the lab's instrument readings",
    description:
      "Public measurements from running an agent-native site: crawler visits, content-negotiation rates, and what agents ask.",
    byline_date: ctx.bylineDate,
    last_verified: canon.agents.last_verified,
    geo_lint: false,
    jsonld: [],
    sections: [
      {
        blocks: [
          {
            kind: "prose",
            text: "This site is partly a lab for agentic search optimization. The instruments below publish their own readings; honest empty states mean a data source is not connected yet. Methodology and the 37-day citation audit live in the repo's docs.",
          },
        ],
      },
      instrument(
        "Crawler visits",
        data.bots.updated,
        data.bots.entries.map((e) => `${e.week}: ${e.bot} — ${e.hits} hits`),
        "Requires a Vercel log drain; see docs/setup-brent.md in the repo.",
      ),
      instrument(
        "Content negotiation",
        data.negotiation.updated,
        data.negotiation.entries.map(
          (e) => `${e.week}: ${e.markdown_requests} markdown requests, ${e.json_requests} JSON requests`,
        ),
        "Populated from function and middleware logs once the log drain is connected.",
      ),
      instrument(
        "What agents ask",
        data.queries.updated,
        data.queries.entries.map((e) => `${e.date}: "${e.question}"`),
        "Populated from /api/ask query logs once collection is wired.",
      ),
    ],
  };
}
