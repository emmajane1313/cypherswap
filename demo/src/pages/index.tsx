import { ethers } from "ethers";

export const CHRONICLE_PROVIDER = "https://chain-rpc.litprotocol.com/http";

export default function Home() {
  const chronicleProvider = new ethers.providers.JsonRpcProvider(
    CHRONICLE_PROVIDER,
    175177
  );
  return <div></div>;
}
