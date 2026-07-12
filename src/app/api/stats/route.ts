import { NextRequest, NextResponse } from "next/server";

// In-memory fallback store (per server instance). On Vercel serverless this
// resets between cold starts, which is expected for now, real
// persistence would use a database or the artifact storage API from the client.
type StatsRecord = {
  totalQueries: number;
  totalUsdc: number;
  wallets: Record<string, { queries: number; usdc: number }>;
  recentAnswers: { query: string; from: string; timestamp: number }[];
};

const globalStats: StatsRecord = (globalThis as unknown as { __tollgateStats?: StatsRecord })
  .__tollgateStats ?? {
  totalQueries: 0,
  totalUsdc: 0,
  wallets: {},
  recentAnswers: [],
};
(globalThis as unknown as { __tollgateStats?: StatsRecord }).__tollgateStats = globalStats;

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const wallet = url.searchParams.get("wallet")?.toLowerCase();

  const leaderboard = Object.entries(globalStats.wallets)
    .map(([addr, v]) => ({ address: addr, ...v }))
    .sort((a, b) => b.usdc - a.usdc)
    .slice(0, 10);

  const myStats = wallet ? globalStats.wallets[wallet] : undefined;
  const myAnswers = wallet
    ? globalStats.recentAnswers.filter((a) => a.from === wallet).slice(-20).reverse()
    : [];

  return NextResponse.json({
    totalQueries: globalStats.totalQueries,
    totalUsdc: Number(globalStats.totalUsdc.toFixed(4)),
    leaderboard,
    recentAnswers: globalStats.recentAnswers.slice(-8).reverse(),
    myStats: myStats
      ? { queries: myStats.queries, usdc: Number(myStats.usdc.toFixed(4)) }
      : { queries: 0, usdc: 0 },
    myAnswers,
  });
}

export async function POST(req: NextRequest) {
  try {
    const { query, from, amount } = await req.json();
    const amt = parseFloat(amount) || 0;

    globalStats.totalQueries += 1;
    globalStats.totalUsdc += amt;

    const addr = (from || "unknown").toLowerCase();
    if (!globalStats.wallets[addr]) {
      globalStats.wallets[addr] = { queries: 0, usdc: 0 };
    }
    globalStats.wallets[addr].queries += 1;
    globalStats.wallets[addr].usdc += amt;

    globalStats.recentAnswers.push({
      query: (query || "").slice(0, 80),
      from: addr,
      timestamp: Date.now(),
    });
    if (globalStats.recentAnswers.length > 50) {
      globalStats.recentAnswers = globalStats.recentAnswers.slice(-50);
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("stats route error:", err);
    return NextResponse.json({ ok: false }, { status: 500 });
  }
}
