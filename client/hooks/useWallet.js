"use client";

import useWalletStore from "@/stores/useWalletStore";
import { invoke } from "@tauri-apps/api/core";
import useUtils from "./useUtils";
import { ethers } from "ethers";
import BubbleWalletContract from "@/lib/contracts/BubbleWallet";
import { getNetworkByChainId } from "@/lib/networks";
import axios from "axios";
import { useRouter } from "next/navigation";

export default function useWallet() {
  const {
    setIsWalletExists,
    setIsInitializing,
    setWalletName,
    setUserAddress,
    setLlmAddress,
    setWalletAddress,
    walletAddress,
    userAddress,
    llmAddress,
  } = useWalletStore();

  const router = useRouter();

  const { predictWalletAddress, combineSignaturePayload } = useUtils();

  const checkWallet = async () => {
    setIsInitializing(true);
    try {
      const checkResponse = await invoke("is_wallet_exists", {});

      console.log(checkResponse);

      setIsWalletExists(checkResponse);

      if (checkResponse) {
        const walletName = await getWalletName();

        console.log(walletName);

        setWalletName(walletName);
      }
    } catch (err) {
      setIsWalletExists(false);
    } finally {
      setIsInitializing(false);
    }
  };

  const createWallet = async (pin, name) => {
    const initResult = await invoke("init_wallet", {
      pin: pin,
      name: name,
      newWallet: true, // optional, defaults to true
    });

    console.log(initResult);

    setUserAddress(initResult.user_address.address);
    setLlmAddress(initResult.llm_address.address);

    const walletAddress = (
      await predictWalletAddress(
        initResult.user_address.address,
        initResult.llm_address.address
      )
    ).predictedAddress;

    setWalletAddress(walletAddress);

    console.log("User Address", initResult.user_address.address);
    console.log("LLM Address", initResult.llm_address.address);
    console.log("Wallet Address", walletAddress);

    router.push("/dashboard");
  };

  const getWallet = async (pin, name) => {
    const initResponse = await invoke("init_wallet", {
      pin: pin,
      name: name,
      newWallet: false,
    });

    setUserAddress(initResponse.user_address.address);
    setLlmAddress(initResponse.llm_address.address);

    const walletAddress = (
      await predictWalletAddress(
        initResponse.user_address.address,
        initResponse.llm_address.address
      )
    ).predictedAddress;

    setWalletAddress(walletAddress);

    console.log("User Address", initResponse.user_address.address);
    console.log("LLM Address", initResponse.llm_address.address);
    console.log("Wallet Address", walletAddress);
  };

  const getWalletName = async () => {
    const nameResponse = await invoke("get_wallet_name", {});

    return nameResponse.name;
  };

  const signUserTransaction = async (chainId, to, value, data, pin) => {
    const selectedNetwork = getNetworkByChainId(chainId);

    const provider = new ethers.providers.JsonRpcProvider(
      selectedNetwork.rpcUrls[0]
    );

    const walletContract = new ethers.Contract(
      walletAddress,
      BubbleWalletContract.abi,
      provider
    );

    let nonce;

    try {
      nonce = Number(await walletContract.nonce());
    } catch (err) {
      nonce = 0;
    }
    console.log(`Current nonce: ${nonce.toString()}`);

    const domain = {
      name: "TwoOfTwoMultiSigWallet",
      version: "1",
      chainId: chainId,
      verifyingContract: walletContract.address,
    };

    const types = {
      Transaction: [
        { name: "to", type: "address" },
        { name: "value", type: "uint256" },
        { name: "data", type: "bytes32" },
        { name: "nonce", type: "uint256" },
      ],
    };

    const transactionValue = {
      to: to,
      value: Number(value),
      data: ethers.utils.keccak256(data),
      nonce: nonce,
    };

    const signTypedDataResponse = await invoke("sign_typed_message", {
      pin,
      domain,
      types,
      primaryType: "Transaction",
      message: transactionValue,
    });

    console.log(
      signTypedDataResponse.signature,
      signTypedDataResponse.transaction_id
    );

    return {
      signature: signTypedDataResponse.signature,
      transaction_id: signTypedDataResponse.transaction_id,
    };
  };

  const signLlmTransaction = async (
    transactionId,
    chainId,
    to,
    value,
    data,
    pin,
    userPrompt
  ) => {
    const selectedNetwork = getNetworkByChainId(chainId);

    const provider = new ethers.providers.JsonRpcProvider(
      selectedNetwork.rpcUrls[0]
    );

    const walletContract = new ethers.Contract(
      walletAddress,
      BubbleWalletContract.abi,
      provider
    );

    let nonce;

    try {
      nonce = Number(await walletContract.nonce());
    } catch (err) {
      nonce = 0;
    }
    console.log(`Current nonce: ${nonce.toString()}`);

    const domain = {
      name: "TwoOfTwoMultiSigWallet",
      version: "1",
      chainId: chainId,
      verifyingContract: walletContract.address,
    };

    const types = {
      Transaction: [
        { name: "to", type: "address" },
        { name: "value", type: "uint256" },
        { name: "data", type: "bytes32" },
        { name: "nonce", type: "uint256" },
      ],
    };

    const transactionValue = {
      to: to,
      value: Number(value),
      data: ethers.utils.keccak256(data),
      nonce: nonce,
    };

    const signTypedDataResponse = await invoke("llm_sign_typed_message", {
      pin,
      transactionId,
      domain,
      types,
      primaryType: "Transaction",
      message: transactionValue,
      userPrompt,
    });

    return {
      signature: signTypedDataResponse.signature,
      transaction_id: signTypedDataResponse.transaction_id,
      confidence_score: signTypedDataResponse.confidence_score,
      decision: signTypedDataResponse.decision,
      reasoning: signTypedDataResponse.reasoning,
      security_score: signTypedDataResponse.security_score,
    };
  };

  const executeTransaction = async (
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
    securityScore
  ) => {
    console.log({
      userAddress,
      llmAddress,
      walletAddress,
      chainId,
      to,
      value,
      data,
      transactionId,
      signature1: combineSignaturePayload(
        signature1.v,
        signature1.r,
        signature1.s
      ),
      signature2: combineSignaturePayload(
        signature2.v,
        signature2.r,
        signature2.s
      ),
      confidenceScore,
      decision,
      reasoning,
      securityScore,
    });

    const executeResponse = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/execute`,
      {
        userAddress,
        llmAddress,
        walletAddress,
        chainId,
        to,
        value,
        data,
        transactionId,
        signature1: combineSignaturePayload(
          signature1.v,
          signature1.r,
          signature1.s
        ),
        signature2: combineSignaturePayload(
          signature2.v,
          signature2.r,
          signature2.s
        ),
        confidenceScore,
        decision,
        reasoning,
        securityScore,
      }
    );

    console.log(executeResponse.data);
  };

  const indexTransaction = async (
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
    securityScore
  ) => {
    console.log({
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
    });

    const indexResponse = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/execute/index`,
      {
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
      }
    );

    console.log(indexResponse.data);
  };

  const testTransaction = async () => {
    const chainId = 84532;
    const to = "0x0000000000000000000000000000000000000000";
    const value = "0";
    const data = "0x";
    const transactionId = "test";

    const userWallet = ethers.Wallet.createRandom();
    const llmWallet = ethers.Wallet.createRandom();

    const { predictedAddress: walletAddress } = await predictWalletAddress(
      userWallet.address,
      llmWallet.address
    );

    console.log(
      "User Wallet",
      userWallet.address,
      "LLM Wallet",
      llmWallet.address,
      "Wallet Address",
      walletAddress
    );

    const domain = {
      name: "TwoOfTwoMultiSigWallet",
      version: "1",
      chainId: chainId,
      verifyingContract: walletAddress,
    };

    const types = {
      Transaction: [
        { name: "to", type: "address" },
        { name: "value", type: "uint256" },
        { name: "data", type: "bytes32" },
        { name: "nonce", type: "uint256" },
      ],
    };

    const transactionValue = {
      to: to,
      value: Number(value),
      data: ethers.utils.keccak256(data),
      nonce: 0,
    };

    const signature1 = await userWallet._signTypedData(
      domain,
      types,
      transactionValue
    );
    const signature2 = await llmWallet._signTypedData(
      domain,
      types,
      transactionValue
    );

    console.log("Signature 1", signature1);
    console.log("Signature 2", signature2);

    const executeResponse = await axios.post(
      `${process.env.NEXT_PUBLIC_API_URL}/execute`,
      {
        userAddress: userWallet.address,
        llmAddress: llmWallet.address,
        walletAddress,
        chainId,
        to,
        value,
        data,
        transactionId,
        signature1,
        signature2,
      }
    );

    console.log(executeResponse.data);
  };

  return {
    createWallet,
    checkWallet,
    getWallet,
    getWalletName,
    signUserTransaction,
    signLlmTransaction,
    executeTransaction,
    testTransaction,
    indexTransaction,
  };
}
