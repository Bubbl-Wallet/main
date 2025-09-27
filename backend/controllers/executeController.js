import { getNetworkByChainId } from "../lib/networks.js";
import { predictWalletAddress } from "../utils/wallet.js";
import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();
import ProxyFactory from "../lib/contracts/ProxyFactory.js";
import addressLibrary from "../lib/addressLibrary.js";
import BubbleWalletContract from "../lib/contracts/BubbleWallet.js";
import OpenBatchExecutor from "../lib/contracts/OpenBatchExecutor.js";
import { addTransaction } from "../utils/storage.js";

const executeTransaction = async (req, res) => {
  try {
    const {
      userAddress,
      llmAddress,
      walletAddress,
      chainId,
      to,
      value,
      data,
      transactionId,
      signature1,
      signature2,
      confidenceScore,
      decision,
      reasoning,
      securityScore,
    } = req.body;

    if (!decision) {
      return res.status(400).json({ error: "Invalid decision" });
    }

    const { predictedAddress, salt, initializerData } =
      await predictWalletAddress(userAddress, llmAddress);

    if (predictedAddress !== walletAddress) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }

    const network = getNetworkByChainId(Number(chainId));

    if (!network) {
      return res.status(400).json({ error: "Invalid chain ID" });
    }

    const privateKey = process.env.PRIVATE_KEY;

    const provider = new ethers.providers.JsonRpcProvider(network.rpcUrls[0]);

    const isContractDeployed = await provider.getCode(walletAddress);

    const wallet = new ethers.Wallet(privateKey, provider);

    if (isContractDeployed === "0x") {
      const proxyFactory = new ethers.Contract(
        addressLibrary.proxyFactoryAddress,
        ProxyFactory.abi,
        wallet
      );

      const deployTx = proxyFactory.interface.encodeFunctionData(
        "deployProxy",
        [addressLibrary.singletonAddress, initializerData, salt]
      );

      const walletContract = new ethers.Contract(
        walletAddress,
        BubbleWalletContract.abi,
        wallet
      );

      const executeTx = walletContract.interface.encodeFunctionData(
        "executeTransaction",
        [to, value, data, signature1, signature2]
      );

      const transactions = [
        {
          to: addressLibrary.proxyFactoryAddress,
          value: 0,
          data: deployTx,
        },
        {
          to: walletAddress,
          value: 0,
          data: executeTx,
        },
      ];

      const OpenBatchExecutorContract = new ethers.Contract(
        addressLibrary.OpenBatchExecutorAddress,
        OpenBatchExecutor.abi,
        wallet
      );

      const executeBatchTx =
        OpenBatchExecutorContract.interface.encodeFunctionData("executeBatch", [
          transactions,
        ]);

      const executeBatchTxResponse = await wallet.sendTransaction({
        to: addressLibrary.OpenBatchExecutorAddress,
        data: executeBatchTx,
        gasLimit: 1000000,
      });

      await executeBatchTxResponse.wait();

      return res
        .status(200)
        .json({ message: "Transaction executed successfully" });
    } else {
      const walletContract = new ethers.Contract(
        walletAddress,
        BubbleWalletContract.abi,
        wallet
      );

      const executeTx = walletContract.interface.encodeFunctionData(
        "executeTransaction",
        [to, value, data, signature1, signature2]
      );

      const transactions = [
        {
          to: walletAddress,
          value: 0,
          data: executeTx,
        },
      ];

      const OpenBatchExecutorContract = new ethers.Contract(
        addressLibrary.OpenBatchExecutorAddress,
        OpenBatchExecutor.abi,
        wallet
      );

      const executeBatchTx =
        OpenBatchExecutorContract.interface.encodeFunctionData("executeBatch", [
          transactions,
        ]);

      const executeBatchTxResponse = await wallet.sendTransaction({
        to: addressLibrary.OpenBatchExecutorAddress,
        data: executeBatchTx,
        gasLimit: 1000000,
      });

      const receipt = await executeBatchTxResponse.wait();

      const transaction = {
        to,
        value,
        data,
        txHash: receipt.transactionHash,
        chainId,
        id: transactionId,
        confidenceScore,
        decision,
        reasoning,
        securityScore,
      };

      await addTransaction(walletAddress, transaction);

      return res
        .status(200)
        .json({ message: "Transaction executed successfully" });
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

const indexTransactions = async (req, res) => {
  try {
    const {
      userAddress,
      llmAddress,
      walletAddress,
      chainId,
      to,
      value,
      data,
      transactionId,
      confidenceScore,
      decision,
      reasoning,
      securityScore,
    } = req.body;
    const { predictedAddress, salt, initializerData } =
      await predictWalletAddress(userAddress, llmAddress);

    if (predictedAddress !== walletAddress) {
      return res.status(400).json({ error: "Invalid wallet address" });
    }

    const network = getNetworkByChainId(Number(chainId));

    if (!network) {
      return res.status(400).json({ error: "Invalid chain ID" });
    }

    if (decision) {
      return res
        .status(400)
        .json({ message: "Successful transaction does not require indexing" });
    }

    const transaction = {
      to,
      value,
      data,
      chainId,
      id: transactionId,
      confidenceScore,
      decision,
      reasoning,
      securityScore,
    };

    await addTransaction(walletAddress, transaction);

    return res
      .status(200)
      .json({ message: "Transaction indexed successfully" });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: error.message });
  }
};

export { executeTransaction, indexTransactions };
