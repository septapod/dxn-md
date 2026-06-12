import type { Block, Page, Section } from "./page.js";

export function escapeHtml(text: string): string {
  return text
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

// Prose blocks may carry markdown-style inline links; everything else is plain text.
function inline(text: string): string {
  return escapeHtml(text).replace(
    /\[([^\]]+)\]\((https?:\/\/[^)\s]+|\/[^)\s]*)\)/g,
    '<a href="$2">$1</a>',
  );
}

function renderBlock(block: Block): string {
  switch (block.kind) {
    case "prose":
      return `<p>${inline(block.text)}</p>`;
    case "facts":
      return `<dl>${block.items
        .map((i) => `<dt>${escapeHtml(i.label)}</dt><dd>${inline(i.value)}</dd>`)
        .join("")}</dl>`;
    case "quote":
      return `<blockquote><p>${escapeHtml(block.text)}</p><cite>${escapeHtml(block.attribution)}</cite></blockquote>`;
    case "stat": {
      const source = block.source
        ? ` <a class="source" href="${block.source.url}">${escapeHtml(block.source.title)}</a>`
        : "";
      return `<p class="stat"><strong>${escapeHtml(block.value)}</strong> — ${inline(block.label)}${source}</p>`;
    }
    case "links":
      return `<ul class="links">${block.items
        .map(
          (i) =>
            `<li><a href="${i.url}">${escapeHtml(i.label)}</a>${i.note ? ` — ${escapeHtml(i.note)}` : ""}</li>`,
        )
        .join("")}</ul>`;
    case "qa":
      return `<details open><summary>${escapeHtml(block.q)}</summary><p>${inline(block.a)}</p></details>`;
    case "list": {
      const tag = block.ordered ? "ol" : "ul";
      return `<${tag}>${block.items.map((i) => `<li>${inline(i)}</li>`).join("")}</${tag}>`;
    }
  }
}

function renderSection(section: Section): string {
  const heading = section.heading ? `<h2>${escapeHtml(section.heading)}</h2>` : "";
  return `<section>${heading}${section.blocks.map(renderBlock).join("\n")}</section>`;
}

const CSS = `
:root{--ink:#1a1a1a;--soft:#555;--line:#e3e0d8;--bg:#faf9f6;--accent:#0a6b5d}
*{box-sizing:border-box}
body{margin:0;font:18px/1.6 ui-sans-serif,system-ui,-apple-system,sans-serif;color:var(--ink);background:var(--bg)}
main{max-width:44rem;margin:0 auto;padding:2rem 1.25rem 4rem}
h1{font-size:1.9rem;line-height:1.25;margin:1rem 0 .5rem}
h2{font-size:1.25rem;margin:2.2rem 0 .6rem;border-bottom:1px solid var(--line);padding-bottom:.3rem}
a{color:var(--accent)}
nav.site{font-size:.85rem;padding:1rem 0;border-bottom:1px solid var(--line)}
nav.site a{margin-right:.9rem;text-decoration:none}
.byline{font-size:.85rem;color:var(--soft)}
.lede{font-size:1.1rem;color:var(--soft)}
blockquote{margin:1rem 0;padding:.5rem 1rem;border-left:3px solid var(--accent);background:#fff}
blockquote cite{display:block;font-size:.85rem;color:var(--soft);margin-top:.4rem;font-style:normal}
dl dt{font-weight:600;margin-top:.6rem}
dl dd{margin:0}
.stat strong{color:var(--accent)}
.stat .source{font-size:.85rem;margin-left:.4rem}
details{margin:.8rem 0;background:#fff;border:1px solid var(--line);border-radius:6px;padding:.6rem .9rem}
summary{font-weight:600;cursor:pointer}
footer.site{max-width:44rem;margin:0 auto;padding:1.5rem 1.25rem 3rem;border-top:1px solid var(--line);font-size:.8rem;color:var(--soft)}
`.trim();

const NAV: [string, string][] = [
  ["/", "Home"],
  ["/services", "Services"],
  ["/about", "About"],
  ["/clients", "Clients"],
  ["/dossier", "Dossier"],
  ["/newsletter", "Newsletter"],
  ["/card", "Card"],
  ["/observatory", "Observatory"],
  ["/agents", "For agents"],
];

export function renderHtml(
  page: Page,
  opts: { canonHash: string; siteUrl: string; ga4Id: string },
): string {
  const jsonld = page.jsonld
    .map((b) => `<script type="application/ld+json">${JSON.stringify(b)}</script>`)
    .join("\n");
  // gtag.js is rotated by Google on their schedule; a pinned SRI hash would
  // break analytics on their next rollout, so SRI is deliberately omitted here.
  const ga = opts.ga4Id
    ? `<script async src="https://www.googletagmanager.com/gtag/js?id=${opts.ga4Id}"></script>` +
      `<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments)};gtag('js',new Date());gtag('config','${opts.ga4Id}');</script>`
    : "";
  const nav = NAV.map(([href, label]) => `<a href="${href}">${label}</a>`).join("");
  const mdHref = page.route === "/" ? "/index.md" : `${page.route}.md`;

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${escapeHtml(page.title)} · Dixon Strategic Labs</title>
<meta name="description" content="${escapeHtml(page.description)}">
<link rel="canonical" href="${opts.siteUrl}${page.route}">
<link rel="alternate" type="text/markdown" href="${mdHref}" title="Markdown version">
<style>${CSS}</style>
${jsonld}
${ga}
</head>
<body>
<main>
<nav class="site">${nav}</nav>
<h1>${escapeHtml(page.title)}</h1>
<p class="lede">${escapeHtml(page.description)}</p>
<p class="byline">By Brent Dixon, Dixon Strategic Labs · ${page.byline_date} · Facts last verified ${page.last_verified}</p>
${page.sections.map(renderSection).join("\n")}
</main>
<footer class="site">
<p>Generated from the content canon (hash <code>${opts.canonHash}</code>). This page is also available as <a href="${mdHref}">markdown</a> (or send <code>Accept: text/markdown</code>) and <a href="${page.route === "/" ? "/index" : page.route}.json">JSON</a>. A site for agents and humans — see <a href="/agents">how it works</a> or <a href="/llms.txt">llms.txt</a>.</p>
<p>© ${page.byline_date.slice(0, 4)} Dixon Strategic Labs LLC · <a href="https://dxn.is">dxn.is</a> is the human-first companion site.</p>
</footer>
</body>
</html>
`;
}
