import {  run } from "hardhat";
import claimReceiptABI from "./../demo/abi/ClaimReceipt.json";
import claimReceiptNFTABI from "./../demo/abi/ClaimReceiptNFT.json";
import claimDatacoreABI from "./../demo/abi/Datacore.json";

const LENS_HUB_ADDRESS = "0x60Ae865ee4C725cd04353b5AAb364553f56ceF82";
const USD_TOKEN = "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889";

async function main() {
  // const CypherSwapClaimReceipt = await ethers.getContractFactory(
  //   "CypherSwapClaimReceipt"
  // );
  // const CypherSwapClaimReceiptNFT = await ethers.getContractFactory(
  //   "CypherSwapClaimReceiptNFT"
  // );
  // const CypherSwapDatacore = await ethers.getContractFactory(
  //   "CypherSwapDatacore"
  // );
  // const CypherSwapTreasury = await ethers.getContractFactory(
  //   "CypherSwapTreasury"
  // );
  // const CypherSwapHook = await ethers.getContractFactory("CypherSwapHook");

  // const cypherSwapClaimReceipt = await CypherSwapClaimReceipt.deploy();
  // const cypherSwapClaimReceiptNFT = await CypherSwapClaimReceiptNFT.deploy();
  // const cypherSwapDatacore = await CypherSwapDatacore.deploy(
  //   "0xCecfE130d1Bc30F4ED3BA57ebd7FfbD977d45129",
  //   LENS_HUB_ADDRESS,
  //   cypherSwapClaimReceiptNFT.address,
  //   USD_TOKEN,
  //   USD_TOKEN
  // );
  // const cypherSwapHook = await CypherSwapHook.deploy(
  //   USD_TOKEN,
  //   "0x7f0b02Bc18Ff30ac140899be753Dd3cEe7D04bC5"
  // );
  // const cypherSwapTreasury = await CypherSwapTreasury.deploy(
  //   "0xCecfE130d1Bc30F4ED3BA57ebd7FfbD977d45129",
  //   "0xaE4F5a435fE5FEED5FE9b49d113bAd3E99D23746",
  //   USD_TOKEN,
  //   USD_TOKEN,
  //   "0xCecfE130d1Bc30F4ED3BA57ebd7FfbD977d45129"
  // );

  // await cypherSwapClaimReceipt.deployed();
  // await cypherSwapClaimReceiptNFT.deployed();
  // await cypherSwapDatacore.deployed();
  // await cypherSwapHook.deployed();
  // await cypherSwapTreasury.deployed();
  console.log(
    "Addresses:",
    // cypherSwapClaimReceipt.address,
    // cypherSwapClaimReceiptNFT.address,
    // cypherSwapDatacore.address,
    // cypherSwapHook.address,
    // cypherSwapTreasury.address,
    USD_TOKEN
  );
  // const provider = new ethers.providers.JsonRpcProvider(
  //   `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_MUMBAI_KEY}`
  // );
  // const signer = new ethers.Wallet(process.env.PRIVATE_KEY!, provider);

  // const cypherSwapClaimReceipt = new ethers.Contract(
  //   "0xCecfE130d1Bc30F4ED3BA57ebd7FfbD977d45129",
  //   claimReceiptABI,
  //   signer
  // );
  // await cypherSwapClaimReceipt.updateCypherSwapDatacore(
  //   "0xaE4F5a435fE5FEED5FE9b49d113bAd3E99D23746"
  // );

  // const cypherSwapClaimReceiptNFT = new ethers.Contract(
  //   "0x7f0b02Bc18Ff30ac140899be753Dd3cEe7D04bC5",
  //   claimReceiptNFTABI,
  //   signer
  // );
  // await cypherSwapClaimReceiptNFT.updateCypherSwapDatacore(
  //   "0xaE4F5a435fE5FEED5FE9b49d113bAd3E99D23746"
  // );

  // const cypherSwapDataCore = new ethers.Contract(
  //   "0xaE4F5a435fE5FEED5FE9b49d113bAd3E99D23746",
  //   claimDatacoreABI,
  //   signer
  // );
  // await cypherSwapDataCore.setCypherSwapTreasury(
  //   "0xAcdd1c80e0EF10FC2577CA4214497A79Baa7D6A0"
  // );

  // const tx = await cypherSwapClaimReceipt.updateCypherSwapDatacore(
  //   cypherSwapDatacore.address
  // );
  // await tx.wait();
  // const tx2 = await cypherSwapClaimReceiptNFT.updateCypherSwapDatacore(
  //   cypherSwapDatacore.address
  // );
  // const tx3 = await cypherSwapClaimReceiptNFT.updateCypherSwapHook(
  //   cypherSwapHook.address
  // );
  // await tx2.wait();
  // await tx3.wait();

  // const tx4 = await cypherSwapDatacore.setCypherSwapTreasury(
  //   cypherSwapTreasury.address
  // );
  // await tx4.wait();

  // const tx5 = await cypherSwapHook.setTreasuryAddress(
  //   cypherSwapTreasury.address
  // );
  // await tx5.wait();

  // console.log("complete");

  await run(`verify:verify`, {
    address: "0xCecfE130d1Bc30F4ED3BA57ebd7FfbD977d45129",
    constructorArguments: [],
  });
  await run(`verify:verify`, {
    address: "0x7f0b02Bc18Ff30ac140899be753Dd3cEe7D04bC5",
    constructorArguments: [],
  });
  await run(`verify:verify`, {
    address: "0xaE4F5a435fE5FEED5FE9b49d113bAd3E99D23746",
    constructorArguments: [
      "0xCecfE130d1Bc30F4ED3BA57ebd7FfbD977d45129",
      LENS_HUB_ADDRESS,
      "0x7f0b02Bc18Ff30ac140899be753Dd3cEe7D04bC5",
      USD_TOKEN,
      USD_TOKEN,
    ],
  });
  await run(`verify:verify`, {
    address: "0xAcdd1c80e0EF10FC2577CA4214497A79Baa7D6A0",
    constructorArguments: [
      "0xCecfE130d1Bc30F4ED3BA57ebd7FfbD977d45129",
      "0xaE4F5a435fE5FEED5FE9b49d113bAd3E99D23746",
      USD_TOKEN,
      USD_TOKEN,
      "0xCecfE130d1Bc30F4ED3BA57ebd7FfbD977d45129",
    ],
  });
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
