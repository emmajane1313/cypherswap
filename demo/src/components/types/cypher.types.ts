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
