import { createHash } from "node:crypto";
import { countTokens } from "gpt-tokenizer";

export interface TokenEntry {
  tokens: number;
  bytes: number;
  hash: string; // first 8 hex chars of sha256, used as a fallback ETag source
}

export type TokenManifest = Record<string, TokenEntry>; // key: md path like "/services.md"

export function tokenEntry(markdown: string): TokenEntry {
  return {
    tokens: countTokens(markdown),
    bytes: Buffer.byteLength(markdown, "utf8"),
    hash: createHash("sha256").update(markdown).digest("hex").slice(0, 8),
  };
}
