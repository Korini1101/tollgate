"use client";

export default function DocsTab() {
  return (
    <div className="space-y-6">
      <div>
        <p className="text-xs font-mono text-gray-600 uppercase tracking-widest mb-2">
          Integrate Tollgate
        </p>
        <p className="text-sm text-gray-400 leading-relaxed">
          Tollgate&apos;s pay-per-inference pattern is a simple recipe any app can
          reuse: require a native USDC transfer on Arc, verify it server-side,
          then serve the paid response.
        </p>
        <p className="text-sm text-gray-400 leading-relaxed mt-3">
          If you're calling Tollgate from your own code rather than a browser,
          skip the wallet signature entirely, go to the <b className="text-gray-300">API</b> tab,
          top up a prepaid balance, and use the API key it gives you. Same
          verification guarantees, just billed against a balance instead of a
          fresh signature per call.
        </p>
      </div>

      <CodeBlock
        label="1. Client sends USDC to your treasury address"
        code={`import { BrowserProvider } from "ethers";

const provider = new BrowserProvider(window.ethereum);
const signer = await provider.getSigner();

const tx = await signer.sendTransaction({
  to: TREASURY_ADDRESS,
  value: 10_000_000_000_000_000n, // 0.01 USDC (18 decimals, native)
});
await tx.wait();`}
      />

      <CodeBlock
        label="2. Server verifies the payment via Arc RPC"
        code={`const res = await fetch("https://rpc.testnet.arc.network", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    jsonrpc: "2.0",
    id: 1,
    method: "eth_getTransactionByHash",
    params: [txHash],
  }),
});

const { result: tx } = await res.json();
const paid =
  tx?.blockNumber &&
  tx.to?.toLowerCase() === TREASURY_ADDRESS.toLowerCase() &&
  BigInt(tx.value) >= REQUIRED_FEE;`}
      />

      <CodeBlock
        label="3. Only then, serve the gated response"
        code={`if (!paid) {
  return new Response("Payment Required", { status: 402 });
}

return Response.json({ answer: await runInference(query) });`}
      />

      <div className="border border-arc-700 rounded-xl p-4">
        <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">
          Why native transfers
        </p>
        <p className="text-sm text-gray-400 leading-relaxed">
          Arc uses USDC as its native gas token, so a payment is just a
          standard value transfer, no ERC-20 contract calls, no approvals.
          That keeps the integration surface small: any wallet that can sign
          a transaction can pay a Tollgate-style endpoint.
        </p>
      </div>

      <div className="border border-arc-700 rounded-xl p-4">
        <p className="text-xs font-mono text-gray-500 uppercase tracking-widest mb-2">
          Network details
        </p>
        <dl className="grid grid-cols-2 gap-y-2 text-xs font-mono">
          <dt className="text-gray-600">Chain ID</dt>
          <dd className="text-gray-300">5042002</dd>
          <dt className="text-gray-600">RPC</dt>
          <dd className="text-gray-300">rpc.testnet.arc.network</dd>
          <dt className="text-gray-600">Explorer</dt>
          <dd className="text-gray-300">testnet.arcscan.app</dd>
          <dt className="text-gray-600">Faucet</dt>
          <dd className="text-gray-300">faucet.circle.com</dd>
        </dl>
      </div>
    </div>
  );
}

function CodeBlock({ label, code }: { label: string; code: string }) {
  return (
    <div className="border border-arc-700 rounded-xl overflow-hidden">
      <div className="px-4 py-2 border-b border-arc-700 bg-arc-800/60">
        <span className="text-xs font-mono text-gray-500">{label}</span>
      </div>
      <pre className="px-4 py-3 overflow-x-auto text-xs font-mono text-gray-300 leading-relaxed">
        <code>{code}</code>
      </pre>
    </div>
  );
}
