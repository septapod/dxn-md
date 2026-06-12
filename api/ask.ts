// POST /api/ask — structured answers assembled from the content canon.
// No LLM at runtime: factual lookups routed by intent keywords. Every query is
// logged to function logs (the zero-provisioning query corpus; see /observatory).

import generated from "../src/generated/canon.js";
import { answerQuestion, type GeneratedCanon } from "../src/ask/answer.js";

const g = generated as unknown as GeneratedCanon;

export default {
  async fetch(request: Request): Promise<Response> {
    if (request.method !== "POST") {
      return Response.json(
        { error: "POST a JSON body like {\"question\": \"...\"}" },
        { status: 405, headers: { Allow: "POST" } },
      );
    }
    let question = "";
    try {
      const body = (await request.json()) as { question?: unknown };
      question = typeof body.question === "string" ? body.question.trim() : "";
    } catch {
      // fall through to the 400 below
    }
    if (!question || question.length > 2000) {
      return Response.json(
        { error: "Body must be JSON with a non-empty \"question\" string (max 2000 chars)." },
        { status: 400 },
      );
    }

    console.log(JSON.stringify({ kind: "ask_query", ts: new Date().toISOString(), question }));
    const result = answerQuestion(question, g);
    return Response.json(result, { headers: { "Cache-Control": "no-store" } });
  },
};
