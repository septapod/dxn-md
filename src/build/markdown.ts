import type { Block, Page, Section } from "./page.js";

function renderBlock(block: Block): string {
  switch (block.kind) {
    case "prose":
      return block.text;
    case "facts":
      return block.items.map((i) => `- **${i.label}:** ${i.value}`).join("\n");
    case "quote":
      return `> "${block.text}"\n> — ${block.attribution}`;
    case "stat": {
      const source = block.source ? ` ([${block.source.title}](${block.source.url}))` : "";
      return `- **${block.value}** — ${block.label}${source}`;
    }
    case "links":
      return block.items
        .map((i) => `- [${i.label}](${i.url})${i.note ? ` — ${i.note}` : ""}`)
        .join("\n");
    case "qa":
      return `**Q: ${block.q}**\n\n${block.a}`;
    case "list":
      return block.items
        .map((item, n) => (block.ordered ? `${n + 1}. ${item}` : `- ${item}`))
        .join("\n");
  }
}

function renderSection(section: Section): string {
  const parts: string[] = [];
  if (section.heading) parts.push(`## ${section.heading}`);
  for (const block of section.blocks) parts.push(renderBlock(block));
  return parts.join("\n\n");
}

export function renderMarkdown(page: Page, opts: { canonHash: string; siteUrl: string }): string {
  const head = [
    `# ${page.title}`,
    "",
    `> ${page.description}`,
    "",
    `By Brent Dixon, Dixon Strategic Labs · ${page.byline_date} · Facts last verified ${page.last_verified}`,
  ].join("\n");

  const body = page.sections.map(renderSection).join("\n\n");

  const footer = [
    "---",
    "",
    `Generated from the [content canon](https://github.com/septapod/dxn-md) (hash \`${opts.canonHash}\`). ` +
      `This page is also available as [HTML](${opts.siteUrl}${page.route}) and [JSON](${opts.siteUrl}${page.route === "/" ? "/index" : page.route}.json). ` +
      `Site guide for agents: [${opts.siteUrl}/agents](${opts.siteUrl}/agents) · [llms.txt](${opts.siteUrl}/llms.txt)`,
  ].join("\n");

  return `${head}\n\n${body}\n\n${footer}\n`;
}
