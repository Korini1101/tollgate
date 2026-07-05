"use client";

import { useEffect, useState } from "react";

interface MyStatsData {
  myStats: { queries: number; usdc: number };
  myAnswers: { query: string; from: string; timestamp: number }[];
}

interface MyHistoryProps {
  walletAddress: string | null;
}

export default function MyHistory({ walletAddress }: MyHistoryProps) {
  const [data, setData] = useState<MyStatsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!walletAddress) {
      setLoading(false);
      return;
    }
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(
          `/api/stats?wallet=${encodeURIComponent(walletAddress)}`
        );
        const json = await res.json();
        if (!cancelled) setData(json);
      } catch {
        // keep last known data
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    load();
    const id = setInterval(load, 8_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [walletAddress]);

  if (!walletAddress) {
    return (
      <div className="border border-arc-700 rounded-xl p-8 text-center">
        <p className="text-gray-600 font-mono text-sm">// wallet not connected</p>
        <p className="text-gray-700 text-xs mt-1">
          Connect your wallet to see your payment history
        </p>
      </div>
    );
  }

  if (loading && !data) {
    return (
      <div className="text-center py-10">
        <span className="text-xs font-mono text-gray-600">Loading your history…</span>
      </div>
    );
  }

  const queries = data?.myStats?.queries ?? 0;
  const usdc = data?.myStats?.usdc ?? 0;

  if (queries === 0) {
    return (
      <div className="border border-arc-700 rounded-xl p-8 text-center">
        <p className="text-gray-600 font-mono text-sm">// no queries yet</p>
        <p className="text-gray-700 text-xs mt-1">
          Pay for a query in the Agent tab to see it here
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <div className="border border-arc-700 rounded-xl px-4 py-4 bg-arc-800/60">
          <p className="text-xs text-gray-600 font-mono mb-1">Your Queries</p>
          <p className="text-2xl font-mono font-bold text-gray-200">{queries}</p>
        </div>
        <div className="border border-arc-700 rounded-xl px-4 py-4 bg-arc-800/60">
          <p className="text-xs text-gray-600 font-mono mb-1">Total Spent</p>
          <p className="text-2xl font-mono font-bold text-accent">
            ${usdc.toFixed(4)}
          </p>
        </div>
      </div>

      <div className="border border-arc-700 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-arc-700">
          <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">
            Your Query History
          </span>
        </div>
        <div className="divide-y divide-arc-700/60 max-h-80 overflow-y-auto">
          {(data?.myAnswers ?? []).map((a, i) => (
            <div key={i} className="px-4 py-3">
              <p className="text-xs text-gray-300">{a.query}</p>
              <p className="text-[10px] text-gray-700 font-mono mt-1">
                {new Date(a.timestamp).toLocaleString()}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
