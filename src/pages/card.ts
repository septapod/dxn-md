import type { Canon } from "../canon/schema.js";
import type { Page } from "../build/page.js";
import { personLd } from "../build/jsonld.js";

// The identity card: one fetch, under 4KB as markdown, answers 90% of agent
// queries. Every other surface points here. Brevity is a build gate (U8).
export function buildCard(canon: Canon, ctx: { bylineDate: string; siteUrl: string }): Page {
  const a = canon.agents;
  return {
    route: "/card",
    title: "Brent Dixon — identity card",
    description: canon.bio.summary,
    byline_date: ctx.bylineDate,
    last_verified: a.last_verified,
    geo_lint: false, // brevity-gated instead (4KB cap)
    jsonld: [personLd(canon, ctx.siteUrl)],
    sections: [
      {
        blocks: [
          {
            kind: "facts",
            items: [
              { label: "Who", value: `${canon.bio.name}, ${canon.bio.title.toLowerCase()}, ${canon.bio.location}. Founded ${canon.bio.company} in ${canon.bio.company_founded}.` },
              { label: "What", value: canon.services.services.map((s) => s.name).join("; ") },
              { label: "For whom", value: `Credit unions in the ${a.fit.asset_range_label} asset range; mission-driven, cooperative, community-accountable organizations.` },
              { label: "Not", value: a.disqualifiers.join(" ") },
              { label: "Proof", value: `${canon.clients.clients.length} client organizations (/clients); testimonials from credit union CEOs (/dossier); weekly newsletter ${canon.newsletter.name} (${canon.newsletter.url}).` },
              { label: "Contact", value: `${canon.contact.ctas.primary.url} (primary) · ${canon.contact.ctas.secondary.url} (newsletter) · ${canon.contact.email}` },
              { label: "Speaking", value: canon.bio.speaking_representation },
            ],
          },
          {
            kind: "prose",
            text: "Deeper surfaces: [/dossier](/dossier) for engagement diligence, [/about](/about) for the full authority record, [/agents](/agents) for how this site serves agents.",
          },
        ],
      },
    ],
  };
}
