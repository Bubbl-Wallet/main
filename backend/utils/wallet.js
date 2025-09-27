import { ethers } from "ethers";
import ProxyContract from "../lib/contracts/Proxy.js";
import addressLibrary from "../lib/addressLibrary.js";

const PROXY_ABI = ProxyContract.abi;
const PROXY_BYTECODE = ProxyContract.bytecode;

export const predictWalletAddress = async (userAddress, llmAddress) => {
  const proxyFactoryAddress = addressLibrary.proxyFactoryAddress;
  const singletonAddress = addressLibrary.singletonAddress;

  const owner1 = userAddress;
  const owner2 = llmAddress;

  const AbiCoder = new ethers.utils.AbiCoder();
  const salt = ethers.utils.keccak256(
    AbiCoder.encode(["address", "address"], [owner1, owner2])
  );

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

  const bubbleWalletInterface = new ethers.utils.Interface([
    "function initialize(address _owner1, address _owner2)",
  ]);
  const initializerData = bubbleWalletInterface.encodeFunctionData(
    "initialize",
    [owner1, owner2]
  );

  return { predictedAddress, salt, initializerData };
};
