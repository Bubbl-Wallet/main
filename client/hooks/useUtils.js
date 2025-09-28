"use client";

import { ethers } from "ethers";
import ProxyContract from "@/lib/contracts/Proxy.js";
import addressLibrary from "@/lib/addressLibrary";
const PROXY_ABI = ProxyContract.abi;
const PROXY_BYTECODE = ProxyContract.bytecode;

export default function useUtils() {
  const predictWalletAddress = async (userAddress, llmAddress) => {
    const proxyFactoryAddress = addressLibrary.proxyFactoryAddress;
    const singletonAddress = addressLibrary.singletonAddress;

    const owner1 = userAddress;
    const owner2 = llmAddress;

    const AbiCoder = new ethers.utils.AbiCoder();
    const salt = ethers.utils.keccak256(
      AbiCoder.encode(["address", "address"], [owner1, owner2])
    );

    console.log("Inputs configured:");
    console.log(`- ProxyFactory: ${proxyFactoryAddress}`);
    console.log(`- Singleton (BubbleWallet): ${singletonAddress}`);
    console.log(`- New Owners: ${owner1}, ${owner2}`);
    console.log(`- Chosen Salt: ${salt}\n`);

    const proxyInterface = new ethers.utils.Interface(PROXY_ABI);
    const deploymentData = ethers.utils.solidityPack(
      ["bytes", "bytes"],
      [PROXY_BYTECODE, proxyInterface.encodeDeploy([singletonAddress])]
    );

    const predictedAddress = ethers.utils.getCreate2Address(
      proxyFactoryAddress,
      salt,
      ethers.utils.keccak256(deploymentData)
    );
    console.log(`\n✅ Predicted Wallet Address: ${predictedAddress}\n`);

    const bubbleWalletInterface = new ethers.utils.Interface([
      "function initialize(address _owner1, address _owner2)",
    ]);
    const initializerData = bubbleWalletInterface.encodeFunctionData(
      "initialize",
      [owner1, owner2]
    );
    console.log("Initializer Calldata (for deployment):");
    console.log(initializerData);

    return { predictedAddress, salt, initializerData };
  };

  const combineSignaturePayload = (v, r, s) => {
    const signatureComponents = {
      r: r,
      s: s,
      v: v,
    };

    // Use the joinSignature utility to combine them into a single hex string.
    const concatenatedSignature =
      ethers.utils.joinSignature(signatureComponents);

    console.log("Joined Signature:", concatenatedSignature);
    // Expected output: 0x
    return concatenatedSignature;
  };

  return { predictWalletAddress, combineSignaturePayload };
}
