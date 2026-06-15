// Site-wide configuration. SITE_URL is env-driven so the same build works on
// the temporary vercel.app URL today and on https://dxn.md once DNS connects.
export const SITE_URL = (process.env.SITE_URL ?? "https://dxn-md.vercel.app").replace(/\/$/, "");

// GA4 is opt-in: no measurement ID, no analytics script in any variant.
export const GA4_MEASUREMENT_ID = process.env.GA4_MEASUREMENT_ID ?? "";

export const SITE_NAME = "Dixon Strategic Labs";
export const TOKEN_ENCODING = "o200k_base";

// IndexNow key. Public by design: it is hosted at /<key>.txt so Bing can verify
// that pings come from someone who controls the site. Not a secret.
export const INDEXNOW_KEY = "58868f679e6fa96737ef49858fdfda35";

// Bing Webmaster Tools ownership token, served at /BingSiteAuth.xml. Public by
// design (it only proves site control to Bing). Issued by Bing on site add.
export const BING_SITE_AUTH_TOKEN = "5C998422697F77D293DB4CA65F6F5CCB";
