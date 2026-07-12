import { ethers } from "hardhat";

// Deploys TollgateReceipt to whatever network is passed via --network.
// Fee is hardcoded to 0.01 USDC (18 decimals, since USDC is Arc's native
// gas token) to match the fee already used client-side in constants.ts.
async function main() {
  const treasury = process.env.NEXT_PUBLIC_AGENT_TREASURY;
  if (!treasury) {
    throw new Error("Set NEXT_PUBLIC_AGENT_TREASURY in your env before deploying");
  }

  const queryFee = ethers.parseUnits("0.01", 18);

  const Factory = await ethers.getContractFactory("TollgateReceipt");
  const contract = await Factory.deploy(treasury, queryFee);
  await contract.waitForDeployment();

  console.log("TollgateReceipt deployed to:", await contract.getAddress());
  console.log("Treasury:", treasury);
  console.log("Query fee:", ethers.formatUnits(queryFee, 18), "USDC");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});
