import { FormEvent } from "react";

export interface CreateProfileData {
  to: `0x${string}`;
  handle: string;
  imageURI: string;
  followModule: string;
  followModuleInitData: string;
  followNFTURI: string;
}

export enum ProtocolState {
  Unpaused,
  PublishingPaused,
  Paused,
}

export type HeaderProps = {
  signIn: () => Promise<void>;
  openConnectModal: (() => void) | undefined;
  profile: any;
};

export type GrantProps = {
  postDescription: {
    title: string;
    description: string;
    milestoneOne: string[];
    milestoneTwo: string[];
    milestoneThree: string[];
    challenge: string;
    teamInfo: string;
    claimBy: number[];
    claimFrom: number[];
    amounts: string[]
    value: string;
  };
  collected: boolean;
  reacted: boolean;
  setPostDescription: (e: {
    title: string;
    description: string;
    milestoneOne: string[];
    milestoneTwo: string[];
    milestoneThree: string[];
    challenge: string;
    teamInfo: string;
    claimBy: number[];
    claimFrom: number[];
    amounts: string[]
    value: string;
  }) => void;
  setCoverImageValue: (e: FormEvent<Element>) => void;
  coverImageValue: FormEvent<Element> | undefined;
  publication: any;
};

export type BonusProps = {
  claimBonus: () => Promise<void>;
  collected: boolean;
  filledBars: number;
  setFilledBars: (e: number) => void;
};

export type MilestoneProps = {
  handlePost: () => Promise<void>;
  handleCollect: () => Promise<void>;
  postLoading: boolean;
  reacted: boolean;
  claimMilestone: () => Promise<void>;
  currentMilestone: number;
  postDescription: {
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
    amounts: string[]
  };
  setPostDescription: (e: {
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
    amounts: string[]
  }) => void;
  publication: any;
  collected: boolean;
  filledBars: number;
  setFilledBars: (e: number) => void;
  claimLoading: boolean[];
  handleMirrorLike: () => Promise<void>;
};
