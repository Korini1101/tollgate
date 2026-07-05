"use client";

import { useState, useEffect } from "react";
import { getLatestBlock } from "@/lib/arc";

export default function NetworkStatus() {
  const [block, setBlock] = useState<number | null>(null);
  const [healthy, setHealthy] = useState<boolean | null>(null);

  useEffect(() => {
    let cancelled = false;

    const ping = async () => {
      const b = await getLatestBlock();
      if (cancelled) return;
      setBlock(b);
      setHealthy(b !== null);
    };

    ping();
    const id = setInterval(ping, 30_000);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  return (
    <div
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full
        border border-arc-700 bg-arc-800/60"
      title="Live status of the Arc Testnet RPC"
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          healthy === null
            ? "bg-gray-600"
            : healthy
            ? "bg-steel-400 animate-pulse"
            : "bg-red-500"
        }`}
      />
      <span className="text-[11px] font-mono text-gray-500">
        {healthy === null
          ? "Arc Testnet"
          : healthy
          ? `Arc Testnet · #${block?.toLocaleString()}`
          : "Arc Testnet · unreachable"}
      </span>
    </div>
  );
}
