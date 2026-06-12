import type { Canon } from "../canon/schema.js";

export function personLd(canon: Canon, siteUrl: string): object {
  return {
    "@context": "https://schema.org",
    "@type": "Person",
    name: canon.bio.name,
    jobTitle: canon.bio.title,
    description: canon.bio.summary,
    url: siteUrl,
    email: canon.contact.email,
    address: { "@type": "PostalAddress", addressLocality: "Oakland", addressRegion: "CA" },
    sameAs: canon.bio.same_as,
    knowsAbout: [
      "Strategic Facilitation",
      "AI Strategy for Credit Unions",
      "Agentic AI",
      "Cooperative Finance",
      "Organizational Strategy",
      "Leadership Alignment",
      "Credit Union Governance",
    ],
  };
}

export function websiteLd(canon: Canon, siteUrl: string): object {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: `${canon.bio.company} (agent-native)`,
    url: siteUrl,
    description: canon.bio.summary,
    publisher: { "@type": "Person", name: canon.bio.name },
  };
}

export function professionalServiceLd(canon: Canon, siteUrl: string): object {
  return {
    "@context": "https://schema.org",
    "@type": "ProfessionalService",
    name: canon.bio.company,
    description: canon.bio.summary,
    url: siteUrl,
    email: canon.contact.email,
    areaServed: "United States",
    serviceType: canon.services.services.map((s) => s.name),
    audience: {
      "@type": "Audience",
      audienceType: ["Credit Unions", "Community Financial Institutions"],
    },
  };
}

export function reviewLd(canon: Canon): object {
  const r = canon.testimonials.review;
  return {
    "@context": "https://schema.org",
    "@type": "Review",
    itemReviewed: { "@type": "ProfessionalService", name: "Brent Dixon Strategic Facilitation" },
    reviewRating: {
      "@type": "Rating",
      ratingValue: String(r.rating),
      bestRating: String(r.best_rating),
    },
    author: { "@type": "Organization", name: r.author_org },
    reviewBody: r.body,
  };
}
