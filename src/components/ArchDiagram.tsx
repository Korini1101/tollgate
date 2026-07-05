"use client";

export default function ArchDiagram() {
  return (
    <div className="border border-arc-700 rounded-xl overflow-hidden">
      <div className="px-4 py-3 border-b border-arc-700">
        <span className="text-xs font-mono text-gray-500 uppercase tracking-widest">
          Architecture · Track 4, Agentic Economy
        </span>
      </div>
      <div className="p-4">
        <svg viewBox="0 0 680 220" className="w-full" style={{ maxHeight: 220 }}>
          {/* Defs */}
          <defs>
            <marker id="arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#4b5563" />
            </marker>
            <marker id="arrow-cyan" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#4a90d9" />
            </marker>
            <marker id="arrow-green" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto">
              <path d="M0,0 L0,6 L8,3 z" fill="#6b83a8" />
            </marker>
          </defs>

          {/* ── User ── */}
          <rect x="20" y="80" width="100" height="60" rx="10"
            fill="#1c2537" stroke="#2775CA" strokeWidth="1.5" />
          <text x="70" y="106" textAnchor="middle" fill="#5b9bd5" fontSize="10" fontFamily="monospace">👤 User</text>
          <text x="70" y="122" textAnchor="middle" fill="#9ca3af" fontSize="9" fontFamily="monospace">MetaMask</text>
          <text x="70" y="135" textAnchor="middle" fill="#9ca3af" fontSize="9" fontFamily="monospace">Arc Testnet</text>

          {/* ── Arrow: User → USDC ── */}
          <line x1="120" y1="110" x2="168" y2="110"
            stroke="#4a90d9" strokeWidth="1.5" markerEnd="url(#arrow-cyan)" strokeDasharray="4,2" />
          <text x="144" y="104" textAnchor="middle" fill="#4a90d9" fontSize="8" fontFamily="monospace">0.01 USDC</text>

          {/* ── USDC / Arc ── */}
          <rect x="170" y="80" width="110" height="60" rx="10"
            fill="#1c2537" stroke="#4a90d9" strokeWidth="1.5" />
          <text x="225" y="104" textAnchor="middle" fill="#4a90d9" fontSize="10" fontFamily="monospace">⛓ Arc L1</text>
          <text x="225" y="119" textAnchor="middle" fill="#9ca3af" fontSize="9" fontFamily="monospace">USDC ERC-20</text>
          <text x="225" y="132" textAnchor="middle" fill="#9ca3af" fontSize="9" fontFamily="monospace">transfer()</text>

          {/* ── Arrow: Arc → Next.js API ── */}
          <line x1="280" y1="110" x2="328" y2="110"
            stroke="#4b5563" strokeWidth="1.5" markerEnd="url(#arrow)" strokeDasharray="4,2" />
          <text x="304" y="104" textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="monospace">tx confirmed</text>

          {/* ── Next.js API ── */}
          <rect x="330" y="80" width="110" height="60" rx="10"
            fill="#1c2537" stroke="#6b83a8" strokeWidth="1.5" />
          <text x="385" y="104" textAnchor="middle" fill="#6b83a8" fontSize="10" fontFamily="monospace">⚙ Next.js</text>
          <text x="385" y="119" textAnchor="middle" fill="#9ca3af" fontSize="9" fontFamily="monospace">/api/infer</text>
          <text x="385" y="132" textAnchor="middle" fill="#9ca3af" fontSize="9" fontFamily="monospace">Route Handler</text>

          {/* ── Arrow: API → Claude ── */}
          <line x1="440" y1="110" x2="488" y2="110"
            stroke="#4b5563" strokeWidth="1.5" markerEnd="url(#arrow)" strokeDasharray="4,2" />
          <text x="464" y="104" textAnchor="middle" fill="#6b7280" fontSize="8" fontFamily="monospace">prompt</text>

          {/* ── Claude AI ── */}
          <rect x="490" y="80" width="110" height="60" rx="10"
            fill="#1c2537" stroke="#6b83a8" strokeWidth="1.5" />
          <text x="545" y="104" textAnchor="middle" fill="#6b83a8" fontSize="10" fontFamily="monospace">🤖 Claude AI</text>
          <text x="545" y="119" textAnchor="middle" fill="#9ca3af" fontSize="9" fontFamily="monospace">claude-sonnet</text>
          <text x="545" y="132" textAnchor="middle" fill="#9ca3af" fontSize="9" fontFamily="monospace">-4-6</text>

          {/* ── Arrow: Claude → User (return path, below) ── */}
          <path d="M545,140 Q545,180 385,180 Q225,180 70,170 L70,140"
            fill="none" stroke="#6b83a8" strokeWidth="1.5"
            strokeDasharray="4,2" markerEnd="url(#arrow-green)" />
          <text x="310" y="195" textAnchor="middle" fill="#6b83a8" fontSize="8" fontFamily="monospace">
            AI answer returned to user
          </text>

          {/* ── Labels at top ── */}
          <text x="70" y="72" textAnchor="middle" fill="#4b5563" fontSize="8" fontFamily="monospace">1. query</text>
          <text x="225" y="72" textAnchor="middle" fill="#4b5563" fontSize="8" fontFamily="monospace">2. pay</text>
          <text x="385" y="72" textAnchor="middle" fill="#4b5563" fontSize="8" fontFamily="monospace">3. verify</text>
          <text x="545" y="72" textAnchor="middle" fill="#4b5563" fontSize="8" fontFamily="monospace">4. infer</text>
        </svg>
      </div>
    </div>
  );
}
