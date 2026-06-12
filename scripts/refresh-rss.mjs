// Weekly snapshot refresh: fetch the live Beehiiv feed and update the
// committed snapshot only when it changed and looks valid. This is the ONLY
// place a live fetch happens; the build reads the committed snapshot.
import { readFileSync, writeFileSync, existsSync } from "node:fs";

// Mirrors content/canon/newsletter.yaml `rss:`; kept literal so this script
// stays dependency-free for the GitHub Actions runner.
const FEED_URL = "https://rss.beehiiv.com/feeds/R3iSBAQYmq.xml";
const SNAPSHOT = "data/feed-snapshot.xml";

const res = await fetch(FEED_URL, { headers: { "User-Agent": "dxn-md-refresh/1.0" } });
if (!res.ok) {
  console.error(`refresh: feed fetch failed with ${res.status}; keeping existing snapshot`);
  process.exit(existsSync(SNAPSHOT) ? 0 : 1);
}
const fresh = await res.text();
const itemCount = (fresh.match(/<item>/g) ?? []).length;
if (!fresh.includes("<rss") || itemCount === 0) {
  console.error("refresh: response does not look like a valid feed; keeping existing snapshot");
  process.exit(existsSync(SNAPSHOT) ? 0 : 1);
}
const current = existsSync(SNAPSHOT) ? readFileSync(SNAPSHOT, "utf8") : "";
if (current === fresh) {
  console.log("refresh: snapshot unchanged");
  process.exit(0);
}
writeFileSync(SNAPSHOT, fresh, "utf8");
console.log(`refresh: snapshot updated (${itemCount} items)`);
