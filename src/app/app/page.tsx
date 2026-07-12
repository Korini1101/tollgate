"use client";

import { useState } from "react";
import Link from "next/link";
import WalletConnect from "@/components/WalletConnect";
import AgentPanel from "@/components/AgentPanel";
import TxLedger, { TxRecord } from "@/components/TxLedger";
import ArchDiagram from "@/components/ArchDiagram";
import NetworkStats from "@/components/NetworkStats";
import MyHistory from "@/components/MyHistory";
import DocsTab from "@/components/DocsTab";
import NetworkBanner from "@/components/NetworkBanner";
import NetworkStatus from "@/components/NetworkStatus";
import CreditsTab from "@/components/CreditsTab";

type Tab = "agent" | "network" | "history" | "credits" | "docs";

const TABS: { id: Tab; label: string }[] = [
  { id: "agent", label: "Agent" },
  { id: "network", label: "Network" },
  { id: "history", label: "History" },
  { id: "credits", label: "API" },
  { id: "docs", label: "Docs" },
];

export default function Home() {
  const [walletAddress, setWalletAddress] = useState<string | null>(null);
  const [txHistory, setTxHistory] = useState<TxRecord[]>([]);
  const [tab, setTab] = useState<Tab>("agent");

  const totalSpent = txHistory
    .reduce((acc, r) => acc + parseFloat(r.amount), 0)
    .toFixed(4);

  return (
    <main className="min-h-screen px-4 py-8 max-w-3xl mx-auto">
      <Link
        href="/"
        className="inline-flex items-center gap-1 text-xs font-mono text-gray-600 hover:text-accent transition-colors mb-6"
      >
        ← back to home
      </Link>
      <NetworkBanner walletAddress={walletAddress} />

      {/* Header */}
      <header className="flex items-start justify-between mb-8">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-mono text-accent uppercase tracking-widest">
              Arc Testnet
            </span>
          </div>
          <h1 className="text-3xl font-bold font-mono tracking-tight">Toll<span className="text-accent">gate</span></h1>
          <p className="text-sm text-gray-500 mt-1 font-sans">
            Pay 0.01 USDC, get an AI answer. Every payment verified on-chain first.
          </p>
        </div>
        <WalletConnect onConnect={setWalletAddress} />
      </header>

      {/* Stats bar */}
      <div className="grid grid-cols-3 gap-3 mb-6">
        {[
          { label: "Queries Answered", value: txHistory.length.toString() },
          { label: "USDC Paid On-chain", value: `$${totalSpent}` },
          { label: "Network", value: "live" },
        ].map((s) => (
          <div
            key={s.label}
            className="border border-arc-700 rounded-xl px-4 py-3 bg-arc-800/60"
          >
            <p className="text-xs text-gray-600 font-mono mb-1">{s.label}</p>
            {s.value === "live" ? (
              <NetworkStatus />
            ) : (
              <p className="text-lg font-mono font-bold text-gray-200">{s.value}</p>
            )}
          </div>
        ))}
      </div>

      {/* Tab navigation */}
      <div className="flex items-center gap-1 mb-6 border-b border-arc-700">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`px-4 py-2.5 text-xs font-mono font-semibold uppercase tracking-wider
              border-b-2 -mb-px transition-colors ${
                tab === t.id
                  ? "border-accent text-accent"
                  : "border-transparent text-gray-600 hover:text-gray-400"
              }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "agent" && (
        <>
          <div className="mb-8">
            <p className="text-xs font-mono text-gray-600 uppercase tracking-widest mb-3">
              How it works
            </p>
            <div className="flex items-center gap-0">
              {[
                { n: "1", label: "Connect", sub: "Wallet → Arc Testnet" },
                { n: "2", label: "Pay", sub: "0.01 USDC transfer" },
                { n: "3", label: "Verify", sub: "Tx confirmed on-chain" },
                { n: "4", label: "Answer", sub: "AI inference served" },
              ].map((step, i) => (
                <div key={step.n} className="flex items-center flex-1 min-w-0">
                  <div className="flex flex-col items-center flex-1">
                    <div
                      className="w-8 h-8 rounded-full border border-arc-700 bg-arc-800
                        flex items-center justify-center text-xs font-mono font-bold
                        text-accent mb-1"
                    >
                      {step.n}
                    </div>
                    <p className="text-xs font-mono font-semibold text-gray-300 text-center">
                      {step.label}
                    </p>
                    <p className="text-xs text-gray-600 text-center leading-tight mt-0.5">
                      {step.sub}
                    </p>
                  </div>
                  {i < 3 && (
                    <div className="w-6 h-px bg-arc-700 flex-shrink-0 mx-1 mb-4" />
                  )}
                </div>
              ))}
            </div>
          </div>

          <section className="border border-arc-700 rounded-2xl p-6 bg-arc-800/40 mb-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <h2 className="text-sm font-mono font-bold text-gray-300 uppercase tracking-wider">
                Query the Agent
              </h2>
              <span className="ml-auto text-xs font-mono text-gray-700">
                fee: 0.01 USDC / query
              </span>
            </div>
            <AgentPanel
              walletAddress={walletAddress}
              onTxComplete={(record) =>
                setTxHistory((prev) => [record, ...prev])
              }
            />
          </section>

          <section className="mb-6">
            <ArchDiagram />
          </section>

          <section className="mb-2">
            <p className="text-xs font-mono text-gray-600 uppercase tracking-widest mb-3">
              Payment Ledger (this session)
            </p>
            <TxLedger records={txHistory} />
          </section>
        </>
      )}

      {tab === "network" && (
        <section className="mb-2">
          <NetworkStats />
        </section>
      )}

      {tab === "history" && (
        <section className="mb-2">
          <MyHistory walletAddress={walletAddress} />
        </section>
      )}

      {tab === "credits" && (
        <section className="mb-2">
          <CreditsTab walletAddress={walletAddress} />
        </section>
      )}

      {tab === "docs" && (
        <section className="mb-2">
          <DocsTab />
        </section>
      )}

      {/* Footer */}
      <footer className="border-t border-arc-700 pt-6 mt-10 text-center">
        <p className="text-xs text-gray-800 font-mono mt-1">
          Circle USDC · Arc Testnet
        </p>

        <div className="flex items-center justify-center gap-3 mt-5 pb-2">
          <span className="text-[11px] text-gray-700/50 font-mono">
            Made by Korini
          </span>
          <a
            href="https://x.com/jungsama1101"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X (Twitter)"
            className="text-gray-700/50 hover:text-accent transition-colors"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
            </svg>
          </a>
          <span className="text-gray-800 text-[10px]">·</span>
          <a
            href="https://t.me/dhdtjstod"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Telegram"
            className="text-gray-700/50 hover:text-accent transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.05 3.24 2.7 10.42c-1.24.5-1.24 1.19-.23 1.5l4.7 1.47 1.83 5.6c.22.6.36.84.75.84.31 0 .45-.14.62-.3l1.7-1.64 3.53 2.6c.65.36 1.12.17 1.28-.6L21.9 4.87c.24-.95-.36-1.38-1.15-1.07z" />
            </svg>
          </a>
        </div>
      </footer>
    </main>
  );
}
