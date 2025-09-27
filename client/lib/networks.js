export const NETWORK_STATUS = {
  CONNECTED: "connected",
  AVAILABLE: "available",
  UNAVAILABLE: "unavailable",
};

export const networks = {
  flowTestnet: {
    id: "flowTestnet",
    chainId: 545,
    name: "Flow EVM Testnet",
    shortName: "FLOW",
    nativeCurrency: {
      name: "Flow",
      symbol: "FLOW",
      decimals: 18,
    },
    rpcUrls: ["https://testnet.evm.nodes.onflow.org"],
    blockExplorerUrls: ["https://evm-testnet.flowscan.org"],
    status: NETWORK_STATUS.AVAILABLE,
    isTestnet: true,
    iconUrl: "/chains/flow-logo.svg",
    convertId: 4558,
  },

  rootstockTestnet: {
    id: "rootstockTestnet",
    chainId: 31,
    name: "Rootstock Testnet",
    shortName: "tRSK",
    nativeCurrency: {
      name: "Test Smart Bitcoin",
      symbol: "tRBTC",
      decimals: 18,
    },
    rpcUrls: ["https://mycrypto.testnet.rsk.co"],
    blockExplorerUrls: ["https://explorer.testnet.rootstock.io"],
    status: NETWORK_STATUS.AVAILABLE,
    isTestnet: true,
    iconUrl: "/chains/rootstock-logo.svg",
    convertId: 3626,
  },

  baseSepolia: {
    id: "baseSepolia",
    chainId: 84532,
    name: "Base Sepolia",
    shortName: "BASE",
    nativeCurrency: {
      name: "ETH",
      symbol: "ETH",
      decimals: 18,
    },
    rpcUrls: ["https://base-sepolia-rpc.publicnode.com"],
    blockExplorerUrls: ["https://sepolia.basescan.org/"],
    status: NETWORK_STATUS.AVAILABLE,
    isTestnet: true,
    iconUrl: "/chains/base-logo.svg",
    convertId: 1027,
  },
};

// Helper functions
export const getNetworkById = (id) => networks[id];

export const getNetworkByChainId = (chainId) => {
  return Object.values(networks).find((network) => network.chainId === chainId);
};

export const getMainnetNetworks = () => {
  return Object.values(networks).filter((network) => !network.isTestnet);
};

export const getTestnetNetworks = () => {
  return Object.values(networks).filter((network) => network.isTestnet);
};

export const getAvailableNetworks = () => {
  return Object.values(networks).filter(
    (network) =>
      network.status === NETWORK_STATUS.AVAILABLE ||
      network.status === NETWORK_STATUS.CONNECTED
  );
};

export default networks;
