"use client";

import { useEffect, useState } from "react";
import { shortAddress } from "@/lib/arc";

interface StatsData {
  totalQueries: number;
  totalUsdc: number;
  leaderboard: { address: string; queries: number; usdc: number }[];
  recentAnswers: { query: string; from: string; timestamp: number }[];
  myStats?: { queries: number; usdc: number };
  myAnswers?: { query: string; from: string; timestamp: number }[];
}

export default function NetworkStats() {
  const [stats, setStats] = useState<StatsData | null>(null);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    try {
      const res = await fetch("/api/stats");
      const data = await res.json();
      setStats(data);
    } catch {
      // ignore, keep last known stats
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const id = setInterval(load, 10_000);
    return () => clearInterval(id);
  }, []);

  if (loading && !stats) {
    return (
      <div className="text-center py-10">
        <span className="text-xs font-mono text-gray-600">Loading network activity…</span>
      </div>
    );
  }

  if (!stats || stats.totalQueries === 0) {
    return (
      <div className="border border-arc-700 rounded-xl p-8 text-center">
        <p className="text-gray-600 font-mono text-sm">// no activity yet</p>
        <p className="text-gray-700 text-xs mt-1">
          Be the first to pay for a query on this instance
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-3">
        <div className="border border-arc-700 rounded-xl px-4 py-4 bg-arc-800/60">
          <p className="text-xs text-gray-600 font-mono mb-1">Total Queries</p>
          <p className="text-2xl font-mono font-bold text-gray-200">
            {stats.totalQueries}
          </p>
        </div>
        <div className="border border-arc-700 rounded-xl px-4 py-4 bg-arc-800/60">
          <p className="text-xs text-gray-600 font-mono mb-1">USDC Processed</p>
          <p className="text-2xl font-mono font-bold text-accent">
            ${stats.totalUsdc.toFixed(4)}
          </p>
        </div>
      </div>

      {stats.leaderboard.length > 0 && (
        <div className="border border-arc-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-arc-700">
            <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">
              Top Payers
            </span>
          </div>
          <div className="divide-y divide-arc-700/60">
            {stats.leaderboard.map((row, i) => (
              <div
                key={row.address}
                className="px-4 py-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-3">
                  <span className="text-xs font-mono text-gray-700 w-4">
                    {i + 1}
                  </span>
                  <span className="text-xs font-mono text-gray-300">
                    {row.address === "unknown" || row.address === "0xdemo"
                      ? "demo user"
                      : shortAddress(row.address)}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs font-mono">
                  <span className="text-gray-600">{row.queries} queries</span>
                  <span className="text-accent-soft font-bold">
                    ${row.usdc.toFixed(4)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {stats.recentAnswers.length > 0 && (
        <div className="border border-arc-700 rounded-xl overflow-hidden">
          <div className="px-4 py-3 border-b border-arc-700 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-steel-400 animate-pulse" />
            <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">
              Recent Activity
            </span>
          </div>
          <div className="divide-y divide-arc-700/60 max-h-64 overflow-y-auto">
            {stats.recentAnswers.map((a, i) => (
              <div key={i} className="px-4 py-3">
                <p className="text-xs text-gray-400 truncate">{a.query}</p>
                <p className="text-[10px] text-gray-700 font-mono mt-1">
                  {shortAddress(a.from)} · {new Date(a.timestamp).toLocaleTimeString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
