import type { Canon } from "../canon/schema.js";
import { quoteAttribution, requireTestimonial } from "../canon/load.js";
import type { Page } from "../build/page.js";
import { personLd } from "../build/jsonld.js";

// The authority record: every affiliation dated and detailed, in one place.
// This page repatriates the bio facts that previously lived only in dxn.is
// llms.txt (Moeda Seeds, Communitere International).
export function buildAbout(canon: Canon, ctx: { bylineDate: string; siteUrl: string }): Page {
  const hofheimer = requireTestimonial(canon, "Hofheimer Strategy Advisors");
  return {
    route: "/about",
    title: `About ${canon.bio.name} — the authority record`,
    description: `${canon.bio.name} is a ${canon.bio.title.toLowerCase()} based in ${canon.bio.location}. Full professional record with dated affiliations.`,
    byline_date: ctx.bylineDate,
    last_verified: canon.bio.last_verified,
    geo_lint: true,
    jsonld: [personLd(canon, ctx.siteUrl)],
    sections: [
      {
        heading: "Narrative",
        blocks: canon.bio.narrative.map((text) => ({ kind: "prose" as const, text })),
      },
      {
        heading: "Affiliations",
        blocks: [
          {
            kind: "facts",
            items: canon.bio.affiliations.map((a) => ({
              label: `${a.org} — ${a.role}${a.start ? ` (${a.start}${a.current ? "–present" : ""})` : ""}`,
              value: a.detail,
            })),
          },
          {
            kind: "stat",
            value: "20 years",
            label: "working alongside communities and cooperatives before founding Dixon Strategic Labs",
          },
          {
            kind: "stat",
            value: "six-figure",
            label: "funding secured by startup teams Brent mentored as Singularity University's Future of Finance Teaching Fellow, one later acquired",
          },
        ],
      },
      {
        heading: canon.framework.name,
        blocks: [
          { kind: "prose", text: canon.framework.intro },
          {
            kind: "list",
            ordered: true,
            items: canon.framework.conditions.map((c) => `**${c.name}.** ${c.body}`),
          },
          ...(canon.framework.conditions[1]?.citation
            ? [
                {
                  kind: "links" as const,
                  items: [
                    {
                      label: canon.framework.conditions[1].citation.source,
                      url: canon.framework.conditions[1].citation.url,
                      note: "the Porter essay the prioritized-choices condition draws on",
                    },
                  ],
                },
              ]
            : []),
        ],
      },
      {
        heading: "Independent assessment",
        blocks: [
          { kind: "quote", text: hofheimer.quote, attribution: quoteAttribution(hofheimer) },
          { kind: "facts", items: [{ label: "Speaking representation", value: canon.bio.speaking_representation }] },
        ],
      },
    ],
  };
}
