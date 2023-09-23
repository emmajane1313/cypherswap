import { ethers } from "hardhat";

const LENS_HUB_ADDRESS = "0x";
const PKP_ADDRESS = "0x";

async function main() {
  const UsdtToken = await ethers.getContractFactory("USDTToken");
  const CypherSwapAccessControl = await ethers.getContractFactory(
    "CypherSwapAccessControl"
  );
  const CypherSwapClaimReceipt = await ethers.getContractFactory(
    "CypherSwapClaimReceipt"
  );
  const CypherSwapClaimReceiptNFT = await ethers.getContractFactory(
    "CypherSwapClaimReceiptNFT"
  );
  const CypherSwapDatacore = await ethers.getContractFactory(
    "CypherSwapDatacore"
  );
  const CypherSwapTreasury = await ethers.getContractFactory(
    "CypherSwapTreasury"
  );
  const CypherSwapHook = await ethers.getContractFactory("CypherSwapHook");

  const usdtToken = await UsdtToken.deploy(
    "0x2ffd013aaa7b5a7da93336c2251075202b33fb2b",
    "0x9fc9c2dfba3b6cf204c37a5f690619772b926e39",
    "0xad9fbd38281f615e7df3def2aad18935a9e0ffee",
    "0x8bffc896d42f07776561a5814d6e4240950d6d3a"
  );
  const cypherSwapAccessControl = await CypherSwapAccessControl.deploy(
    PKP_ADDRESS
  );
  const cypherSwapClaimReceipt = await CypherSwapClaimReceipt.deploy(
    cypherSwapAccessControl.address
  );
  const cypherSwapClaimReceiptNFT = await CypherSwapClaimReceiptNFT.deploy(
    cypherSwapAccessControl.address
  );
  const cypherSwapDatacore = await CypherSwapDatacore.deploy(
    cypherSwapAccessControl.address,
    cypherSwapClaimReceipt.address,
    LENS_HUB_ADDRESS,
    cypherSwapClaimReceiptNFT.address,
    usdtToken.address,
    usdtToken.address
  );
  const cypherSwapHook = await CypherSwapHook.deploy(
    usdtToken.address,
    cypherSwapClaimReceiptNFT.address
  );
  const cypherSwapTreasury = await CypherSwapTreasury.deploy(
    cypherSwapAccessControl.address,
    cypherSwapClaimReceipt.address,
    cypherSwapDatacore.address,
    usdtToken.address,
    usdtToken.address,
    cypherSwapHook.address
  );

  await usdtToken.deployed();
  await cypherSwapAccessControl.deployed();
  await cypherSwapClaimReceipt.deployed();
  await cypherSwapClaimReceiptNFT.deployed();
  await cypherSwapDatacore.deployed();
  await cypherSwapHook.deployed();
  await cypherSwapTreasury.deployed();
  console.log(
    "Addresses:",
    usdtToken.address,
    cypherSwapAccessControl.address,
    cypherSwapClaimReceipt.address,
    cypherSwapClaimReceiptNFT.address,
    cypherSwapDatacore.address,
    cypherSwapHook.address,
    cypherSwapTreasury.address
  );

  const tx = await cypherSwapClaimReceipt.updateCypherSwapDatacore(
    cypherSwapDatacore.address
  );
  await tx.wait();
  const tx2 = await cypherSwapClaimReceiptNFT.updateCypherSwapDatacore(
    cypherSwapDatacore.address
  );
  const tx3 = await cypherSwapClaimReceiptNFT.updateCypherSwapHook(
    cypherSwapHook.address
  );
  await tx2.wait();
  await tx3.wait();

  const tx4 = await cypherSwapDatacore.setCypherSwapTreasury(
    cypherSwapTreasury.address
  );
  await tx4.wait();

  const tx5 = await cypherSwapHook.setTreasuryAddress(
    cypherSwapTreasury.address
  );
  await tx5.wait();

  console.log("complete");
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
