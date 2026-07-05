// Arc Testnet network config
// values verified against https://docs.arc.io/arc/references/connect-to-arc
export const ARC_TESTNET = {
  chainId: "0x4CEF52", // 5042002 decimal
  chainName: "Arc Testnet",
  nativeCurrency: { name: "USDC", symbol: "USDC", decimals: 18 },
  rpcUrls: ["https://rpc.testnet.arc.network"],
  blockExplorerUrls: ["https://testnet.arcscan.app"],
};

// Arc's gas token IS USDC, so payments are plain native transfers.
// No ERC-20 contract, no approvals needed.
export const QUERY_FEE = 10_000_000_000_000_000n; // 0.01 USDC, 18 decimals
export const USDC_DECIMALS = 18;

// wallet that receives payments
export const TREASURY_ADDR =
  process.env.NEXT_PUBLIC_AGENT_TREASURY ||
  "0x000000000000000000000000000000000000dEaD";
