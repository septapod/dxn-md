import type { Canon } from "../canon/schema.js";
import type { Page } from "../build/page.js";
import type { FeedItem } from "../build/feed.js";

export function buildNewsletterIndex(
  canon: Canon,
  items: FeedItem[],
  ctx: { bylineDate: string },
): Page {
  const n = canon.newsletter;
  return {
    route: "/newsletter",
    title: `${n.name} — issue archive`,
    description: n.description,
    byline_date: ctx.bylineDate,
    last_verified: n.last_verified,
    geo_lint: false,
    jsonld: [],
    sections: [
      {
        blocks: [
          { kind: "prose", text: n.positioning },
          { kind: "facts", items: [
            { label: "Cadence", value: n.cadence },
            { label: "Subscribe", value: n.url },
            { label: "Issues archived here", value: String(items.length) },
          ] },
        ],
      },
      {
        heading: "Issues",
        blocks: [
          {
            kind: "links",
            items: items.map((i) => ({
              label: `${i.date} — ${i.title}`,
              url: `/newsletter/${i.slug}`,
              note: i.description.length > 120 ? `${i.description.slice(0, 117)}...` : i.description,
            })),
          },
        ],
      },
    ],
  };
}

// Wire-format issue page: dateline, abstract, topics, canonical link. The full
// text stays on Beehiiv (canonical); this page is the citable, crawlable summary.
export function buildIssuePage(canon: Canon, item: FeedItem, ctx: { bylineDate: string }): Page {
  return {
    route: `/newsletter/${item.slug}`,
    title: item.title,
    description: item.description,
    byline_date: item.date,
    last_verified: canon.newsletter.last_verified,
    geo_lint: false, // wire summaries of canonical Beehiiv content; see plan U8
    jsonld: [
      {
        "@context": "https://schema.org",
        "@type": "Article",
        headline: item.title,
        datePublished: item.date,
        author: { "@type": "Person", name: item.creator },
        publisher: { "@type": "Person", name: "Brent Dixon" },
        url: item.link,
        description: item.description,
      },
    ],
    sections: [
      {
        blocks: [
          {
            kind: "facts",
            items: [
              { label: "Issue", value: `${canon.newsletter.name}, ${item.date}` },
              { label: "Author", value: item.creator },
              ...(item.categories.length ? [{ label: "Topics", value: item.categories.join(", ") }] : []),
            ],
          },
          { kind: "prose", text: item.description },
          {
            kind: "links",
            items: [
              { label: "Read the full issue (canonical)", url: item.link },
              { label: `Subscribe to ${canon.newsletter.name}`, url: canon.newsletter.url },
            ],
          },
        ],
      },
    ],
  };
}
