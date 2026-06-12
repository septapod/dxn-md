import { describe, expect, it } from "vitest";
import { loadFeedSnapshot, parseFeed } from "../src/build/feed.js";

const item = (title: string, slug: string, date = "Tue, 09 Jun 2026 08:30:00 +0000") => `
  <item>
    <title>${title}</title>
    <description>An abstract for ${title}.</description>
    <link>https://ai4fis.beehiiv.com/p/${slug}</link>
    <pubDate>${date}</pubDate>
    <dc:creator>Brent Dixon</dc:creator>
    <category><![CDATA[Agentic Ai]]></category>
  </item>`;

const wrap = (items: string) =>
  `<?xml version="1.0"?><rss version="2.0" xmlns:dc="http://purl.org/dc/elements/1.1/"><channel><title>AI for FIs</title>${items}</channel></rss>`;

describe("feed parsing", () => {
  it("parses items with abstract, canonical link, date, and slug", () => {
    const items = parseFeed(wrap(item("Issue One", "issue-one")));
    expect(items).toHaveLength(1);
    expect(items[0]).toMatchObject({
      title: "Issue One",
      slug: "issue-one",
      date: "2026-06-09",
      link: "https://ai4fis.beehiiv.com/p/issue-one",
      creator: "Brent Dixon",
    });
    expect(items[0]!.categories).toContain("Agentic Ai");
  });

  it("skips malformed items without crashing", () => {
    const malformed = `<item><title>No link</title><pubDate>bad date</pubDate></item>`;
    const items = parseFeed(wrap(malformed + item("Good", "good")));
    expect(items).toHaveLength(1);
    expect(items[0]!.slug).toBe("good");
  });

  it("dedupes slug collisions deterministically (first wins)", () => {
    const items = parseFeed(wrap(item("First", "same") + item("Second", "same")));
    expect(items).toHaveLength(1);
    expect(items[0]!.title).toBe("First");
  });

  it("AE5: the committed snapshot yields at least one issue page input", () => {
    const items = loadFeedSnapshot("data/feed-snapshot.xml");
    expect(items.length).toBeGreaterThan(0);
    expect(items[0]!.description.length).toBeGreaterThan(10);
  });
});
