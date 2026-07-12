// Manual ethers.js payment path. Kept alongside src/lib/appkit.ts (which
// does the same send through Arc's official App Kit SDK) since App Kit
// is still early and I want a fallback that doesn't depend on it while
// I finish testing the migration.
import { BrowserProvider, formatUnits } from "ethers";
import {
  ARC_TESTNET,
  USDC_DECIMALS,
  QUERY_FEE,
  TREASURY_ADDR,
} from "./constants";

type EthereumProvider = {
  request: (args: { method: string; params?: unknown[] }) => Promise<unknown>;
  on: (event: string, handler: (...args: unknown[]) => void) => void;
  removeListener: (event: string, handler: (...args: unknown[]) => void) => void;
};

declare global {
  interface Window {
    ethereum?: EthereumProvider;
  }
}

export function hasWallet(): boolean {
  return typeof window !== "undefined" && !!window.ethereum;
}

// ── Chain helpers ─────────────────────────────────────────────────────────────

export async function getCurrentChainId(): Promise<string | null> {
  if (!window.ethereum) return null;
  try {
    return (await window.ethereum.request({ method: "eth_chainId" })) as string;
  } catch {
    return null;
  }
}

export function isArcChain(chainId: string | null): boolean {
  if (!chainId) return false;
  return chainId.toLowerCase() === ARC_TESTNET.chainId.toLowerCase();
}

export async function switchToArcTestnet(): Promise<void> {
  if (!window.ethereum) throw new Error("No wallet found");

  try {
    await window.ethereum.request({
      method: "wallet_switchEthereumChain",
      params: [{ chainId: ARC_TESTNET.chainId }],
    });
  } catch (switchError: unknown) {
    const err = switchError as { code?: number; message?: string };
    if (err.code === 4902 || /unrecognized chain/i.test(err.message || "")) {
      await window.ethereum.request({
        method: "wallet_addEthereumChain",
        params: [ARC_TESTNET],
      });
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: ARC_TESTNET.chainId }],
      });
    } else {
      throw switchError;
    }
  }
}

// ── Wallet event subscriptions ────────────────────────────────────────────────

export function onAccountsChanged(handler: (accounts: string[]) => void): () => void {
  if (!window.ethereum) return () => {};
  const wrapped = (...args: unknown[]) => handler((args[0] as string[]) || []);
  window.ethereum.on("accountsChanged", wrapped);
  return () => window.ethereum?.removeListener("accountsChanged", wrapped);
}

export function onChainChanged(handler: (chainId: string) => void): () => void {
  if (!window.ethereum) return () => {};
  const wrapped = (...args: unknown[]) => handler(args[0] as string);
  window.ethereum.on("chainChanged", wrapped);
  return () => window.ethereum?.removeListener("chainChanged", wrapped);
}

// ── Connect ───────────────────────────────────────────────────────────────────

export async function connectWallet(): Promise<string> {
  if (!window.ethereum) {
    throw new Error("No wallet detected. Install a browser wallet to continue.");
  }

  await switchToArcTestnet();

  const accounts = (await window.ethereum.request({
    method: "eth_requestAccounts",
  })) as string[];

  if (!accounts.length) throw new Error("No accounts found");
  return accounts[0];
}

// ── Balance (native USDC on Arc) ──────────────────────────────────────────────

export async function getUsdcBalance(address: string): Promise<string> {
  if (!window.ethereum) return "0.00";
  const provider = new BrowserProvider(window.ethereum);
  const balance = await provider.getBalance(address);
  return formatUnits(balance, USDC_DECIMALS);
}

// ── Payment ───────────────────────────────────────────────────────────────────

export interface PaymentResult {
  txHash: string;
  amount: string;
  from: string;
  timestamp: number;
}

export async function payForInference(): Promise<PaymentResult> {
  if (!window.ethereum) throw new Error("No wallet found");

  const provider = new BrowserProvider(window.ethereum);
  const signer = await provider.getSigner();
  const from = await signer.getAddress();

  const balance = await provider.getBalance(from);
  if (balance < QUERY_FEE) {
    throw new Error(
      `Insufficient USDC. Need 0.01, have ${Number(
        formatUnits(balance, USDC_DECIMALS)
      ).toFixed(4)}`
    );
  }

  const tx = await signer.sendTransaction({
    to: TREASURY_ADDR,
    value: QUERY_FEE,
  });
  await tx.wait();

  return {
    txHash: tx.hash,
    amount: formatUnits(QUERY_FEE, USDC_DECIMALS),
    from,
    timestamp: Date.now(),
  };
}

// ── Display helpers ───────────────────────────────────────────────────────────

export function shortAddress(addr: string): string {
  if (!addr || addr.length < 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

export function explorerTxUrl(txHash: string): string {
  return `${ARC_TESTNET.blockExplorerUrls[0]}/tx/${txHash}`;
}

export function explorerAddressUrl(address: string): string {
  return `${ARC_TESTNET.blockExplorerUrls[0]}/address/${address}`;
}

// ── RPC health (for live status indicator) ────────────────────────────────────

export async function getLatestBlock(): Promise<number | null> {
  try {
    const res = await fetch(ARC_TESTNET.rpcUrls[0], {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        jsonrpc: "2.0",
        id: 1,
        method: "eth_blockNumber",
        params: [],
      }),
    });
    const json = await res.json();
    return json?.result ? parseInt(json.result, 16) : null;
  } catch {
    return null;
  }
}
