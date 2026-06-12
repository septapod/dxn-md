// Vercel Routing Middleware: content negotiation for every page URL.
// Accept: text/markdown  -> rewrite to <path>.md   (+ Vary, x-markdown-tokens)
// Accept: application/json (preferred over html) -> rewrite to <path>.json
// Content-Type for .md files is owned by vercel.json, never set here.

import { next, rewrite } from "@vercel/functions/middleware";
import manifest from "./src/generated/token-manifest.js";

export const config = {
  // Pages only: skip api routes, .well-known, and anything with a file extension.
  matcher: ["/((?!api/|\\.well-known/|.*\\.[a-zA-Z0-9]+$).*)"],
};

type Variant = "markdown" | "json" | "html";

// Minimal Accept parsing: find the highest-q media type we care about.
// Exported for unit tests.
export function pickVariant(accept: string | null): Variant {
  if (!accept) return "html";
  let best: { variant: Variant; q: number } = { variant: "html", q: 0 };
  for (const part of accept.split(",")) {
    const [typeRaw, ...params] = part.trim().split(";");
    const type = (typeRaw ?? "").trim().toLowerCase();
    let q = 1;
    for (const p of params) {
      const [k, v] = p.trim().split("=");
      if (k === "q" && v) q = Number.parseFloat(v) || 0;
    }
    let variant: Variant | null = null;
    if (type === "text/markdown") variant = "markdown";
    else if (type === "application/json") variant = "json";
    else if (type === "text/html" || type === "application/xhtml+xml") variant = "html";
    if (variant && q > best.q) best = { variant, q };
  }
  return best.q > 0 ? best.variant : "html";
}

export function targetPath(pathname: string, variant: Variant): string | null {
  if (variant === "html") return null;
  const base = pathname === "/" ? "/index" : pathname.replace(/\/$/, "");
  return `${base}.${variant === "markdown" ? "md" : "json"}`;
}

export default function middleware(request: Request): Response {
  const url = new URL(request.url);
  const variant = pickVariant(request.headers.get("accept"));
  const target = targetPath(url.pathname, variant);

  if (!target) {
    return next({ headers: { Vary: "Accept" } });
  }

  const headers: Record<string, string> = { Vary: "Accept" };
  if (variant === "markdown") {
    const entry = manifest[target];
    if (entry) {
      headers["x-markdown-tokens"] = String(entry.tokens);
      headers["x-content-hash"] = entry.hash;
    }
  }
  return rewrite(new URL(target, request.url), { headers });
}
