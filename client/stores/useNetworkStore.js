import { create } from "zustand";
import { persist } from "zustand/middleware";

import {
  getNetworkById,
  NETWORK_STATUS,
  getMainnetNetworks,
  getAvailableNetworks,
  getTestnetNetworks,
} from "@/lib/networks";

// Utils
const MAX_RECENT = 5;
const DEFAULT_NETWORK = getTestnetNetworks()[0];

export const useNetworkStore = create(
  persist(
    (set, get) => ({
      // Core state
      currentNetwork: DEFAULT_NETWORK,
      networkSwitching: null,
      connectionError: null,

      // Lists
      recentNetworks: [],
      availableNetworks: getAvailableNetworks(),

      // Settings
      networkSettings: {
        showTestnets: false,
      },

      switchNetwork: async (networkId) => {
        const { currentNetwork } = get();
        const target = getNetworkById(networkId);

        if (!target) {
          set({ connectionError: `Network ${networkId} not found` });
          throw new Error("Network not found");
        }

        if (target.status === NETWORK_STATUS.UNAVAILABLE) {
          set({ connectionError: `${target.name} is unavailable` });
          throw new Error("Unavailable");
        }

        // If already active, do nothing (no fake loading)
        if (networkId === currentNetwork?.id) return;

        try {
          set({ networkSwitching: networkId, connectionError: null });

          // Simulate async switching delay
          await new Promise((res) => setTimeout(res, 200));

          set((state) => {
            const newRecents = [
              {
                ...target,
                lastConnected: Date.now(),
              },
              ...state.recentNetworks.filter((n) => n.id !== target.id),
            ].slice(0, MAX_RECENT);

            return {
              currentNetwork: target,
              networkSwitching: null,
              recentNetworks: newRecents,
            };
          });
        } catch (err) {
          set({
            connectionError: err.message || "Failed to switch network",
            networkSwitching: null,
          });
          throw err;
        }
      },

      clearConnectionError: () => set({ connectionError: null }),

      updateNetworkSettings: (updates) =>
        set((state) => ({
          networkSettings: { ...state.networkSettings, ...updates },
        })),
    }),
    {
      name: "network-store", // persisted key
      partialize: (state) => ({
        currentNetwork: state.currentNetwork,
        recentNetworks: state.recentNetworks,
        networkSettings: state.networkSettings,
      }),
    }
  )
);

// ---- Selectors for convenience ----
export const useCurrentNetwork = () =>
  useNetworkStore((state) => state.currentNetwork) || DEFAULT_NETWORK;

export const useNetworkSwitching = () =>
  useNetworkStore((state) => state.networkSwitching);

export const useAvailableNetworks = () =>
  useNetworkStore((state) => state.availableNetworks);

export const useRecentNetworks = () =>
  useNetworkStore((state) => state.recentNetworks);

export const useConnectionError = () =>
  useNetworkStore((state) => state.connectionError);

export const useNetworkSettings = () =>
  useNetworkStore((state) => state.networkSettings);
