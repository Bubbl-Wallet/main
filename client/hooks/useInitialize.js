"use client";

import useDashboardStore from "@/stores/useDashboardStore";
import { useCurrentNetwork } from "@/stores/useNetworkStore";
import useWalletStore from "@/stores/useWalletStore";
import axios from "axios";
import { ethers } from "ethers";
import { useRouter } from "next/navigation";

export default function useInitialize() {
  const currentNetwork = useCurrentNetwork();
  const { walletAddress } = useWalletStore();
  const { setIsInitializing, setBalance, setConversionRate } =
    useDashboardStore();
  const router = useRouter();

  const initialize = async () => {
    try {
      setIsInitializing(true);
      setConversionRate(0);
      setBalance(0);

      if (!walletAddress) {
        router.push("/");
        return;
      }

      const provider = new ethers.providers.JsonRpcProvider(
        currentNetwork.rpcUrls[0]
      );

      const balance = await provider.getBalance(walletAddress);

      setBalance(ethers.utils.formatEther(balance));

      console.log("Balance", ethers.utils.formatEther(balance));

      const conversionRate = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/conversion?convert_id=${2781}&id=${
          currentNetwork?.convertId
        }`
      );

      console.log("Conversion", conversionRate.data);

      console.log("Conversion Rate", conversionRate.data.data.quote[0].price);

      setConversionRate(conversionRate.data.data.quote[0].price);
    } catch (err) {
      console.log(err);
    } finally {
      setIsInitializing(false);
    }
  };

  return {
    initialize,
  };
}
