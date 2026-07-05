import { NextRequest, NextResponse } from "next/server";
import { debitByApiKey } from "@/lib/credits-store";

const PER_QUERY_COST = 0.01; // USDC, debited from prepaid balance

// Programmatic endpoint: no wallet signature per call, just an API key
// backed by a prepaid balance. This is what the Docs and API tabs point
// developers at.
//
//   curl https://tollgate.app/api/v1/query \
//     -H "Authorization: Bearer tg_..." \
//     -H "Content-Type: application/json" \
//     -d '{"query": "..."}'
export async function POST(req: NextRequest) {
  const auth = req.headers.get("authorization") || "";
  const apiKey = auth.replace(/^Bearer\s+/i, "").trim();

  if (!apiKey || !apiKey.startsWith("tg_")) {
    return NextResponse.json(
      { error: "Missing or malformed API key. Use: Authorization: Bearer tg_..." },
      { status: 401 }
    );
  }

  const { query } = await req.json();
  if (!query || typeof query !== "string") {
    return NextResponse.json({ error: "Missing query" }, { status: 400 });
  }

  const debited = debitByApiKey(apiKey, PER_QUERY_COST);
  if (!debited) {
    return NextResponse.json(
      { error: "Insufficient balance or invalid API key. Top up in the app first." },
      { status: 402 }
    );
  }

  const anthropicKey = process.env.ANTHROPIC_API_KEY;
  if (!anthropicKey) {
    return NextResponse.json({ error: "Server not configured" }, { status: 500 });
  }

  const t0 = Date.now();

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": anthropicKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-6",
      max_tokens: 512,
      system:
        "You are Tollgate, a pay-per-inference agent on Arc. Keep answers concise.",
      messages: [{ role: "user", content: query }],
    }),
  });

  if (!response.ok) {
    return NextResponse.json({ error: "Inference failed" }, { status: 502 });
  }

  const data = await response.json();
  const text = data.content?.find((b: { type: string }) => b.type === "text")?.text ?? "";

  return NextResponse.json({
    answer: text,
    cost: PER_QUERY_COST,
    elapsedMs: Date.now() - t0,
  });
}
