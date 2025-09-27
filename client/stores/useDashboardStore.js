import { create } from "zustand";

const useDashboardStore = create((set) => ({
  isInitializing: true,
  balance: "",
  conversionRate: "",

  setIsInitializing: (isLoading) =>
    set((state) => ({
      isInitializing: isLoading,
    })),

  setBalance: (balance) =>
    set((state) => ({
      balance,
    })),

  setConversionRate: (conversionRate) =>
    set((state) => ({
      conversionRate,
    })),
}));

export default useDashboardStore;
