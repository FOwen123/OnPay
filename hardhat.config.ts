import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.28",
    settings: {
      optimizer: {
        enabled: true,
        runs: 100,
      },
    },
  },
  networks: {
    sepolia:{
      url: process.env.SEPOLIA_RPC_URL || "",
      chainId: 11155111,
      accounts: [process.env.PRIVATE_KEY!],
    },
    liskSepolia: {
      url: "https://rpc.sepolia-api.lisk.com",
      chainId: 4202,
      accounts: [process.env.PRIVATE_KEY!],
    }
  },
  etherscan: {
    customChains: [
      {
        network: "liskSepolia",
        chainId: 4202,
        urls: {
          apiURL: "https://sepolia-blockscout.lisk.com/api",
          browserURL: "https://sepolia-blockscout.lisk.com",
        },
      },
    ],
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY || "",
      liskSepolia: "dummy-key", 
    },
  }
};

export default config;
