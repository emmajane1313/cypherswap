import { HardhatUserConfig } from "hardhat/config";
import "@nomiclabs/hardhat-etherscan";
require("dotenv").config({ path: ".env" });

const config: HardhatUserConfig = {
  solidity: {
    compilers: [
      {
        version: "0.8.19",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200 
          }
        }
      },
      {
        version: "0.8.20",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  networks: {
    hardhat: {
      chainId: 31337,
      mining: {
        auto: true,
        interval: 5000,
      },
    },
    mumbai: {
      url: `https://polygon-mumbai.g.alchemy.com/v2/${process.env.ALCHEMY_MUMBAI_KEY}`,
      chainId: 80001,
      accounts: [process.env.PRIVATE_KEY!],
    },
    local: {
      url: "http://localhost:8545"
    },
    
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  mocha: {
    timeout: 180000000, // Timeout value in milliseconds
  },
};

export default config;
