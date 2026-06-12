// The shared page model. Every page is structured data; the HTML, markdown,
// and JSON emitters all render from the same blocks, so the three variants of
// a URL cannot drift from each other.

export type Block =
  | { kind: "prose"; text: string }
  | { kind: "facts"; items: { label: string; value: string }[] }
  | { kind: "quote"; text: string; attribution: string }
  | { kind: "stat"; value: string; label: string; source?: { title: string; url: string } }
  | { kind: "links"; items: { label: string; url: string; note?: string }[] }
  | { kind: "qa"; q: string; a: string }
  | { kind: "list"; ordered: boolean; items: string[] };

export interface Section {
  heading?: string;
  blocks: Block[];
}

export interface Page {
  route: string; // "/" or "/services"
  title: string;
  description: string;
  byline_date: string; // ISO date shown on the page
  last_verified: string;
  geo_lint: boolean; // substantive page subject to the GEO lint gate
  jsonld: object[];
  sections: Section[];
}

export function mdPath(route: string): string {
  return route === "/" ? "/index.md" : `${route}.md`;
}

export function jsonPath(route: string): string {
  return route === "/" ? "/index.json" : `${route}.json`;
}

export function htmlFile(route: string): string {
  return route === "/" ? "index.html" : `${route.slice(1)}/index.html`;
}
