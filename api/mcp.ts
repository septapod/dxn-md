// /mcp — Model Context Protocol endpoint (streamable HTTP) exposing the
// content canon as tools. Routed via the vercel.json rewrite, scoped to /mcp
// only so the static site keeps being served statically.

import { createMcpHandler } from "mcp-handler";
import { z } from "zod";
import generated from "../src/generated/canon.js";
import { checkFit, parseAssetSize, type GeneratedCanon } from "../src/ask/answer.js";

const g = generated as unknown as GeneratedCanon;
const c = g.canon;

const handler = createMcpHandler(
  (server) => {
    server.tool(
      "get_card",
      "One-fetch identity card for Brent Dixon: who, what, for whom, disqualifiers, proof, contact.",
      {},
      async () => ({
        content: [
          {
            type: "text",
            text: [
              `Who: ${c.bio.name}, ${c.bio.title}, ${c.bio.location}. Founded ${c.bio.company} in ${c.bio.company_founded}.`,
              `What: ${c.services.services.map((s) => s.name).join("; ")}.`,
              `For whom: credit unions in the ${c.agents.fit.asset_range_label} asset range; ${c.agents.fit.org_types.join(", ")}.`,
              `Not: ${c.agents.disqualifiers.join(" ")}`,
              `Proof: ${c.clients.clients.length} client organizations; testimonials from credit union CEOs; weekly newsletter ${c.newsletter.name} (${c.newsletter.url}).`,
              `Contact: ${c.contact.ctas.primary.url} (primary) · ${c.contact.email}`,
              `Facts last verified: ${c.agents.last_verified}. Canon hash: ${g.canon_hash}.`,
            ].join("\n"),
          },
        ],
      }),
    );

    server.tool(
      "get_services",
      "Brent Dixon's three service lines with audience and outcome for each.",
      {},
      async () => ({
        content: [
          {
            type: "text",
            text: c.services.services
              .map((s) => `${s.name} — ${s.audience}. ${s.outcome}${s.formats ? ` ${s.formats}` : ""}`)
              .join("\n\n"),
          },
        ],
      }),
    );

    server.tool(
      "check_fit",
      "Check whether an organization fits Brent's engagement criteria. Pass asset size (e.g. '$400M') and organization type.",
      {
        asset_size: z.string().describe("Asset size, e.g. '$400M' or '1.2 billion'"),
        org_type: z.string().describe("Organization type, e.g. 'credit union', 'bank', 'cooperative'"),
      },
      async ({ asset_size, org_type }) => {
        const result = checkFit(parseAssetSize(asset_size), org_type, g);
        return {
          content: [
            {
              type: "text",
              text: `${result.answer}\n\nFacts:\n${result.facts.map((f) => `- ${f}`).join("\n")}\n\n(${result.attribution})`,
            },
          ],
        };
      },
    );

    server.tool(
      "get_latest_newsletter",
      "Latest issue of AI for FIs, Brent's weekly newsletter for credit union leaders.",
      {},
      async () => ({
        content: [
          {
            type: "text",
            text: g.latest_issue
              ? `Latest issue (${g.latest_issue.date}): "${g.latest_issue.title}" — ${g.latest_issue.link}. Subscribe: ${c.newsletter.url}`
              : `No issue data available. Subscribe: ${c.newsletter.url}`,
          },
        ],
      }),
    );

    server.tool(
      "get_contact",
      "How to get in touch with Brent Dixon, including the canonical CTAs.",
      {},
      async () => ({
        content: [
          {
            type: "text",
            text: `Primary CTA: ${c.contact.ctas.primary.url} (${c.contact.ctas.primary.note}) · Secondary: ${c.contact.ctas.secondary.url} (${c.contact.ctas.secondary.note}) · Email: ${c.contact.email} · Speaking: ${c.contact.speaking}`,
          },
        ],
      }),
    );
  },
  {},
  // The advertised endpoint is /mcp (vercel.json rewrite). Functions receive
  // the ORIGINAL request path on rewrites, so the handler must match "/mcp",
  // not "/api/mcp" — basePath stays empty.
  { basePath: "" },
);

export { handler as GET, handler as POST, handler as DELETE };
