import { createPublicClient, createWalletClient, custom, http } from "viem";
import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { polygonMumbai } from "viem/chains";
import LensHubAbi from "./../../../abi/LensHub.json";
import DatacoreAbi from "./../../../abi/Datacore.json";
import TreasuryAbi from "./../../../abi/Treasury.json";
import { useState, FormEvent, useEffect } from "react";
import {
  LENS_HUB_ADRESS,
  TREASURY_ADRESS,
  DATACORE_ADRESS,
  PKP_TOKEN_ID,
} from "../../../lib/constants";
import { privateKeyToAccount } from "viem/accounts";
import { splitSignature } from "ethers/lib/utils.js";
import uploadPostContent from "../../../lib/helpers/uploadPostContent";
import { createPostTypedData } from "../../../graphql/mutations/post";
import { omit } from "lodash";
import { useAccount, useSignMessage } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { setAuthenticationToken } from "../../../lib/utils";
import generateChallenge from "../../../graphql/queries/challenge";
import authenticate from "../../../graphql/mutations/authenticate";
import getDefaultProfile from "../../../graphql/mutations/getDefaultProfile";
import {
  CHAIN_NAME,
  Circuit,
  ContractCondition,
  LitAuthSig,
  LitChainIds,
  WebhookCondition,
} from "lit-listener-sdk";
import { ethers } from "ethers";
import { generateAuthSig } from "../../../lib/helpers/generateAuthSig";
import availableCurrencies from "../../../lib/helpers/currencies";
import { getPublication } from "../../../graphql/queries/getPublication";
import { litExecute } from "../../../lib/helpers/litExecute";
import { createTxData } from "../../../lib/helpers/createTxData";
import collect from "../../../graphql/mutations/collect";

