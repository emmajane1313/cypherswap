import { createPublicClient, createWalletClient, custom, http } from "viem";
import { polygonMumbai } from "viem/chains";
import LensHubAbi from "./../../../abi/LensHub.json";
import DatacoreAbi from "./../../../abi/Datacore.json";
import { useState, FormEvent } from "react";
import { splitSignature } from "ethers/lib/utils.js";
import {
  LENS_HUB_ADRESS,
  TREASURY_ADRESS,
  DATACORE_ADRESS,
} from "../../../lib/constants";
import uploadPostContent from "../../../lib/helpers/uploadPostContent";
import { createPostTypedData } from "../../../graphql/mutations/post";
import { omit } from "lodash";
import { useAccount, useSignMessage } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { setAuthenticationToken } from "../../../lib/utils";
import generateChallenge from "../../../graphql/queries/challenge";
import authenticate from "../../../graphql/mutations/authenticate";
import getDefaultProfile from "../../../graphql/mutations/getDefaultProfile";

const useLens = () => {
  const publicClient = createPublicClient({
    chain: polygonMumbai,
    transport: http(),
  });
  const { address } = useAccount();
  const [profile, setProfile] = useState<any>();
  const [currentMilestone, setCurrentMilestone] = useState<number>(1);
  const [postLoading, setPostLoading] = useState<boolean>(false);
  const [postDescription, setPostDescription] = useState<{
    title: string;
    description: string;
    milestoneOne: string;
    milestoneTwo: string;
    milestoneThree: string;
  }>({
    title: "",
    description: "",
    milestoneOne: "",
    milestoneTwo: "",
    milestoneThree: "",
  });
  const [contentURI, setContentURI] = useState<string>();
  const [coverImageValue, setCoverImageValue] = useState<FormEvent>();
  const { openConnectModal } = useConnectModal();
  const { signMessageAsync } = useSignMessage({});

  const signIn = async () => {
    openConnectModal;

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
          amount: {
            currency: "0x2058A9D7613eEE744279e3856Ef0eAda5FCbaA7e",
            value: "10",
          },
          recipient: TREASURY_ADRESS,
          referralFee: 0,
          followerOnly: false,
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

      const pubId = await publicClient.readContract({
        address: LENS_HUB_ADRESS,
        abi: LensHubAbi,
        functionName: "getPubCount",
        args: [profile.id],
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

      const pubId = await publicClient.readContract({
        address: LENS_HUB_ADRESS,
        abi: LensHubAbi,
        functionName: "getPubCount",
        args: [profile.id],
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

  return {
    setPostDescription,
    setCoverImageValue,
    handlePost,
    postLoading,
    claimMilestone,
    claimBonus,
  };
};

export default useLens;
