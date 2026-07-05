"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  connectWallet,
  getUsdcBalance,
  shortAddress,
  explorerAddressUrl,
  onAccountsChanged,
} from "@/lib/arc";

interface WalletConnectProps {
  onConnect: (address: string | null) => void;
}

export default function WalletConnect({ onConnect }: WalletConnectProps) {
  const [address, setAddress] = useState<string | null>(null);
  const [balance, setBalance] = useState("0.0000");
  const [connecting, setConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  const refreshBalance = useCallback(async (addr: string) => {
    try {
      const bal = await getUsdcBalance(addr);
      setBalance(parseFloat(bal).toFixed(4));
    } catch {
      // keep last known balance
    }
  }, []);

  const handleConnect = async () => {
    setConnecting(true);
    setError(null);
    try {
      const addr = await connectWallet();
      setAddress(addr);
      onConnect(addr);
      await refreshBalance(addr);
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setConnecting(false);
    }
  };

  const handleDisconnect = useCallback(() => {
    setAddress(null);
    setMenuOpen(false);
    onConnect(null);
  }, [onConnect]);

  const handleCopy = async () => {
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable, ignore
    }
  };

  // React to account switching in the wallet.
  // Bug fix: this used to close over a stale `address` value and
  // occasionally miss a disconnect when MetaMask fired the event
  // right after a fast account switch. Pulling handleDisconnect out
  // as a stable callback fixed it.
  useEffect(() => {
    const off = onAccountsChanged((accounts) => {
      if (!accounts.length) {
        handleDisconnect();
      } else if (accounts[0] !== address) {
        setAddress(accounts[0]);
        onConnect(accounts[0]);
        refreshBalance(accounts[0]);
      }
    });
    return off;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [address]);

  // Poll balance while connected
  useEffect(() => {
    if (!address) return;
    const id = setInterval(() => refreshBalance(address), 15_000);
    return () => clearInterval(id);
  }, [address, refreshBalance]);

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return;
    const onClick = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [menuOpen]);

  if (address) {
    return (
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setMenuOpen((v) => !v)}
          className="flex items-center gap-3 px-3 py-2 rounded-xl
            border border-arc-600 bg-arc-800/80 hover:border-arc-500
            transition-colors"
        >
          <div className="flex flex-col items-end">
            <span className="text-xs font-mono text-gray-300">
              {shortAddress(address)}
            </span>
            <span className="text-[11px] font-mono text-gray-500">
              {balance} <span className="text-gray-600">USDC</span>
            </span>
          </div>
          <div className="w-2 h-2 rounded-full bg-steel-400" />
        </button>

        {menuOpen && (
          <div
            className="absolute right-0 mt-2 w-52 rounded-xl border border-arc-600
              bg-arc-800 shadow-xl shadow-black/40 overflow-hidden z-50"
          >
            <MenuItem onClick={handleCopy}>
              {copied ? "Copied ✓" : "Copy address"}
            </MenuItem>
            <a
              href={explorerAddressUrl(address)}
              target="_blank"
              rel="noopener noreferrer"
              className="block px-4 py-2.5 text-xs font-mono text-gray-300
                hover:bg-arc-700/60 transition-colors"
              onClick={() => setMenuOpen(false)}
            >
              View on explorer ↗
            </a>
            <div className="border-t border-arc-700" />
            <MenuItem onClick={handleDisconnect} danger>
              Disconnect
            </MenuItem>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col items-end gap-1.5">
      <button
        onClick={handleConnect}
        disabled={connecting}
        className="px-4 py-2 rounded-xl text-sm font-mono font-semibold
          bg-usdc-blue hover:bg-usdc-light text-white
          transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {connecting ? (
          <span className="flex items-center gap-2">
            <span className="w-3 h-3 border border-white/40 border-t-white rounded-full animate-spin" />
            Connecting
          </span>
        ) : (
          "Connect Wallet"
        )}
      </button>
      {error && (
        <span className="text-[11px] text-red-400/90 max-w-[220px] text-right leading-snug">
          {error}
        </span>
      )}
    </div>
  );
}

function MenuItem({
  children,
  onClick,
  danger,
}: {
  children: React.ReactNode;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`w-full text-left px-4 py-2.5 text-xs font-mono transition-colors
        hover:bg-arc-700/60 ${danger ? "text-red-400/90" : "text-gray-300"}`}
    >
      {children}
    </button>
  );
}
