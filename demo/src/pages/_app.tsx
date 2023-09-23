import "@/styles/globals.css";
import type { AppProps } from "next/app";
import { polygonMumbai } from "wagmi/chains";
import { WagmiConfig, createConfig, configureChains } from "wagmi";
import { alchemyProvider } from "wagmi/providers/alchemy";
import { getDefaultWallets, RainbowKitProvider } from "@rainbow-me/rainbowkit";
const { publicClient, webSocketPublicClient, chains } = configureChains(
  [polygonMumbai],
  [
    alchemyProvider({
      apiKey: process.env.NEXT_PUBLIC_ALCHEMY_MUMBAI_KEY!,
    }),
  ]
);

const { connectors } = getDefaultWallets({
  appName: "CypherSwap",
  chains,
  projectId: process.env.NEXT_PUBLIC_WALLET_CONNECT_PROJECT_ID as string,
});

const config = createConfig({
  autoConnect: true,
  publicClient,
  webSocketPublicClient,
  connectors,
});
export default function App({ Component, pageProps }: AppProps) {
  return (
    <WagmiConfig config={config}>
      <RainbowKitProvider chains={chains}>
        <Component {...pageProps} />
      </RainbowKitProvider>
    </WagmiConfig>
  );
}
