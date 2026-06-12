import { mkdirSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { renderHtml } from "./html.js";
import { renderMarkdown } from "./markdown.js";
import { htmlFile, jsonPath, mdPath, type Page } from "./page.js";
import { tokenEntry, type TokenManifest } from "./tokens.js";
import { TOKEN_ENCODING } from "../config.js";

export interface EmitOptions {
  dist: string;
  canonHash: string;
  siteUrl: string;
  ga4Id: string;
}

export function writeFile(dist: string, relPath: string, content: string): void {
  const target = join(dist, relPath.replace(/^\//, ""));
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, content, "utf8");
}

export function emitPage(page: Page, opts: EmitOptions, manifest: TokenManifest): void {
  const md = renderMarkdown(page, opts);
  const html = renderHtml(page, opts);
  const json = JSON.stringify(
    {
      route: page.route,
      title: page.title,
      description: page.description,
      byline_date: page.byline_date,
      last_verified: page.last_verified,
      canon_hash: opts.canonHash,
      token_encoding: TOKEN_ENCODING,
      attribution: "Brent Dixon, Dixon Strategic Labs",
      sections: page.sections,
    },
    null,
    2,
  );

  writeFile(opts.dist, htmlFile(page.route), html);
  writeFile(opts.dist, mdPath(page.route), md);
  writeFile(opts.dist, jsonPath(page.route), json);
  manifest[mdPath(page.route)] = tokenEntry(md);
}
