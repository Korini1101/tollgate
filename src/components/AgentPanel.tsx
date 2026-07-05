"use client";

import { useState } from "react";
import { payForInference, explorerTxUrl, PaymentResult } from "@/lib/arc";
import type { TxRecord } from "./TxLedger";

const EXAMPLE_QUERIES = [
  "What is USDC and why is it better than sending crypto directly?",
  "Explain how stablecoin-based cross-border payments work",
  "What are the risks of DeFi yield farming?",
  "How does Circle's CCTP enable cross-chain USDC movement?",
];

interface AgentPanelProps {
  walletAddress: string | null;
  onTxComplete: (record: TxRecord) => void;
}

type FlowStep = "idle" | "paying" | "paid" | "inferring" | "done" | "error";

export default function AgentPanel({ walletAddress, onTxComplete }: AgentPanelProps) {
  const [query, setQuery] = useState("");
  const [step, setStep] = useState<FlowStep>("idle");
  const [payment, setPayment] = useState<PaymentResult | null>(null);
  const [answer, setAnswer] = useState("");
  const [paymentCheck, setPaymentCheck] = useState<{
    verified: boolean;
    demo: boolean;
    elapsedMs?: number;
    blockNumber?: string;
  } | null>(null);
  const [error, setError] = useState("");
  const [demoMode, setDemoMode] = useState(false);

  const handleSubmit = async () => {
    if (!query.trim()) return;
    setError("");
    setAnswer("");
    setPaymentCheck(null);
    setPayment(null);

    try {
      let tx: PaymentResult;

      if (demoMode || !walletAddress) {
        // Demo mode: skip real payment for testnet-less browsers
        setStep("paying");
        await new Promise((r) => setTimeout(r, 1200));
        tx = {
          txHash: "0x" + Math.random().toString(16).slice(2).padStart(64, "0"),
          amount: "0.0100",
          from: walletAddress || "0xDEMO",
          timestamp: Date.now(),
        };
      } else {
        setStep("paying");
        tx = await payForInference();
      }

      setPayment(tx);
      setStep("paid");

      // Small pause so user sees the payment confirmed state
      await new Promise((r) => setTimeout(r, 600));

      // Now call AI inference
      setStep("inferring");
      const res = await fetch("/api/infer", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, txHash: tx.txHash, from: tx.from }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Inference failed");

      setAnswer(data.answer);
      setPaymentCheck({
        verified: !!data.verified,
        demo: !!data.demo,
        elapsedMs: data.elapsedMs,
        blockNumber: data.blockNumber,
      });
      setStep("done");

      onTxComplete({
        txHash: tx.txHash,
        query,
        answer: data.answer,
        amount: tx.amount,
        timestamp: tx.timestamp,
      });

      // Record to global network stats (fire-and-forget, non-blocking)
      fetch("/api/stats", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, from: tx.from, amount: tx.amount }),
      }).catch(() => {
        // stats recording is best-effort, never block the user experience
      });
    } catch (err: unknown) {
      setError((err as Error).message);
      setStep("error");
    }
  };

  const handleReset = () => {
    setStep("idle");
    setQuery("");
    setPayment(null);
    setAnswer("");
    setPaymentCheck(null);
    setError("");
  };

  return (
    <div className="space-y-4">
      {/* Query input */}
      <div className="relative">
        <textarea
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Ask the AI agent anything about DeFi, stablecoins, or Web3…"
          disabled={step !== "idle" && step !== "done" && step !== "error"}
          rows={3}
          className="w-full bg-arc-800 border border-arc-700 hover:border-arc-600
            focus:border-accent/50 focus:outline-none focus:ring-1 focus:ring-accent/30
            rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600
            font-sans resize-none transition-colors
            disabled:opacity-60 disabled:cursor-not-allowed"
        />
        <div className="absolute bottom-3 right-3 text-xs text-gray-700 font-mono">
          {query.length}/500
        </div>
      </div>

      {/* Example queries */}
      {step === "idle" && (
        <div className="flex flex-wrap gap-2">
          {EXAMPLE_QUERIES.map((q) => (
            <button
              key={q}
              onClick={() => setQuery(q)}
              className="text-xs px-3 py-1.5 rounded-lg bg-arc-700/60 hover:bg-arc-700
                text-gray-400 hover:text-gray-200 border border-arc-700 hover:border-arc-600
                transition-colors font-mono"
            >
              {q.slice(0, 40)}…
            </button>
          ))}
        </div>
      )}

      {/* Demo mode toggle */}
      {!walletAddress && (
        <label className="flex items-center gap-2 cursor-pointer group w-fit">
          <div
            onClick={() => setDemoMode(!demoMode)}
            className={`w-9 h-5 rounded-full transition-colors relative ${
              demoMode ? "bg-steel-500/70" : "bg-arc-700"
            }`}
          >
            <div
              className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform ${
                demoMode ? "translate-x-4" : "translate-x-0.5"
              }`}
            />
          </div>
          <span className="text-xs text-gray-500 group-hover:text-gray-400 font-mono">
            Demo mode (skip real payment)
          </span>
        </label>
      )}

      {/* Submit button */}
      {(step === "idle" || step === "error") && (
        <button
          onClick={handleSubmit}
          disabled={!query.trim() || (!walletAddress && !demoMode)}
          className="w-full py-3 rounded-xl font-mono font-bold text-sm
            bg-gradient-to-r from-usdc-blue to-accent/80
            hover:from-usdc-light hover:to-accent
            disabled:opacity-40 disabled:cursor-not-allowed
            transition-all duration-200 text-white
            shadow-lg shadow-usdc-blue/20 hover:shadow-usdc-blue/40"
        >
          {walletAddress || demoMode
            ? "Pay 0.01 USDC → Get AI Answer"
            : "Connect wallet to query"}
        </button>
      )}

      {/* Flow status */}
      {step === "paying" && (
        <StatusBox
          color="yellow"
          icon="⟳"
          title="Sending 0.01 USDC on Arc Testnet…"
          subtitle="Confirm the transaction in MetaMask"
          spinning
        />
      )}

      {step === "paid" && payment && (
        <StatusBox
          color="green"
          icon="✓"
          title="Payment confirmed on Arc!"
          subtitle={
            <a
              href={explorerTxUrl(payment.txHash)}
              target="_blank"
              rel="noopener noreferrer"
              className="text-usdc-blue hover:text-usdc-light underline"
            >
              {payment.txHash.slice(0, 18)}… ↗
            </a>
          }
        />
      )}

      {step === "inferring" && (
        <StatusBox
          color="cyan"
          icon="◈"
          title="Agent is thinking…"
          subtitle="Running inference on your paid query"
          spinning
        />
      )}

      {step === "done" && answer && (
        <div className="border border-steel-400/30 rounded-xl overflow-hidden">
          <div className="bg-steel-400/5 px-4 py-2 border-b border-steel-400/20
            flex items-center justify-between">
            <span className="text-xs font-mono text-steel-400 uppercase tracking-wider">
              ✓ Agent Response · 0.01 USDC paid
            </span>
            {payment && (
              <a
                href={explorerTxUrl(payment.txHash)}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-gray-500 hover:text-gray-400 font-mono underline"
              >
                View tx ↗
              </a>
            )}
          </div>
          <div className="px-4 py-4">
            <p className="text-sm text-gray-200 leading-relaxed">{answer}</p>
          </div>
          {paymentCheck && (
            <div className="px-4 pb-3 flex flex-wrap items-center gap-2">
              {paymentCheck.demo ? (
                <span className="text-[10px] font-mono px-2 py-1 rounded-md
                  bg-gray-700/30 text-gray-500 border border-gray-700">
                  Demo mode, payment not verified on-chain
                </span>
              ) : (
                <span className="text-[10px] font-mono px-2 py-1 rounded-md
                  bg-steel-400/10 text-steel-400 border border-steel-400/25">
                  ✓ Verified on-chain{paymentCheck.blockNumber ? ` · block ${parseInt(paymentCheck.blockNumber, 16)}` : ""}
                </span>
              )}
              {typeof paymentCheck.elapsedMs === "number" && (
                <span className="text-[10px] font-mono px-2 py-1 rounded-md
                  bg-accent/10 text-accent-soft border border-accent/25">
                  Answered in {(paymentCheck.elapsedMs / 1000).toFixed(2)}s
                </span>
              )}
            </div>
          )}
          <div className="px-4 py-3 border-t border-arc-700 flex justify-end">
            <button
              onClick={handleReset}
              className="text-xs font-mono text-gray-500 hover:text-gray-300
                px-3 py-1.5 rounded-lg border border-arc-700 hover:border-arc-600
                transition-colors"
            >
              Ask another (pay again)
            </button>
          </div>
        </div>
      )}

      {step === "error" && error && (
        <div className="border border-red-500/30 rounded-xl px-4 py-3 bg-red-500/5">
          <p className="text-xs text-red-400 font-mono">{error}</p>
        </div>
      )}
    </div>
  );
}

// ── Small status box helper ────────────────────────────────────────────────────
interface StatusBoxProps {
  color: "yellow" | "green" | "cyan";
  icon: string;
  title: string;
  subtitle?: React.ReactNode;
  spinning?: boolean;
}

const colorMap = {
  yellow: "border-yellow-500/30 bg-yellow-500/5 text-yellow-400",
  green: "border-steel-400/30 bg-steel-400/5 text-steel-400",
  cyan: "border-accent/30 bg-accent/5 text-accent",
};

function StatusBox({ color, icon, title, subtitle, spinning }: StatusBoxProps) {
  return (
    <div className={`border rounded-xl px-4 py-3 flex items-start gap-3 ${colorMap[color]}`}>
      <span
        className={`text-lg leading-none mt-0.5 ${spinning ? "animate-spin" : ""}`}
      >
        {icon}
      </span>
      <div>
        <p className="text-sm font-mono font-bold">{title}</p>
        {subtitle && (
          <p className="text-xs text-gray-500 mt-0.5">{subtitle}</p>
        )}
      </div>
    </div>
  );
}
