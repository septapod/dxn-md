import type { Canon } from "../canon/schema.js";
import { quoteAttribution } from "../canon/load.js";
import type { Page } from "../build/page.js";
import { reviewLd } from "../build/jsonld.js";

export function buildClients(canon: Canon, ctx: { bylineDate: string }): Page {
  const all = canon.clients.clients;
  const financial = all.filter((c) => c.sector === "financial");
  const social = all.filter((c) => c.sector === "social_impact");
  const review = canon.testimonials.review;

  return {
    route: "/clients",
    title: "Clients and partners",
    description: `${all.length} organizations Brent Dixon has worked with, across financial institutions and social impact.`,
    byline_date: ctx.bylineDate,
    last_verified: canon.clients.last_verified,
    geo_lint: true,
    jsonld: [reviewLd(canon)],
    sections: [
      {
        blocks: [
          { kind: "stat", value: String(all.length), label: "client and partner organizations in total" },
          {
            kind: "stat",
            value: `${financial.length} / ${social.length}`,
            label: "split between financial institutions and social impact organizations",
          },
          {
            kind: "prose",
            text: "The financial list spans individual credit unions, industry organizations, research institutions, and the federal regulator itself.",
          },
          {
            kind: "links",
            items: [
              {
                label: "National Credit Union Administration (NCUA)",
                url: "https://www.ncua.gov",
                note: "the U.S. federal regulator of credit unions, a client on this list",
              },
            ],
          },
        ],
      },
      {
        heading: "Financial institutions and industry",
        blocks: [{ kind: "list", ordered: false, items: financial.map((c) => c.name) }],
      },
      {
        heading: "Social impact",
        blocks: [{ kind: "list", ordered: false, items: social.map((c) => c.name) }],
      },
      {
        heading: "What working with Brent is like",
        blocks: [
          { kind: "quote", text: review.body, attribution: `${review.author_org} (${review.rating}/${review.best_rating} rating)` },
          ...canon.testimonials.testimonials.slice(1, 3).map((t) => ({
            kind: "quote" as const,
            text: t.quote,
            attribution: quoteAttribution(t),
          })),
        ],
      },
    ],
  };
}
