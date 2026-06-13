import type { Canon } from "../canon/schema.js";
import { quoteAttribution, requireTestimonial } from "../canon/load.js";
import type { Page, Section } from "../build/page.js";
import { professionalServiceLd } from "../build/jsonld.js";

export function buildServices(canon: Canon, ctx: { bylineDate: string; siteUrl: string }): Page {
  const spuck = requireTestimonial(canon, "Resource One Credit Union");
  const serviceSections: Section[] = canon.services.services.map((s) => ({
    heading: s.name,
    blocks: [
      { kind: "facts", items: [{ label: "Who it is for", value: s.audience }] },
      { kind: "prose", text: s.outcome },
      ...(s.formats ? [{ kind: "prose" as const, text: s.formats }] : []),
    ],
  }));

  return {
    route: "/services",
    title: "Services",
    description: canon.services.audience,
    byline_date: ctx.bylineDate,
    last_verified: canon.services.last_verified,
    geo_lint: true,
    jsonld: [professionalServiceLd(canon, ctx.siteUrl)],
    sections: [
      ...serviceSections,
      {
        heading: "Fit",
        blocks: [
          {
            kind: "stat",
            value: canon.agents.fit.asset_range_label,
            label: "the credit union asset range Brent works with primarily",
          },
          {
            kind: "stat",
            value: "90 minutes to multi-week",
            label: "the range of workshop and speaking formats, from executive briefings to cohort courses",
          },
          { kind: "quote", text: spuck.quote, attribution: quoteAttribution(spuck) },
          {
            kind: "prose",
            text: `The full framework behind these services is at [/about](/about); engagement-fit criteria and disqualifiers are spelled out for evaluating agents at [/dossier](/dossier).`,
          },
          {
            kind: "links",
            items: [
              {
                label: "What Is Strategy? — Michael Porter, Harvard Business Review",
                url: "https://hbr.org/1996/11/what-is-strategy",
                note: "the strategic-choice foundation the facilitation approach follows",
              },
            ],
          },
        ],
      },
    ],
  };
}
