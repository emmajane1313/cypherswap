import {
  createPublicClient,
  createWalletClient,
  http,
} from "viem";
import { hardhat } from "viem/chains";
import LensHubAbi from "./../../../abi/LensHub.json";
import { privateKeyToAccount } from "viem/accounts";
import { defaultAbiCoder } from "ethers/lib/utils";
import { v4 as uuidv4 } from "uuid";
import { useState, FormEvent } from "react";
import { FEE_COLLECT_MODULE, LENS_HUB_ADDR } from "../../../lib/constants";

const useLens = () => {
  const publicClient = createPublicClient({
    chain: hardhat,
    transport: http(),
  });
  const [postDescription, setPostDescription] = useState<string>("");
  const [coverImageValue, setCoverImageValue] = useState<FormEvent>();

  const createGrantPost = async () => {
    try {
      const clientWallet = createWalletClient({
        chain: hardhat,
        transport: http(),
      });
      const account = privateKeyToAccount(privateKeys[0]);

      const responseCover = await fetch("api/ipfs", {
        method: "POST",
        body: (coverImageValue?.target as any)?.files[0],
      });
      const coverImage: string = (await responseCover.json()).cid;

      const response = await fetch("/api/ipfs", {
        method: "POST",
        body: JSON.stringify({
          version: "2.0.0",
          metadata_id: uuidv4(),
          description: postDescription,
          content: postDescription,
          external_url: "https://www.cypherswap.xyz/",
          image: {
            item: "ipfs://" + coverImage,
            type: 1,
            altTag: "ipfs://" + coverImage,
          },
          imageMimeType: "image/png",
          name: "CypherSwap Grant",
          mainContentFocus: "IMAGE",
          contentWarning: null,
          attributes: [],
          media: [
            {
              item: "ipfs://" + coverImage,
              type: 1,
              altTag: "ipfs://" + coverImage,
            },
          ],
          locale: "en",
          tags: ["cypherswap"],
          appId: "cypherswap",
        }),
      });

      const responseJSON = await response.json();
      const contentURI: string = responseJSON.cid;

      const simulateContract = await publicClient.simulateContract({
        address: LENS_HUB_ADDR,
        abi: LensHubAbi,
        functionName: "post",
        args: [
          {
            profileId: 1,
            contentURI: "ipfs://" + contentURI,
            collectModule: FEE_COLLECT_MODULE,
            collectModuleInitData: defaultAbiCoder.encode(["bool"], [true]),
            referenceModule: "0x0000000000000000000000000000000000000000",
            referenceModuleInitData: [],
          },
        ],
        chain: hardhat,
        account,
      });

      const res = await clientWallet.writeContract(simulateContract.request);
      await publicClient.waitForTransactionReceipt({ hash: res });
      // read contract
      const collectNFTAddr = await lensHub.getCollectNFT(1, 1);
    } catch (err: any) {
      console.error(err.message);
    }
  };

  const makePost = async () => {

    
  }


  return {
    setPostDescription,
    setCoverImageValue,
  };
};

export default useLens;
