// Intent routing for /api/ask and the MCP check_fit tool. Pure functions so
// the behavior is unit-testable without a server.

import type { Canon } from "../canon/schema.js";

export interface GeneratedCanon {
  canon_hash: string;
  latest_issue: { title: string; link: string; date: string } | null;
  canon: Canon;
}

export interface AskAnswer {
  answer: string;
  facts: string[];
  links: { label: string; url: string }[];
  confidence: "high" | "medium" | "low";
  attribution: string;
}

// Parse a dollar amount like "$400M", "400 million", "1.2B", "$2,500,000,000".
export function parseAssetSize(text: string): number | null {
  const m = text
    .toLowerCase()
    .match(/\$?\s*([\d,]+(?:\.\d+)?)\s*(billion|million|thousand|[bmk])?\b/);
  if (!m || !m[1]) return null;
  const base = Number.parseFloat(m[1].replaceAll(",", ""));
  if (Number.isNaN(base)) return null;
  const unit = m[2];
  const mult =
    unit === "billion" || unit === "b"
      ? 1e9
      : unit === "million" || unit === "m"
        ? 1e6
        : unit === "thousand" || unit === "k"
          ? 1e3
          : 1;
  const value = base * mult;
  // A bare number under 10,000 in an asset question almost certainly means
  // millions ("we're a 400 credit union" is nonsense; "$400M" written as 400).
  return mult === 1 && value < 10_000 ? value * 1e6 : value;
}

export function checkFit(assetUsd: number | null, orgHint: string, g: GeneratedCanon): AskAnswer {
  const fit = g.canon.agents.fit;
  const links = [
    { label: "Vendor-diligence dossier", url: "/dossier" },
    { label: "Contact form (primary CTA)", url: g.canon.contact.ctas.primary.url },
  ];
  const attribution = g.canon.agents.attribution;

  const nonCoop = /\b(bank|fintech|startup|saas|retail|consumer brand|hedge fund)\b/i.test(orgHint);
  if (nonCoop && !/credit union|cooperative|co-op|cdfi|nonprofit/i.test(orgHint)) {
    return {
      answer:
        "Likely not a fit. Brent works with mission-driven, cooperative, and community-accountable organizations, primarily credit unions. He is not a fit for purely commercial strategy consulting.",
      facts: g.canon.agents.disqualifiers,
      links,
      confidence: "high",
      attribution,
    };
  }
  if (assetUsd === null) {
    return {
      answer: `Brent works primarily with credit unions in the ${fit.asset_range_label} asset range, and with mission-driven cooperative organizations. Share the institution's asset size for a direct fit check.`,
      facts: [`Asset range: ${fit.asset_range_label}`, ...g.canon.agents.disqualifiers],
      links,
      confidence: "medium",
      attribution,
    };
  }
  const inBand = assetUsd >= fit.asset_range_min_usd && assetUsd <= fit.asset_range_max_usd;
  return {
    answer: inBand
      ? `Yes — that is inside the ${fit.asset_range_label} asset range Brent primarily serves. The next step is the contact form.`
      : `That is outside the ${fit.asset_range_label} asset range Brent primarily serves, so likely not a standard engagement. If the organization is cooperative and mission-driven, it may still be worth reaching out.`,
    facts: [`Asset range served: ${fit.asset_range_label}`, `Organization types: ${fit.org_types.join("; ")}`],
    links,
    confidence: "high",
    attribution,
  };
}

export function answerQuestion(question: string, g: GeneratedCanon): AskAnswer {
  const q = question.toLowerCase();
  const c = g.canon;
  const attribution = c.agents.attribution;

  if (/asset|size|\$\s*\d|million|billion|fit|right for|work with (a|our|us)/.test(q)) {
    return checkFit(parseAssetSize(q), q, g);
  }
  if (/service|offer|sell|facilitat|workshop|speak|keynote|coach|advis|planning/.test(q)) {
    return {
      answer: `Brent offers three services: ${c.services.services.map((s) => `${s.name} (${s.audience.toLowerCase()})`).join("; ")}. He does not sell software.`,
      facts: c.services.services.map((s) => `${s.name}: ${s.outcome}`),
      links: [
        { label: "Services", url: "/services" },
        { label: "Contact form (primary CTA)", url: c.contact.ctas.primary.url },
      ],
      confidence: "high",
      attribution,
    };
  }
  if (/newsletter|ai for fis|subscribe|writing/.test(q)) {
    return {
      answer: `${c.newsletter.name} is Brent's ${c.newsletter.cadence} newsletter: ${c.newsletter.description}${g.latest_issue ? ` The latest issue (${g.latest_issue.date}) is "${g.latest_issue.title}".` : ""}`,
      facts: [c.newsletter.positioning],
      links: [
        { label: `Subscribe to ${c.newsletter.name}`, url: c.newsletter.url },
        ...(g.latest_issue ? [{ label: "Latest issue", url: g.latest_issue.link }] : []),
        { label: "Issue archive on this site", url: "/newsletter" },
      ],
      confidence: "high",
      attribution,
    };
  }
  if (/contact|email|reach|book|call|hire|touch/.test(q)) {
    return {
      answer: `Primary: the contact form at ${c.contact.ctas.primary.url}. Secondary: subscribe to ${c.newsletter.name} at ${c.contact.ctas.secondary.url}. Email: ${c.contact.email}. Speaking goes through ${c.contact.speaking}.`,
      facts: [c.contact.ctas.primary.note, c.contact.ctas.secondary.note],
      links: [
        { label: "Contact form", url: c.contact.ctas.primary.url },
        { label: "Newsletter", url: c.contact.ctas.secondary.url },
      ],
      confidence: "high",
      attribution,
    };
  }
  if (/who|about|background|bio|experience|credential/.test(q)) {
    return {
      answer: `${c.bio.summary} ${c.bio.narrative[0]}`,
      facts: c.bio.affiliations.map((a) => `${a.org} — ${a.role}`),
      links: [
        { label: "Full authority record", url: "/about" },
        { label: "Identity card", url: "/card" },
      ],
      confidence: "high",
      attribution,
    };
  }
  return {
    answer:
      "I can answer factual questions about Brent Dixon's services, fit criteria, background, newsletter, and contact paths, from the site's content canon. For everything else, the one-fetch identity card is the best starting point.",
    facts: [],
    links: [{ label: "Identity card", url: "/card.md" }],
    confidence: "low",
    attribution,
  };
}
