import { ethers } from "ethers";
import { ETH_ADDRESS } from "../constants";

export const createTxData = async (
  provider: ethers.providers.JsonRpcProvider,
  abi: any,
  contractAddress: string,
  functionName: string,
  args: any[]
) => {
  try {
    const contractInterface = new ethers.utils.Interface(abi);

    const latestBlock = await provider.getBlock("latest");
    const baseFeePerGas = latestBlock.baseFeePerGas;
    const maxFeePerGas = baseFeePerGas?.lt(
      ethers.utils.parseUnits("40", "gwei")
    )
      ? ethers.utils.parseUnits("40", "gwei")
      : baseFeePerGas;

    const maxPriorityFeePerGas = ethers.utils.parseUnits("40", "gwei");
    return {
      to: contractAddress,
      nonce: (await provider.getTransactionCount(ETH_ADDRESS!)) || 0,
      chainId: 80001,
      gasLimit: ethers.BigNumber.from("25000000"),
      maxFeePerGas: maxFeePerGas,
      maxPriorityFeePerGas: maxPriorityFeePerGas,
      from: "{{publicKey}}",
      data: contractInterface.encodeFunctionData(functionName, args),
      value: ethers.BigNumber.from(0),
      type: 2,
    };
  } catch (err: any) {
    console.error(err.message);
  }
};
