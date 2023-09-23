import { ethers } from "hardhat";

const LENS_HUB_ADDRESS = "0x";
const PKP_ADDRESS = "0x";

async function main() {
  const PoolManager = await ethers.getContractFactory("PoolManager");
  const poolManager = await PoolManager.deploy(ethers.constants.MaxUint256);
  await poolManager.deployed();
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
    poolManager.address,
    usdtToken.address
  );
  const cypherSwapHook = await CypherSwapHook.deploy(
    poolManager.address,
    cypherSwapClaimReceiptNFT.address
  );
  const cypherSwapTreasury = await CypherSwapTreasury.deploy(
    cypherSwapAccessControl.address,
    cypherSwapClaimReceipt.address,
    cypherSwapDatacore.address,
    usdtToken.address,
    poolManager.address,
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
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
