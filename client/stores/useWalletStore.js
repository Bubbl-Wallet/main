import { create } from "zustand";

const useWalletStore = create((set) => ({
  isWalletExists: false,
  isInitializing: true,
  walletName: "",
  userAddress: "",
  llmAddress: "",
  walletAddress: "",

  setIsWalletExists: (exists) => set((state) => ({ isWalletExists: exists })),

  setIsInitializing: (isLoading) =>
    set((state) => ({
      isInitializing: isLoading,
    })),

  setWalletName: (name) =>
    set((state) => ({
      walletName: name,
    })),

  setUserAddress: (userAddress) =>
    set((state) => ({
      userAddress,
    })),

  setLlmAddress: (llmAddress) =>
    set((state) => ({
      llmAddress,
    })),

  setWalletAddress: (walletAddress) =>
    set((state) => ({
      walletAddress,
    })),
}));

export default useWalletStore;
