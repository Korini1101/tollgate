"use client";

import { explorerTxUrl } from "@/lib/arc";

export interface TxRecord {
  txHash: string;
  query: string;
  answer: string;
  amount: string;
  timestamp: number;
}

interface TxLedgerProps {
  records: TxRecord[];
}

export default function TxLedger({ records }: TxLedgerProps) {
  if (!records.length) {
    return (
      <div className="border border-arc-700 rounded-xl p-6 text-center">
        <p className="text-gray-600 font-mono text-sm">
          // no transactions yet
        </p>
        <p className="text-gray-700 text-xs mt-1">
          Pay for a query to see on-chain records
        </p>
      </div>
    );
  }

  return (
    <div className="border border-arc-700 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-arc-700 flex items-center gap-2">
        <div className="w-2 h-2 rounded-full bg-steel-400 animate-pulse" />
        <span className="text-xs font-mono text-gray-400 uppercase tracking-widest">
          On-chain Ledger · Arc Testnet
        </span>
      </div>
      <div className="divide-y divide-arc-700/60 max-h-96 overflow-y-auto">
        {records.map((r, i) => (
          <div key={r.txHash} className="p-4 hover:bg-arc-700/30 transition-colors">
            <div className="flex items-start justify-between gap-2 mb-2">
              <span className="text-xs font-mono text-accent">
                #{records.length - i}
              </span>
              <div className="flex items-center gap-3">
                <span className="text-xs text-steel-400 font-mono font-bold">
                  −{r.amount} USDC
                </span>
                <a
                  href={explorerTxUrl(r.txHash)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-usdc-blue hover:text-usdc-light font-mono underline underline-offset-2"
                >
                  {r.txHash.slice(0, 10)}…
                </a>
              </div>
            </div>
            <p className="text-xs text-gray-300 mb-1">
              <span className="text-gray-600">Q: </span>{r.query}
            </p>
            <p className="text-xs text-gray-400 leading-relaxed">
              <span className="text-gray-600">A: </span>{r.answer}
            </p>
            <p className="text-xs text-gray-700 mt-2 font-mono">
              {new Date(r.timestamp).toLocaleTimeString()}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
