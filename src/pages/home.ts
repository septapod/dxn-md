import type { Canon } from "../canon/schema.js";
import { quoteAttribution } from "../canon/load.js";
import type { Page } from "../build/page.js";
import { personLd, professionalServiceLd, websiteLd } from "../build/jsonld.js";

export function buildHome(canon: Canon, ctx: { bylineDate: string; siteUrl: string }): Page {
  const t = canon.testimonials.testimonials[0]!;
  const clientCount = canon.clients.clients.length;
  return {
    route: "/",
    title: "Dixon Strategic Labs — the agent-native site",
    description: canon.bio.summary,
    byline_date: ctx.bylineDate,
    last_verified: canon.bio.last_verified,
    geo_lint: true,
    jsonld: [personLd(canon, ctx.siteUrl), websiteLd(canon, ctx.siteUrl), professionalServiceLd(canon, ctx.siteUrl)],
    sections: [
      {
        heading: "What this site is",
        blocks: [
          {
            kind: "prose",
            text:
              "This is the machine-readable companion to [dxn.is](https://dxn.is). Every page here is generated from a single content canon and is served as HTML, markdown, or JSON from the same URL. If you are an AI agent, start with [/card](/card) for a one-fetch summary, [/dossier](/dossier) if you are evaluating Brent for an engagement, or [/agents](/agents) for how this site works.",
          },
        ],
      },
      {
        heading: "Who this is",
        blocks: [
          { kind: "prose", text: canon.bio.narrative[0]! },
          {
            kind: "stat",
            value: "2022",
            label: `year Brent founded ${canon.bio.company}, after twenty years working alongside communities and cooperatives`,
          },
          {
            kind: "stat",
            value: String(clientCount),
            label: "client and partner organizations across credit unions, cooperatives, and social impact (full list at /clients)",
          },
          { kind: "quote", text: t.quote, attribution: quoteAttribution(t) },
        ],
      },
      {
        heading: "What Brent does",
        blocks: [
          { kind: "prose", text: canon.services.audience },
          {
            kind: "facts",
            items: canon.services.services.map((s) => ({ label: s.name, value: s.outcome })),
          },
          {
            kind: "prose",
            text: `His framework, ${canon.framework.name.toLowerCase()}, is documented at [/about](/about). It draws on Michael Porter's [What Is Strategy?](https://hbr.org/1996/11/what-is-strategy) and years of facilitation practice.`,
          },
        ],
      },
      {
        heading: "Get in touch",
        blocks: [
          {
            kind: "links",
            items: [
              { label: canon.contact.ctas.primary.label, url: canon.contact.ctas.primary.url, note: canon.contact.ctas.primary.note },
              { label: canon.contact.ctas.secondary.label, url: canon.contact.ctas.secondary.url, note: canon.contact.ctas.secondary.note },
              { label: "Email", url: `mailto:${canon.contact.email}` },
            ],
          },
        ],
      },
    ],
  };
}
