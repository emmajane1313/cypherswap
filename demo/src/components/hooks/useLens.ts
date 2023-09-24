import { createPublicClient, createWalletClient, custom, http } from "viem";
import * as LitJsSdk from "@lit-protocol/lit-node-client";
import { polygonMumbai } from "viem/chains";
import LensHubAbi from "./../../../abi/LensHub.json";
import DatacoreAbi from "./../../../abi/Datacore.json";
import TreasuryAbi from "./../../../abi/Treasury.json";
import FeeCollectAbi from "./../../../abi/FeeCollect.json";
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
import { mirror } from "../../../graphql/mutations/mirror";
import addReaction from "../../../graphql/mutations/react";
import checkApproved from "../../../lib/helpers/checkApproved";

const useLens = () => {
  const publicClient = createPublicClient({
    chain: polygonMumbai,
    transport: http(
      `https://polygon-mumbai.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_MUMBAI_KEY}`
    ),
  });
  const { address } = useAccount();
  const [profile, setProfile] = useState<any>();
  const [filledBars, setFilledBars] = useState<number>(0);
  const [publication, setPublication] = useState<any>();
  const [reacted, setReacted] = useState<boolean>(false);
  const [currentMilestone, setCurrentMilestone] = useState<number>(1);
  const [postLoading, setPostLoading] = useState<boolean>(false);
  const [pubId, setPubId] = useState<number>();
  const [collected, setCollected] = useState<boolean>(false);
  const [authSig, setAuthSig] = useState<LitAuthSig>();
  const [claimLoading, setClaimLoading] = useState<boolean[]>(
    Array.from({ length: 3 }, () => false)
  );
  const [postDescription, setPostDescription] = useState<{
    title: string;
    description: string;
    milestoneOne: string[];
    milestoneTwo: string[];
    milestoneThree: string[];
    challenge: string;
    teamInfo: string;
    claimBy: number[];
    claimFrom: number[];
    value: string;
    amounts: string[];
  }>({
    title: "Grant Title",
    description: "Grant Description...",
    milestoneOne: [],
    milestoneTwo: [],
    milestoneThree: [],
    challenge: "What problem does this grant solve?",
    teamInfo:
      "Who is behind the grant? Why are you working on it? What are your expectatons beyond the grant?",
    claimBy: [
      // new Date().setDate(new Date().getDate() + 3),
      // new Date().setDate(new Date().getDate() + 5),
      // new Date().setDate(new Date().getDate() + 7),
    ],
    claimFrom: [
      // new Date().setDate(new Date().getDate()),
      // new Date().setDate(new Date().getDate()),
      // new Date().setDate(new Date().getDate()),
    ],
    value: "",
    amounts: [],
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
        ${postDescription.challenge}
        \n\n
        ${postDescription.teamInfo}
        \n\n
        ${postDescription.milestoneOne.join(" ")}
        \n\n
        ${postDescription.milestoneTwo.join(" ")}
        \n\n
        ${postDescription.milestoneThree.join(" ")}
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
              currency: "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
              value: postDescription.value,
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
    setClaimLoading((prevClaimLoading) => {
      const updatedClaimLoading = [...prevClaimLoading];
      updatedClaimLoading[currentMilestone - 1] = true;
      return updatedClaimLoading;
    });
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
    setClaimLoading((prevClaimLoading) => {
      const updatedClaimLoading = [...prevClaimLoading];
      updatedClaimLoading[currentMilestone - 1] = false;
      return updatedClaimLoading;
    });
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

  console.log({ collected, reacted });

  const callCollectApproval = async (): Promise<void> => {
    try {
      const { approvalArgs, contractAddress } = await checkApproved(
        "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
        "FeeCollectModule",
        "0.01"
      );
      console.log({ approvalArgs });
      const clientWallet = createWalletClient({
        chain: polygonMumbai,
        transport: custom((window as any).ethereum),
      });

      console.log({ contractAddress });

      const { request } = await publicClient.simulateContract({
        address: "0x9c3C9283D3e44854697Cd22D3Faa240Cfb032889",
        abi: FeeCollectAbi,
        functionName: "approve",
        chain: polygonMumbai,
        args: [contractAddress, "100000000000000000"],
        account: address,
      });
      const res = await clientWallet.writeContract(request);
      // const res = await clientWallet.sendTransaction({
      //   to: approvalArgs?.to as `0x${string}`,
      //   account: approvalArgs?.from as `0x${string}`,
      //   value: approvalArgs?.data,
      // });
      await publicClient.waitForTransactionReceipt({ hash: res });
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
            _amount: [1, 1, 1],
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

  const checkUSDBalanceInPool = async () => {
    try {
      // if grant has interaction data
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
        const chronicleSigner = new ethers.Wallet(
          process.env.NEXT_PUBLIC_PRIVATE_KEY!,
          chronicleProvider
        );

        const newCircuit = new Circuit(chronicleSigner);
        newCircuit.setConditions([
          new ContractCondition(
            LENS_HUB_ADRESS,
            LensHubAbi,
            CHAIN_NAME.MUMBAI,
            `https://polygon-mumbai.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_MUMBAI_KEY}`,
            "PostCreated",
            ["profileId", "pubId"],
            [parseInt(profile.id, 16), publication.id],
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
                  _amount: postDescription.amounts.map((item: string) =>
                    Number(item)
                  ),
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

  const lensInteractionInterval = async () => {
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
        const chronicleProvider = new ethers.providers.JsonRpcProvider(
          "https://chain-rpc.litprotocol.com/http",
          175177
        );
        const chronicleSigner = new ethers.Wallet(
          process.env.NEXT_PUBLIC_PRIVATE_KEY!,
          chronicleProvider
        );

        const newCircuit = new Circuit(chronicleSigner);

        newCircuit.setConditions([
          new ContractCondition(
            LENS_HUB_ADRESS,
            LensHubAbi,
            CHAIN_NAME.MUMBAI,
            `https://polygon-mumbai.g.alchemy.com/v2/${process.env.NEXT_PUBLIC_ALCHEMY_MUMBAI_KEY}`,
            "PostCreated",
            ["profileId", "pubId"],
            [parseInt(profile.id, 16), publication.id],
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

  const handleMirrorLike = async () => {
    setPostLoading(true);
    let mirrorPost: any;
    try {
      mirrorPost = await mirror({
        profileId: profile?.id,
        publicationId: publication?.id,
        referenceModule: {
          followerOnlyReferenceModule: false,
        },
      });

      const typedData: any = mirrorPost.data.createMirrorTypedData.typedData;

      const clientWallet = createWalletClient({
        chain: polygonMumbai,
        transport: custom((window as any).ethereum),
      });

      const signature: any = await clientWallet.signTypedData({
        domain: omit(typedData?.domain, ["__typename"]),
        types: omit(typedData?.types, ["__typename"]),
        primaryType: "MirrorWithSig",
        message: omit(typedData?.value, ["__typename"]),
        account: address as `0x${string}`,
      });

      // const broadcastResult: any = await broadcast({
      //   id: mirrorPost?.data?.createMirrorTypedData?.id,
      //   signature,
      // });

      const { v, r, s } = splitSignature(signature);
      const { request } = await publicClient.simulateContract({
        address: LENS_HUB_ADRESS,
        abi: LensHubAbi,
        functionName: "mirrorWithSig",
        chain: polygonMumbai,
        args: [
          {
            profileId: typedData.value.profileId,
            profileIdPointed: typedData.value.profileIdPointed,
            pubIdPointed: typedData.value.pubIdPointed,
            referenceModuleData: typedData.value.referenceModuleData,
            referenceModule: typedData.value.referenceModule,
            referenceModuleInitData: typedData.value.referenceModuleInitData,
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

      await addReaction({
        profileId: profile?.id,
        reaction: "UPVOTE",
        publicationId: publication?.id,
      });
      setReacted(true);
    } catch (err: any) {
      console.error(err.message);
    }
    setPostLoading(false);
  };

  const handleCollect = async () => {
    setPostLoading(true);
    try {
      // await callCollectApproval();
      const collectPost = await collect({
        publicationId: publication?.id,
      });
      const typedData: any = collectPost.data.createCollectTypedData.typedData;
      const clientWallet = createWalletClient({
        chain: polygonMumbai,
        transport: custom((window as any).ethereum),
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
      setCollected(true);
    } catch (err: any) {
      console.error(err.message);
    }
    setPostLoading(false);
  };

  useEffect(() => {
    // availableCurrencies()
    setPostDescription({
      title: "Grant Title",
      description: "Grant Description...",
      milestoneOne: [
        "* Key Milestone Accomplishment",
        "* Key Milestone Accomplishment",
        "* Key Milestone Accomplishment",
      ],
      milestoneTwo: [
        "* Key Milestone Accomplishment",
        "* Key Milestone Accomplishment",
        "* Key Milestone Accomplishment",
      ],
      milestoneThree: [
        "* Key Milestone Accomplishment",
        "* Key Milestone Accomplishment",
        "* Key Milestone Accomplishment",
      ],
      challenge: "What problem does this grant solve?",
      teamInfo:
        "Who is behind the grant? Why are you working on it? What are your expectatons beyond the grant?",
      claimBy: [
        new Date().setDate(new Date().getDate() + 3),
        new Date().setDate(new Date().getDate() + 5),
        new Date().setDate(new Date().getDate() + 7),
      ],
      claimFrom: [
        new Date().setDate(new Date().getDate()),
        new Date().setDate(new Date().getDate()),
        new Date().setDate(new Date().getDate()),
      ],
      value: "0.01",
      amounts: ["5000", "5000", "5000"],
    });
  }, []);

  useEffect(() => {}, []);

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
    publication,
    handleCollect,
    collected,
    filledBars,
    setFilledBars,
    handleMirrorLike,
    reacted,
    currentMilestone,
    claimLoading,
  };
};

export default useLens;
