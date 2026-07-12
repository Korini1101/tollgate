"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import WaveField from "@/components/WaveField";

export default function Landing() {
  return (
    <main className="relative min-h-screen overflow-hidden flex flex-col">
      {/* Wave background, anchored lower so content stays readable */}
      <div className="absolute inset-0 z-0 opacity-70">
        <WaveField />
      </div>

      <Nav />

      {/* Hero: text left, product preview right */}
      <section className="relative z-10 flex-1 w-full max-w-6xl mx-auto px-6 pt-10 pb-16
        grid lg:grid-cols-[1.05fr_1fr] gap-12 lg:gap-8 items-center">
        <div>
          <div className="mb-5 inline-flex items-center gap-2 px-3 py-1.5 rounded-full
            border border-accent/20 bg-accent/5 backdrop-blur-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-steel-400 animate-pulse" />
            <span className="text-xs font-mono text-accent-soft tracking-wide">
              Live on Arc Testnet
            </span>
          </div>

          <h1 className="font-mono font-bold leading-[1.02] tracking-tight
            text-[clamp(2.4rem,5.5vw,4rem)]">
            0.01 USDC.
            <br />
            One <span className="text-accent">question</span>.
            <br />
            Verified on-chain.
          </h1>

          <p className="mt-6 max-w-md text-base text-gray-400 leading-relaxed">
            Tollgate is a pay-per-inference agent on Arc. Connect a wallet,
            pay 0.01 USDC, get an answer. The payment is checked on-chain
            before the model runs, not just trusted by the frontend.
          </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link
              href="/app"
              className="group inline-flex items-center gap-2.5 px-7 py-3.5 rounded-xl
                font-mono font-bold text-sm text-white
                bg-gradient-to-r from-usdc-blue to-accent
                shadow-[0_0_32px_-10px_rgba(74,144,217,0.4)]
                hover:shadow-[0_0_44px_-8px_rgba(74,144,217,0.55)]
                transition-all duration-200 hover:scale-[1.02]"
            >
              Launch App
              <span className="transition-transform group-hover:translate-x-0.5">→</span>
            </Link>
            <a
              href="https://github.com/korini/tollgate"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl
                font-mono text-sm text-gray-400 border border-arc-600
                hover:border-arc-500 hover:text-gray-200 transition-colors"
            >
              <GitHubIcon />
              Source
            </a>
          </div>

          <LiveStats />
        </div>

        <AppPreview />
      </section>

      <HowItWorks />

      <Footer />
    </main>
  );
}

/* ── Nav ─────────────────────────────────────────────────────────────────── */
function Nav() {
  return (
    <nav className="relative z-10 w-full max-w-6xl mx-auto px-6 py-5
      flex items-center justify-between">
      <div className="flex items-center gap-2">
        <GateMark />
        <span className="font-mono font-bold text-lg tracking-tight">Toll<span className="text-accent">gate</span></span>
      </div>
      <div className="flex items-center gap-6">
        <Link
          href="/app"
          className="text-xs font-mono text-gray-500 hover:text-gray-300 transition-colors
            hidden sm:block"
        >
          Docs
        </Link>
        <a
          href="https://github.com/korini/tollgate"
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-mono text-gray-500 hover:text-gray-300 transition-colors
            hidden sm:block"
        >
          GitHub
        </a>
        <Link
          href="/app"
          className="px-4 py-2 rounded-lg text-xs font-mono font-semibold
            bg-arc-700/80 border border-arc-600 text-gray-200
            hover:border-arc-500 transition-colors"
        >
          Launch App
        </Link>
      </div>
    </nav>
  );
}

/* ── Live stats strip (real data from /api/stats) ────────────────────────── */
function LiveStats() {
  const [stats, setStats] = useState<{ totalQueries: number; totalUsdc: number } | null>(null);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((d) => setStats(d))
      .catch(() => {});
  }, []);

  return (
    <div className="mt-10 flex items-center gap-8">
      <Stat
        value={stats ? String(stats.totalQueries) : "–"}
        label="queries answered"
      />
      <div className="w-px h-8 bg-arc-700" />
      <Stat
        value={stats ? `$${stats.totalUsdc.toFixed(2)}` : "–"}
        label="USDC settled"
      />
      <div className="w-px h-8 bg-arc-700" />
      <Stat value="~1s" label="finality on Arc" />
    </div>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div>
      <p className="font-mono font-bold text-xl text-gray-100">{value}</p>
      <p className="text-[11px] font-mono text-gray-600 mt-0.5">{label}</p>
    </div>
  );
}

