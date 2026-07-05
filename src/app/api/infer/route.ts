import { NextRequest, NextResponse } from "next/server";
import { verifyPaymentTx } from "@/lib/verify";

// This route verifies the on-chain payment BEFORE running inference.
// Demo mode (no wallet) bypasses verification and is clearly labeled.

export async function POST(req: NextRequest) {
  try {
    const { query, txHash, from } = await req.json();

    if (!query || typeof query !== "string") {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }

    const isDemo = !txHash || txHash === "" || from === "0xDEMO";

    let verification: { valid: boolean; reason?: string; blockNumber?: string } = {
      valid: true,
    };

    if (!isDemo) {
      verification = await verifyPaymentTx(txHash);
      if (!verification.valid) {
        return NextResponse.json(
          { error: `Payment verification failed: ${verification.reason}` },
          { status: 402 } // 402 Payment Required
        );
      }
    }

    const apiKey = process.env.ANTHROPIC_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "Server not configured" }, { status: 500 });
    }

    const t0 = Date.now();

    const systemPrompt = `You are Tollgate, a pay-per-inference autonomous AI agent running on the Arc blockchain testnet.
You help users with financial analysis, DeFi strategies, and stablecoin economics.
Keep answers concise (2-4 sentences). Every response was paid for with 0.01 USDC on Arc testnet.
Transaction: ${txHash || "demo-mode"}
User wallet: ${from || "unknown"}`;

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 512,
        system: systemPrompt,
        messages: [{ role: "user", content: query }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      console.error("Anthropic error:", errText);
      return NextResponse.json({ error: "AI inference failed" }, { status: 502 });
    }

    const data = await response.json();
    const text =
      data.content?.find((b: { type: string }) => b.type === "text")?.text ?? "";

    const elapsedMs = Date.now() - t0;

    return NextResponse.json({
      answer: text,
      model: data.model,
      inputTokens: data.usage?.input_tokens,
      outputTokens: data.usage?.output_tokens,
      elapsedMs,
      verified: !isDemo,
      demo: isDemo,
      blockNumber: verification.blockNumber,
    });
  } catch (err) {
    console.error("Inference route error:", err);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
