import { z } from "zod";

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "must be YYYY-MM-DD");

export const bioSchema = z.object({
  name: z.string().min(1),
  title: z.string().min(1),
  company: z.string().min(1),
  company_founded: z.number().int(),
  location: z.string().min(1),
  last_verified: isoDate,
  summary: z.string().min(1),
  narrative: z.array(z.string().min(1)).min(1),
  affiliations: z
    .array(
      z.object({
        org: z.string().min(1),
        role: z.string().min(1),
        start: z.number().int().optional(),
        current: z.boolean().optional(),
        detail: z.string().min(1),
      }),
    )
    .min(1),
  speaking_representation: z.string().min(1),
  same_as: z.array(z.string().url()),
});

export const servicesSchema = z.object({
  last_verified: isoDate,
  audience: z.string().min(1),
  services: z
    .array(
      z.object({
        id: z.string().min(1),
        name: z.string().min(1),
        audience: z.string().min(1),
        outcome: z.string().min(1),
        formats: z.string().optional(),
      }),
    )
    .min(1),
});

export const clientsSchema = z.object({
  last_verified: isoDate,
  clients: z
    .array(
      z.object({
        name: z.string().min(1),
        sector: z.enum(["financial", "social_impact"]),
      }),
    )
    .min(1),
});

export const testimonialsSchema = z.object({
  last_verified: isoDate,
  testimonials: z
    .array(
      z.object({
        quote: z.string().min(1),
        author: z.string().min(1),
        role: z.string().min(1),
        org: z.string().min(1),
      }),
    )
    .min(1),
  review: z.object({
    rating: z.number(),
    best_rating: z.number(),
    author_org: z.string().min(1),
    body: z.string().min(1),
  }),
});

export const frameworkSchema = z.object({
  last_verified: isoDate,
  name: z.string().min(1),
  intro: z.string().min(1),
  conditions: z
    .array(
      z.object({
        name: z.string().min(1),
        body: z.string().min(1),
        citation: z
          .object({
            quote: z.string().min(1),
            author: z.string().min(1),
            source: z.string().min(1),
            url: z.string().url(),
          })
          .optional(),
      }),
    )
    .min(1),
});

export const newsletterSchema = z.object({
  last_verified: isoDate,
  name: z.string().min(1),
  url: z.string().url(),
  rss: z.string().url(),
  cadence: z.string().min(1),
  description: z.string().min(1),
  positioning: z.string().min(1),
});

export const contactSchema = z.object({
  last_verified: isoDate,
  email: z.string().email(),
  contact_form: z.string().url(),
  newsletter: z.string().url(),
  speaking: z.string().min(1),
  human_site: z.string().url(),
  ctas: z.object({
    primary: z.object({ label: z.string(), url: z.string().url(), note: z.string() }),
    secondary: z.object({ label: z.string(), url: z.string().url(), note: z.string() }),
  }),
});

export const agentsSchema = z.object({
  last_verified: isoDate,
  fit: z.object({
    asset_range_min_usd: z.number().int(),
    asset_range_max_usd: z.number().int(),
    asset_range_label: z.string().min(1),
    org_types: z.array(z.string().min(1)).min(1),
  }),
  instructions: z.array(z.string().min(1)).min(1),
  disqualifiers: z.array(z.string().min(1)).min(1),
  attribution: z.string().min(1),
  license: z.string().min(1),
});

export const canonSchema = z.object({
  bio: bioSchema,
  services: servicesSchema,
  clients: clientsSchema,
  testimonials: testimonialsSchema,
  framework: frameworkSchema,
  newsletter: newsletterSchema,
  contact: contactSchema,
  agents: agentsSchema,
});

export type Canon = z.infer<typeof canonSchema>;
