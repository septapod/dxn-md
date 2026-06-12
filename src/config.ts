// Site-wide configuration. SITE_URL is env-driven so the same build works on
// the temporary vercel.app URL today and on https://dxn.md once DNS connects.
export const SITE_URL = (process.env.SITE_URL ?? "https://dxn-md.vercel.app").replace(/\/$/, "");

// GA4 is opt-in: no measurement ID, no analytics script in any variant.
export const GA4_MEASUREMENT_ID = process.env.GA4_MEASUREMENT_ID ?? "";

export const SITE_NAME = "Dixon Strategic Labs";
export const TOKEN_ENCODING = "o200k_base";
