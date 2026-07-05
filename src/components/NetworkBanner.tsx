"use client";

import { useState, useEffect } from "react";
import {
  getCurrentChainId,
  isArcChain,
  switchToArcTestnet,
  onChainChanged,
  hasWallet,
} from "@/lib/arc";

interface NetworkBannerProps {
  walletAddress: string | null;
}

export default function NetworkBanner({ walletAddress }: NetworkBannerProps) {
  const [wrongNetwork, setWrongNetwork] = useState(false);
  const [switching, setSwitching] = useState(false);

  useEffect(() => {
    if (!walletAddress || !hasWallet()) {
      setWrongNetwork(false);
      return;
    }

    let cancelled = false;

    getCurrentChainId().then((id) => {
      if (!cancelled) setWrongNetwork(!isArcChain(id));
    });

    const off = onChainChanged((id) => {
      setWrongNetwork(!isArcChain(id));
    });

    return () => {
      cancelled = true;
      off();
    };
  }, [walletAddress]);

  if (!wrongNetwork) return null;

  const handleSwitch = async () => {
    setSwitching(true);
    try {
      await switchToArcTestnet();
      setWrongNetwork(false);
    } catch {
      // user rejected, keep banner
    } finally {
      setSwitching(false);
    }
  };

  return (
    <div
      className="flex items-center justify-between gap-3 px-4 py-3 mb-6
        rounded-xl border border-amber-500/30 bg-amber-500/5"
    >
      <p className="text-xs font-mono text-amber-400/90">
        Your wallet is on a different network. Tollgate runs on Arc Testnet.
      </p>
      <button
        onClick={handleSwitch}
        disabled={switching}
        className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-mono font-semibold
          bg-amber-500/15 text-amber-300 border border-amber-500/30
          hover:bg-amber-500/25 transition-colors disabled:opacity-50"
      >
        {switching ? "Switching…" : "Switch to Arc"}
      </button>
    </div>
  );
}
