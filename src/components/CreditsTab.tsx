"use client";

import { useState, useEffect, useCallback } from "react";
import { payForInference, PaymentResult } from "@/lib/arc";

interface CreditsTabProps {
  walletAddress: string | null;
}

interface Account {
  apiKey: string;
  balance: number;
  spent: number;
  queries: number;
}

const TOPUP_AMOUNT = 0.01; // one payment tx tops up by this much for the demo

export default function CreditsTab({ walletAddress }: CreditsTabProps) {
  const [account, setAccount] = useState<Account | null>(null);
  const [loading, setLoading] = useState(true);
  const [topping, setTopping] = useState(false);
  const [error, setError] = useState("");
  const [keyRevealed, setKeyRevealed] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    if (!walletAddress) {
      setLoading(false);
      return;
    }
    try {
      const res = await fetch(`/api/credits?wallet=${encodeURIComponent(walletAddress)}`);
      const data = await res.json();
      setAccount(data);
    } catch {
      // keep last known state
    } finally {
      setLoading(false);
    }
  }, [walletAddress]);

  useEffect(() => {
    load();
  }, [load]);

  const handleTopUp = async () => {
    setError("");
    setTopping(true);
    try {
      const tx: PaymentResult = await payForInference();
      await fetch("/api/credits", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ wallet: tx.from, topUp: TOPUP_AMOUNT }),
      });
      await load();
    } catch (err: unknown) {
      setError((err as Error).message);
    } finally {
      setTopping(false);
    }
  };

  const handleCopyKey = async () => {
    if (!account) return;
    try {
      await navigator.clipboard.writeText(account.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable
    }
  };

  if (!walletAddress) {
    return (
      <div className="border border-arc-700 rounded-xl p-8 text-center">
        <p className="text-gray-600 font-mono text-sm">// wallet not connected</p>
        <p className="text-gray-700 text-xs mt-1">
          Connect your wallet to get an API key and prepaid balance
        </p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-10">
        <span className="text-xs font-mono text-gray-600">Loading account…</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-mono text-gray-600 uppercase tracking-widest mb-2">
          For developers
        </p>
        <p className="text-sm text-gray-400 leading-relaxed">
          Skip the per-query wallet signature. Top up a prepaid balance once,
          then call Tollgate from your own code with an API key. Same
          verification guarantees, no browser wallet required at request time.
        </p>
      </div>

      {/* Balance + top up */}
      <div className="grid grid-cols-2 gap-3">
        <div className="border border-arc-700 rounded-xl px-4 py-4 bg-arc-800/60">
          <p className="text-xs text-gray-600 font-mono mb-1">Balance</p>
          <p className="text-2xl font-mono font-bold text-accent">
            ${account?.balance.toFixed(4) ?? "0.0000"}
          </p>
        </div>
        <div className="border border-arc-700 rounded-xl px-4 py-4 bg-arc-800/60">
          <p className="text-xs text-gray-600 font-mono mb-1">API Queries Used</p>
          <p className="text-2xl font-mono font-bold text-gray-200">
            {account?.queries ?? 0}
          </p>
        </div>
      </div>

      <button
        onClick={handleTopUp}
        disabled={topping}
        className="w-full py-3 rounded-xl font-mono font-bold text-sm text-white
          bg-gradient-to-r from-usdc-blue to-accent
          hover:opacity-90 transition-opacity disabled:opacity-50"
      >
        {topping ? "Confirming payment…" : `Top up $${TOPUP_AMOUNT.toFixed(2)} USDC`}
      </button>
      {error && <p className="text-xs text-red-400/90 font-mono">{error}</p>}

      {/* API key */}
      <div className="border border-arc-700 rounded-xl overflow-hidden">
        <div className="px-4 py-3 border-b border-arc-700">
          <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">
            Your API Key
          </span>
        </div>
        <div className="p-4 flex items-center gap-2">
          <code className="flex-1 text-xs font-mono text-gray-300 bg-arc-900 rounded-lg
            px-3 py-2.5 overflow-x-auto whitespace-nowrap">
            {keyRevealed ? account?.apiKey : "tg_" + "•".repeat(32)}
          </code>
          <button
            onClick={() => setKeyRevealed((v) => !v)}
            className="shrink-0 px-3 py-2.5 rounded-lg text-xs font-mono
              border border-arc-600 text-gray-400 hover:text-gray-200
              hover:border-arc-500 transition-colors"
          >
            {keyRevealed ? "Hide" : "Reveal"}
          </button>
          <button
            onClick={handleCopyKey}
            className="shrink-0 px-3 py-2.5 rounded-lg text-xs font-mono
              border border-arc-600 text-gray-400 hover:text-gray-200
              hover:border-arc-500 transition-colors"
          >
            {copied ? "Copied ✓" : "Copy"}
          </button>
        </div>
      </div>

      {/* Usage snippet */}
      <div className="border border-arc-700 rounded-xl overflow-hidden">
        <div className="px-4 py-2 border-b border-arc-700 bg-arc-800/60">
          <span className="text-xs font-mono text-gray-500">Use it from your code</span>
        </div>
        <pre className="px-4 py-3 overflow-x-auto text-xs font-mono text-gray-300 leading-relaxed">
          <code>{`curl https://tollgate.app/api/v1/query \\
  -H "Authorization: Bearer ${keyRevealed ? account?.apiKey : "tg_..."}" \\
  -H "Content-Type: application/json" \\
  -d '{"query": "explain arc testnet finality"}'`}</code>
        </pre>
      </div>

      <p className="text-xs text-gray-600 leading-relaxed">
        Each call debits $0.01 from your prepaid balance. No balance, no answer,
        same 402 behavior as the wallet flow.
      </p>
    </div>
  );
}
