// Ping IndexNow (Bing et al.) to crawl the site's URLs on demand. No login, no
// account: the key file at /<key>.txt proves we control the domain. Runs after
// a build (reads dist/sitemap.xml) and on the weekly refresh, so fresh content
// is announced to the crawler the moment it ships. Discovery only; this does
// not affect ranking.
import { readFileSync } from "node:fs";

const KEY = "58868f679e6fa96737ef49858fdfda35";
const SITE_URL = (process.env.SITE_URL ?? "https://dxn.md").replace(/\/$/, "");
const host = new URL(SITE_URL).host;

const sitemap = readFileSync("dist/sitemap.xml", "utf8");
const urlList = [...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
if (urlList.length === 0) {
  console.error("ping-indexnow: no URLs found in dist/sitemap.xml; build first");
  process.exit(1);
}

const body = {
  host,
  key: KEY,
  keyLocation: `${SITE_URL}/${KEY}.txt`,
  urlList,
};

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify(body),
});

// IndexNow returns 200 (accepted) or 202 (accepted, key validation pending).
// 403 = key file not reachable yet; 422 = URL/host mismatch.
console.log(`ping-indexnow: submitted ${urlList.length} URLs, status ${res.status}`);
if (![200, 202].includes(res.status)) {
  console.error(`ping-indexnow: unexpected status ${res.status}: ${await res.text()}`);
  process.exit(1);
}