/* ── Product preview: a real-looking still of the agent UI ───────────────── */
function AppPreview() {
  return (
    <div className="relative">
      {/* soft glow behind the card */}
      <div
        className="absolute -inset-8 rounded-3xl opacity-50 blur-3xl pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse, rgba(74,144,217,0.18) 0%, transparent 65%)",
        }}
      />

      <div className="relative rounded-2xl border border-arc-600 bg-arc-900/90
        backdrop-blur shadow-2xl shadow-black/50 overflow-hidden">
        {/* window chrome */}
        <div className="flex items-center gap-2 px-4 py-3 border-b border-arc-700 bg-arc-800/60">
          <span className="w-2.5 h-2.5 rounded-full bg-arc-600" />
          <span className="w-2.5 h-2.5 rounded-full bg-arc-600" />
          <span className="w-2.5 h-2.5 rounded-full bg-arc-600" />
          <span className="ml-3 text-[11px] font-mono text-gray-600">
            tollgate.app
          </span>
          <span className="ml-auto flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-steel-400" />
            <span className="text-[10px] font-mono text-gray-500">0x7f3a…c21e</span>
          </span>
        </div>

        {/* faked agent panel content */}
        <div className="p-5 space-y-4">
          <div className="rounded-xl border border-arc-700 bg-arc-800 px-4 py-3">
            <p className="text-[13px] text-gray-300">
              How does CCTP move USDC across chains?
            </p>
          </div>

          <div className="rounded-lg border border-steel-400/25 bg-steel-400/5 px-3.5 py-2.5
            flex items-center gap-2.5">
            <span className="text-steel-400 text-sm">✓</span>
            <div>
              <p className="text-[11px] font-mono text-steel-400 font-semibold">
                Payment verified on-chain
              </p>
              <p className="text-[10px] font-mono text-gray-600 mt-0.5">
                0.01 USDC · block 4,182,067 · tx 0x9d4f…a8b2
              </p>
            </div>
          </div>

          <div className="rounded-xl border border-arc-700 px-4 py-3.5">
            <p className="text-[13px] text-gray-300 leading-relaxed">
              CCTP burns USDC on the source chain and mints the same amount on the
              destination, using Circle attestations instead of wrapped tokens.
              Native USDC on both ends, no bridge risk.
            </p>
            <div className="mt-3 flex items-center gap-2">
              <span className="text-[10px] font-mono px-2 py-1 rounded-md
                bg-accent/10 text-accent-soft border border-accent/25">
                Answered in 1.24s
              </span>
              <span className="text-[10px] font-mono px-2 py-1 rounded-md
                bg-arc-700/60 text-gray-500 border border-arc-700">
                claude-sonnet-4-6
              </span>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] font-mono text-gray-600">
              fee: 0.01 USDC / query
            </span>
            <span className="text-[11px] font-mono font-semibold text-accent">
              Ask another →
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── How it works strip ──────────────────────────────────────────────────── */
function HowItWorks() {
  const steps = [
    { n: "01", t: "Connect", d: "Wallet auto-switches to Arc Testnet" },
    { n: "02", t: "Pay", d: "0.01 USDC native transfer, no approvals" },
    { n: "03", t: "Verify", d: "Server checks the tx against Arc RPC" },
    { n: "04", t: "Answer", d: "Inference runs only after verification" },
  ];
  return (
    <section className="relative z-10 w-full max-w-6xl mx-auto px-6 pb-16">
      <div className="grid sm:grid-cols-4 gap-3">
        {steps.map((s) => (
          <div
            key={s.n}
            className="rounded-xl border border-arc-700 bg-arc-800/40 px-4 py-4"
          >
            <p className="text-[11px] font-mono text-accent/70">{s.n}</p>
            <p className="text-sm font-mono font-bold text-gray-200 mt-1.5">{s.t}</p>
            <p className="text-xs text-gray-500 mt-1 leading-relaxed">{s.d}</p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ── Footer ──────────────────────────────────────────────────────────────── */
function Footer() {
  return (
    <footer className="relative z-10 border-t border-arc-800 py-6">
      <div className="w-full max-w-6xl mx-auto px-6 flex flex-col sm:flex-row
        items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-[11px] font-mono text-gray-700">
          <GateMark size={14} />
          <span>Tollgate v0.5 · Arc Testnet</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-[11px] text-gray-700/60 font-mono">Made by Korini</span>
          <a
            href="https://x.com/jungsama1101"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="X (Twitter)"
            className="text-gray-700/60 hover:text-accent transition-colors"
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
            className="text-gray-700/60 hover:text-accent transition-colors"
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M21.05 3.24 2.7 10.42c-1.24.5-1.24 1.19-.23 1.5l4.7 1.47 1.83 5.6c.22.6.36.84.75.84.31 0 .45-.14.62-.3l1.7-1.64 3.53 2.6c.65.36 1.12.17 1.28-.6L21.9 4.87c.24-.95-.36-1.38-1.15-1.07z" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}

/* ── Icons ───────────────────────────────────────────────────────────────── */
function GateMark({ size = 22 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M4 20V8l8-4 8 4v12" stroke="#4a90d9" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 20v-6h6v6" stroke="#2775CA" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function GitHubIcon() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 .5C5.65.5.5 5.65.5 12c0 5.08 3.29 9.39 7.86 10.91.58.11.79-.25.79-.55v-2.15c-3.2.7-3.87-1.36-3.87-1.36-.52-1.33-1.28-1.68-1.28-1.68-1.04-.71.08-.7.08-.7 1.15.08 1.76 1.19 1.76 1.19 1.03 1.76 2.7 1.25 3.35.96.11-.75.4-1.25.73-1.54-2.55-.29-5.24-1.28-5.24-5.69 0-1.26.45-2.28 1.19-3.09-.12-.29-.52-1.46.11-3.05 0 0 .97-.31 3.18 1.18a11 11 0 0 1 5.8 0c2.2-1.49 3.17-1.18 3.17-1.18.63 1.59.23 2.76.12 3.05.74.81 1.18 1.83 1.18 3.09 0 4.42-2.69 5.39-5.26 5.68.41.36.78 1.06.78 2.14v3.17c0 .31.21.67.8.55A10.52 10.52 0 0 0 23.5 12C23.5 5.65 18.35.5 12 .5z" />
    </svg>
  );
}
