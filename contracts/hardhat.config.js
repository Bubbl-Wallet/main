require("@nomicfoundation/hardhat-toolbox");
require("dotenv").config();

const PRIVATE_KEY = process.env.PRIVATE_KEY;

/** @type import('hardhat/config').HardhatUserConfig */
module.exports = {
  solidity: {
    version: "0.8.24",
    settings: {
      optimizer: {
        enabled: true,
        runs: 800,
        details: {
          yulDetails: {
            optimizerSteps: "u",
          },
        },
      },
      evmVersion: "paris",
      viaIR: true,
    },
  },
  networks: {
    baseSepolia: {
      url: `https://sepolia.base.org`,
      accounts: [PRIVATE_KEY],
    },
    rootstockTestnet: {
      url: "https://mycrypto.testnet.rsk.co",
      gasPrice: 60000000,
      accounts: [PRIVATE_KEY],
    },
    flowTestnet: {
      url: "https://testnet.evm.nodes.onflow.org",
      accounts: [PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: {
      baseSepolia: "CPCJJ5KA7CEXQAW6MMEGDWGH7E3CSH1IC5",
      flowTestnet: "your API key",
      rootstockTestnet: "your API key",
    },
    customChains: [
      {
        network: "baseSepolia",
        chainId: 84532,
        urls: {
          apiURL: "https://api-sepolia.basescan.org/api",
          browserURL: "https://sepolia.basescan.org/",
        },
      },
      {
        network: "flowTestnet",
        chainId: 545,
        urls: {
          apiURL: "https://evm-testnet.flowscan.io/api",
          browserURL: "https://evm-testnet.flowscan.io/",
        },
      },
      {
        network: "rootstockTestnet",
        chainId: 31,
        urls: {
          apiURL: "https://rootstock-testnet.blockscout.com/api",
          browserURL: "https://rootstock-testnet.blockscout.com/",
        },
      },
    ],
  },
};