const useLens = () => {
  const publicClient = createPublicClient({
    chain: polygonMumbai,
    transport: http(
      `https://polygon-mumbai.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_MUMBAI_KEY}`
    ),
  });
  const { address } = useAccount();
  const [profile, setProfile] = useState<any>();
  const [publication, setPublication] = useState<any>();
  const [bonusPoolAmount, setBonusPoolAmount] = useState<number>(0);
  const [currentMilestone, setCurrentMilestone] = useState<number>(1);
  const [postLoading, setPostLoading] = useState<boolean>(false);
  const [pubId, setPubId] = useState<number>();
  const [authSig, setAuthSig] = useState<LitAuthSig>();
  const [postDescription, setPostDescription] = useState<{
    title: string;
    description: string;
    milestoneOne: string;
    milestoneTwo: string;
    milestoneThree: string;
    challenge: string;
    teamInfo: string;
    claimBy: number[];
    claimFrom: number[];
  }>({
    title: "Grant Title",
    description: "Grant Description...",
    milestoneOne: "",
    milestoneTwo: "",
    milestoneThree: "",
    challenge: "What problem does this grant solve?",
    teamInfo:
      "Who is behind the grant? Why are you working on it? What are your expectatons beyond the grant?",
    claimBy: [
      new Date().setDate(new Date().getDate() + 3),
      new Date().setDate(new Date().getDate() + 5),
      new Date().setDate(new Date().getDate() + 7),
    ],
    claimFrom: [
      new Date().setDate(new Date().getDate() + 2),
      new Date().setDate(new Date().getDate() + 4),
      new Date().setDate(new Date().getDate() + 6),
    ],
  });
  const [contentURI, setContentURI] = useState<string>();
  const [coverImageValue, setCoverImageValue] = useState<FormEvent>();
  const { signMessageAsync } = useSignMessage();
  const litClient = new LitJsSdk.LitNodeClient({
    litNetwork: "serrano",
    debug: true,
    alertWhenUnauthorized: true,
  });

  const signIn = async () => {
    const challengeResponse = await generateChallenge(address);
    const signature = await signMessageAsync({
      message: challengeResponse.data.challenge.text,
    });
    const accessTokens = await authenticate(
      address as string,
      signature as string
    );
    if (accessTokens) {
      setAuthenticationToken({ token: accessTokens.data.authenticate });
      const profile = await getDefaultProfile(address?.toLowerCase());

      if (profile?.data?.defaultProfile) {
        setProfile(profile?.data?.defaultProfile);
      }
    }

    const web3Provider = new ethers.providers.Web3Provider(
      (window as any)?.ethereum!
    );
    const connectedSigner = web3Provider.getSigner();

    const authSig = await generateAuthSig(
      connectedSigner as ethers.Signer,
      LitChainIds["mumbai"]
    );

    setAuthSig(authSig);
  };

  const handlePost = async (): Promise<void> => {
    setPostLoading(true);
    let result: any;
    try {
      const response = await fetch("api/ipfs", {
        method: "POST",
        body: (coverImageValue as any)?.target.files[0],
      });
      const contentURIValue = await uploadPostContent(
        [
          {
            cid: "ipfs://" + (await response.json()).cid,
            type: 1,
          },
        ],
        `
        ${postDescription.title}
        \n\n
        ${postDescription.description}
        \n\n
        ${postDescription.description}
        \n\n
        ${postDescription.teamInfo}
        \n\n
        ${postDescription.milestoneOne}
        \n\n
        ${postDescription.milestoneTwo}
        \n\n
        ${postDescription.milestoneThree}
        `,
        setContentURI,
        contentURI
      );

      result = await createPostTypedData({
        profileId: profile?.id,
        contentURI: "ipfs://" + contentURIValue,
        collectModule: {
          feeCollectModule: {
            amount: {
              currency: "0x2058A9D7613eEE744279e3856Ef0eAda5FCbaA7e",
              value: "10",
            },
            recipient: TREASURY_ADRESS,
            referralFee: 0,
            followerOnly: false,
          },
        },
        referenceModule: {
          followerOnlyReferenceModule: false,
        },
      });

      const typedData: any = result.data.createPostTypedData.typedData;

      const clientWallet = createWalletClient({
        chain: polygonMumbai,
        transport: custom((window as any).ethereum),
      });

      const signature: any = await clientWallet.signTypedData({
        domain: omit(typedData?.domain, ["__typename"]),
        types: omit(typedData?.types, ["__typename"]),
        primaryType: "PostWithSig",
        message: omit(typedData?.value, ["__typename"]),
        account: address as `0x${string}`,
      });

      const { v, r, s } = splitSignature(signature);

      const { request } = await publicClient.simulateContract({
        address: LENS_HUB_ADRESS.toLowerCase() as `0x${string}`,
        abi: LensHubAbi,
        functionName: "postWithSig",
        args: [
          {
            profileId: typedData.value.profileId,
            contentURI: typedData.value.contentURI,
            profileIdPointed: typedData.value.profileIdPointed,
            pubIdPointed: typedData.value.pubIdPointed,
            referenceModuleData: typedData.value.referenceModuleData,
            referenceModule: typedData.value.referenceModule,
            referenceModuleInitData: typedData.value.referenceModuleInitData,
            collectModule: typedData.value.collectModule,
            collectModuleInitData: typedData.value.collectModuleInitData,
            sig: {
              v,
              r,
              s,
              deadline: typedData.value.deadline,
            },
          },
        ],
        account: address,
      });
      const res = await clientWallet.writeContract(request);
      await publicClient.waitForTransactionReceipt({ hash: res });

      const pubIdValue = await publicClient.readContract({
        address: LENS_HUB_ADRESS,
        abi: LensHubAbi,
        functionName: "getPubCount",
        args: [profile.id],
      });

      setPubId(Number(pubIdValue) as number);

      const { data } = await getPublication({
        publicationId:
          profile?.id + "-" + "0x0" + (Number(pubIdValue) as any).toString(16),
      });

      setPublication(data?.publication);
      onchainInitialize(Number(pubIdValue));
    } catch (err: any) {
      console.error(err.message);
    }
    setPostLoading(false);
  };

  const claimMilestone = async () => {
    try {
      const clientWallet = createWalletClient({
        chain: polygonMumbai,
        transport: custom((window as any).ethereum),
      });

      const { request } = await publicClient.simulateContract({
        address: DATACORE_ADRESS.toLowerCase() as `0x${string}`,
        abi: DatacoreAbi,
        functionName: "claimMilestoneAmount",
        args: [pubId, currentMilestone],
        account: address,
      });

      const res = await clientWallet.writeContract(request);
      await publicClient.waitForTransactionReceipt({ hash: res });
      setCurrentMilestone(currentMilestone + 1);
    } catch (err: any) {
      console.error(err.message);
    }
  };

  const claimBonus = async () => {
    try {
      const clientWallet = createWalletClient({
        chain: polygonMumbai,
        transport: custom((window as any).ethereum),
      });

      const { request } = await publicClient.simulateContract({
        address: DATACORE_ADRESS.toLowerCase() as `0x${string}`,
        abi: DatacoreAbi,
        functionName: "claimBonus",
        args: [pubId],
        account: address,
      });

      const res = await clientWallet.writeContract(request);
      await publicClient.waitForTransactionReceipt({ hash: res });
      setCurrentMilestone(currentMilestone + 1);
    } catch (err: any) {
      console.error(err.message);
    }
  };

  const onchainInitialize = async (pubIdValue: number) => {
    try {
      await litClient.connect();
      const provider = new ethers.providers.JsonRpcProvider(
        `https://polygon-mumbai.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_MUMBAI_KEY}`,
        80001
      );

      const tx = await createTxData(
        provider,
        DatacoreAbi,
        DATACORE_ADRESS,
        "initializeGrantRecipient",
        [
          {
            _granteeAddresses: [address],
            _milestoneId: [1, 2, 3],
            _claimBy: postDescription.claimBy,
            _claimFrom: postDescription.claimFrom,
            _amount: [5000, 5000, 5000],
            _splitAmounts: [100],
            _pubId: pubIdValue,
          },
        ]
      );

      console.log({ tx });

      await litExecute(
        provider,
        litClient,
        tx,
        "initializeGrantRecipient",
        authSig
      );
    } catch (err: any) {
      console.error(err.message);
    }
  };

  const readLensDataUpdate = async () => {
    try {
      if (typeof window !== "undefined" && "ethereum" in window) {
        await litClient.connect();

        const web3Provider = new ethers.providers.Web3Provider(
          (window as any)?.ethereum!
        );
        const connectedSigner = web3Provider.getSigner();

        const authSig = await generateAuthSig(
          connectedSigner as ethers.Signer,
          LitChainIds["mumbai"]
        );

        console.log({ authSig });

        const chronicleProvider = new ethers.providers.JsonRpcProvider(
          "https://chain-rpc.litprotocol.com/http",
          175177
        );
        console.log("after", process.env.NEXT_PUBLIC_PRIVATE_KEY);
        const chronicleSigner = new ethers.Wallet(
          process.env.NEXT_PUBLIC_PRIVATE_KEY!,
          chronicleProvider
        );

        console.log({ chronicleSigner, profileId });

        const pubIdValue = await publicClient.readContract({
          address: LENS_HUB_ADRESS,
          abi: LensHubAbi,
          functionName: "getPubCount",
          args: [parseInt(profileId, 16)],
        });
        const pubId = Number(pubIdValue) + 1;

        console.log({ pubId, profileId });

        const newCircuit = new Circuit(chronicleSigner);

        newCircuit.setConditions([
          new ContractCondition(
            LENS_HUB_ADRESS,
            LensHubAbi,
            CHAIN_NAME.MUMBAI,
            `https://polygon-mumbai.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_MUMBAI_KEY}`,
            "PostCreated",
            ["profileId", "pubId"],
            [parseInt(profileId, 16), pubId],
            "==",
            async () => console.log("matched"),
            async () => console.log("unmatched"),
            async (error) => console.log("error", error.message)
          ),
        ]);

        const { unsignedTransactionDataObject, litActionCode } =
          await newCircuit.setActions([
            {
              type: "contract",
              priority: 0,
              contractAddress: DATACORE_ADRESS,
              abi: DatacoreAbi,
              functionName: "initializeGrantRecipient",
              chainId: CHAIN_NAME.MUMBAI,
              nonce: 1,
              gasLimit: 100000,
              value: 0,
              providerURL: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_MUMBAI_KEY}`,
              maxPriorityFeePerGas: 1000,
              maxFeePerGas: 10000,
              args: [
                {
                  _granteeAddresses: [address],
                  _milestoneId: [1, 2, 3],
                  _claimBy: postDescription.claimBy,
                  _claimFrom: postDescription.claimFrom,
                  _amount: [5000, 5000, 5000],
                  _splitAmounts: [100],
                  _pubId: pubId,
                },
              ],
            },
          ]);
        newCircuit.setConditionalLogic({
          type: "EVERY",
          interval: 20000,
        });
        newCircuit.executionConstraints({
          startDate: new Date(),
        });

        const response = await fetch("api/ipfs", {
          method: "POST",
          body: litActionCode,
        });

        console.log({ response });

        const ipfsCID = (await response.json()).cid;

        const {
          publicKey,
          tokenId,
          address: ethAddress,
        } = await newCircuit.mintGrantBurnPKP(ipfsCID);

        console.log({ publicKey });

        newCircuit.start({
          publicKey: publicKey,
          ipfsCID,
          authSig,
          broadcast: true,
        });

        console.log("started");
      }
    } catch (err: any) {
      console.error(err.message);
    }
  };

  const likeandMirrorPostScript = async () => {
    try {
    } catch (err: any) {
      console.error(err.message);
    }
  };

  const getBonusPoolAmount = async () => {
    try {
      const amount = await publicClient.readContract({
        address: TREASURY_ADRESS,
        abi: TreasuryAbi,
        functionName: "get24HourBonusBalance",
        args: [],
      });

      setBonusPoolAmount(amount as number);
    } catch (err: any) {
      console.error(err.message);
    }
  };

  const handleCollect = async () => {
    try {
      const collectPost = await collect({
        publicationId: publication?.id,
      });
      const typedData: any = collectPost.data.createCollectTypedData.typedData;
      const clientWallet = createWalletClient({
        chain: polygonMumbai,
        transport: http(
          `https://polygon-mumbai.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_MUMBAI_KEY}`
        ),
      });

      const signature: any = await clientWallet.signTypedData({
        domain: omit(typedData?.domain, ["__typename"]),
        types: omit(typedData?.types, ["__typename"]),
        primaryType: "CollectWithSig",
        message: omit(typedData?.value, ["__typename"]),
        account: address as `0x${string}`,
      });

      const { v, r, s } = splitSignature(signature);
      const { request } = await publicClient.simulateContract({
        address: LENS_HUB_ADRESS,
        abi: LensHubAbi,
        functionName: "collectWithSig",
        chain: polygonMumbai,
        args: [
          {
            collector: address,
            profileId: typedData.value.profileId,
            pubId: typedData.value.pubId,
            data: typedData.value.data,
            sig: {
              v,
              r,
              s,
              deadline: typedData.value.deadline,
            },
          },
        ],
        account: address,
      });

      const res = await clientWallet.writeContract(request);

      await publicClient.waitForTransactionReceipt({ hash: res });
    } catch (err: any) {
      console.error(err.message);
    }
  };

  useEffect(() => {
    getBonusPoolAmount();
    // availableCurrencies();
  }, [address, profile]);

  return {
    setPostDescription,
    setCoverImageValue,
    handlePost,
    postLoading,
    claimMilestone,
    claimBonus,
    signIn,
    postDescription,
    profile,
    coverImageValue,
    bonusPoolAmount,
    publication,
    handleCollect,
  };
};

export default useLens;
