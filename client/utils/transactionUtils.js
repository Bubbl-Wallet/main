/**
 * Transform raw API transaction data to UI-compatible format
 */
export const transformTransactionData = (
  apiTransaction,
  keyData,
  walletAddress
) => {
  const txData = apiTransaction;

  // Determine transaction type (sent/received) based on wallet address
  const isSent =
    txData.from?.toLowerCase() === walletAddress?.toLowerCase() || !txData.from; // If no 'from' field, assume it's a sent transaction

  // Convert hex value to readable amount
  const amount = convertHexToAmount(txData.value?.hex);

  // Determine status based on AI decision
  const status = determineTransactionStatus(txData.decision);

  // Get network info from chainId
  const network = getNetworkFromChainId(txData.chainId);

  return {
    id: txData.id,
    hash: txData.hash || `0x${txData.id}`, // Use provided hash or generate from ID
    from: txData.from || walletAddress, // Default to wallet address if not provided
    to: txData.to,
    amount: amount.toString(),
    symbol: getSymbolFromChainId(txData.chainId),
    status: status,
    type: isSent ? "sent" : "received",
    timestamp: new Date(keyData.LastModified),
    blockNumber: txData.blockNumber || null,
    gasUsed: txData.gasUsed || null,
    gasPrice: txData.gasPrice || null,
    network: network,
    contactName: null, // Will be filled by contact lookup
    note: txData.note || txData.reasoning || null,
    confirmations: status === "executed" ? 12 : 0,
    feeUsd: txData.feeUsd || "$0.00",
    nonce: txData.nonce || null,
    aiAnalysis: {
      decision: txData.decision ? "approved" : "rejected",
      confidence: txData.confidenceScore || 0,
      securityScore: txData.securityScore || 0,
      analyzedAt: new Date(keyData.LastModified),
      reasons: txData.decision
        ? []
        : [txData.reasoning || "Transaction rejected by AI"],
    },
    signatures: generateSignatures(txData, walletAddress, keyData.LastModified),
  };
};

/**
 * Convert hex value to decimal amount
 */
export const convertHexToAmount = (hexValue) => {
  if (!hexValue) return "0";

  try {
    // Remove '0x' prefix if present
    const cleanHex = hexValue.replace("0x", "");

    // Convert to decimal
    const decimalValue = parseInt(cleanHex, 16);

    // Convert from Wei to Ether (assuming 18 decimals)
    return decimalValue / Math.pow(10, 18);
  } catch (error) {
    console.error("Error converting hex value:", error);
    return "0";
  }
};

/**
 * Determine transaction status from API data
 */
export const determineTransactionStatus = (decision) => {
  if (decision === true) return "executed";
  if (decision === false) return "ai_rejected";

  // For null/undefined decision, assume pending
  return "pending_ai_analysis";
};

/**
 * Get network name from chain ID
 */
export const getNetworkFromChainId = (chainId) => {
  const networkMap = {
    545: "flowTestnet",
    31: "rootstockTestnet",
    84532: "baseSepolia",
  };

  return networkMap[chainId] || "unknown";
};

/**
 * Get token symbol from chain ID
 */
export const getSymbolFromChainId = (chainId) => {
  const symbolMap = {
    545: "FLOW",
    31: "tRBTC",
    84532: "ETH",
  };

  return symbolMap[chainId] || "UNKNOWN";
};

/**
 * Generate signature objects for transaction
 */
export const generateSignatures = (txData, walletAddress, timestamp) => {
  const baseTimestamp = new Date(timestamp);

  return [
    {
      signer: "You",
      address: walletAddress,
      signed: true, // User always signs first
      signedAt: new Date(baseTimestamp.getTime() - 1000), // 1 second before
      type: "user",
    },
    {
      signer: "AI Agent",
      address: "0xAI123456789abcdef1234567890abcdefAI789012",
      signed: txData.decision === true,
      signedAt: txData.decision === true ? baseTimestamp : null,
      type: "ai",
    },
  ];
};

/**
 * Extract transaction ID from S3 key
 */
export const extractTransactionId = (key) => {
  return key.replace(".json", "");
};

/**
 * Format address for display
 */
export const formatAddress = (address) => {
  if (!address) return "";
  return `${address.slice(0, 6)}...${address.slice(-4)}`;
};

/**
 * Format time ago from timestamp
 */
export const formatTimeAgo = (timestamp) => {
  const now = new Date();
  const diff = now.getTime() - new Date(timestamp).getTime();
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  return `${days}d ago`;
};
