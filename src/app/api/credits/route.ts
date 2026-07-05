import { NextRequest, NextResponse } from "next/server";
import { getOrCreateAccount } from "@/lib/credits-store";

// GET /api/credits?wallet=0x... -> account state (creates one if missing)
export async function GET(req: NextRequest) {
  const wallet = new URL(req.url).searchParams.get("wallet");
  if (!wallet) {
    return NextResponse.json({ error: "Missing wallet" }, { status: 400 });
  }
  const acc = getOrCreateAccount(wallet);
  return NextResponse.json({
    apiKey: acc.apiKey,
    balance: Number(acc.balance.toFixed(4)),
    spent: Number(acc.spent.toFixed(4)),
    queries: acc.queries,
  });
}

// POST /api/credits { wallet, topUp } -> add a confirmed on-chain payment to balance
export async function POST(req: NextRequest) {
  try {
    const { wallet, topUp } = await req.json();
    if (!wallet || typeof topUp !== "number" || topUp <= 0) {
      return NextResponse.json({ error: "Invalid top-up request" }, { status: 400 });
    }
    const acc = getOrCreateAccount(wallet);
    acc.balance += topUp;
    return NextResponse.json({ balance: Number(acc.balance.toFixed(4)) });
  } catch {
    return NextResponse.json({ error: "Bad request" }, { status: 400 });
  }
}
