import { readFileSync } from "node:fs";
import { XMLParser } from "fast-xml-parser";

export interface FeedItem {
  title: string;
  description: string;
  link: string;
  date: string; // YYYY-MM-DD
  creator: string;
  categories: string[];
  slug: string;
}

function slugFromLink(link: string): string | null {
  try {
    const path = new URL(link).pathname;
    const last = path.split("/").filter(Boolean).pop();
    return last && /^[\w-]+$/.test(last) ? last : null;
  } catch {
    return null;
  }
}

function toIsoDate(pubDate: string): string | null {
  // UTC date, deliberately: Beehiiv emits +0000 pubDates today, and a fixed
  // UTC convention keeps builds deterministic. If the feed ever switches to a
  // local-offset zone, dates here may sit one day off the publisher-local date.
  const d = new Date(pubDate);
  return Number.isNaN(d.getTime()) ? null : d.toISOString().slice(0, 10);
}

export function parseFeed(xml: string): FeedItem[] {
  const parser = new XMLParser({ ignoreAttributes: false });
  const doc = parser.parse(xml);
  const rawItems = doc?.rss?.channel?.item;
  if (!rawItems) return [];
  const list = Array.isArray(rawItems) ? rawItems : [rawItems];

  const items: FeedItem[] = [];
  const seen = new Set<string>();
  for (const raw of list) {
    const title = typeof raw.title === "string" ? raw.title.trim() : "";
    const link = typeof raw.link === "string" ? raw.link.trim() : "";
    const description = typeof raw.description === "string" ? raw.description.trim() : "";
    const date = typeof raw.pubDate === "string" ? toIsoDate(raw.pubDate) : null;
    const slug = link ? slugFromLink(link) : null;
    if (!title || !link || !date || !slug) {
      console.warn(`feed: skipping malformed item${title ? ` "${title}"` : ""}`);
      continue;
    }
    if (seen.has(slug)) continue; // deterministic dedupe: first occurrence wins
    seen.add(slug);
    const rawCats = raw.category ?? [];
    const categories = (Array.isArray(rawCats) ? rawCats : [rawCats])
      .map((c: unknown) => (typeof c === "string" ? c : String((c as { "#text"?: string })["#text"] ?? "")))
      .filter(Boolean);
    items.push({
      title,
      description,
      link,
      date,
      creator: typeof raw["dc:creator"] === "string" ? raw["dc:creator"] : "Brent Dixon",
      categories,
      slug,
    });
  }
  return items.sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0));
}

export function loadFeedSnapshot(path: string): FeedItem[] {
  return parseFeed(readFileSync(path, "utf8"));
}
