import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { hardhat } from "wagmi/chains";
import { WagmiConfig, createConfig, configureChains } from "wagmi";
import { publicProvider } from "wagmi/providers/public";

export default function App({ Component, pageProps }: AppProps) {
  const { publicClient, webSocketPublicClient, chains } = configureChains(
    [hardhat],
    [publicProvider()]
  );
  const config = createConfig({
    publicClient,
    webSocketPublicClient,
  });

  return (
    <WagmiConfig config={config}>
      <Component {...pageProps} />
    </WagmiConfig>
  );
}
