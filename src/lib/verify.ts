// On-chain transaction verification for Arc Testnet.
// Confirms a payment actually happened before the server serves paid content.

import { ARC_TESTNET, TREASURY_ADDR, QUERY_FEE } from "./constants";

const RPC_URL = ARC_TESTNET.rpcUrls[0];

export interface VerifyResult {
  valid: boolean;
  reason?: string;
  blockNumber?: string;
  from?: string;
  to?: string;
  value?: string;
}

// Calls the Arc testnet RPC directly (no wallet needed, server-side only)
// to confirm: the tx exists, is mined, went to our treasury address, and
// carried at least the required fee amount.
export async function verifyPaymentTx(txHash: string): Promise<VerifyResult> {
  if (!txHash || !/^0x[a-fA-F0-9]{64}$/.test(txHash)) {
    return { valid: false, reason: "Malformed transaction hash" };
  }

  try {
    const res = await fetch(RPC_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_getTransactionByHash",
        params: [txHash],
      }),
    });

    const json = await res.json();
    const tx = json?.result;

    if (!tx) {
      return { valid: false, reason: "Transaction not found on Arc testnet" };
    }

    if (!tx.blockNumber) {
      return { valid: false, reason: "Transaction not yet confirmed" };
    }

    const to = (tx.to || "").toLowerCase();
    const expected = TREASURY_ADDR.toLowerCase();
    if (to !== expected) {
      return {
        valid: false,
        reason: `Payment sent to wrong address (expected treasury)`,
      };
    }

    const value = BigInt(tx.value || "0x0");
    if (value < QUERY_FEE) {
      return { valid: false, reason: "Payment amount below required fee" };
    }

    return {
      valid: true,
      blockNumber: tx.blockNumber,
      from: tx.from,
      to: tx.to,
      value: value.toString(),
    };
  } catch (err) {
    console.error("verifyPaymentTx error:", err);
    return { valid: false, reason: "RPC verification failed" };
  }
}
