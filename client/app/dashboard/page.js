"use client";

import {
  Eye,
  Send,
  Copy,
  Check,
  Wallet,
  QrCode,
  EyeOff,
  Loader2,
  Settings,
  TrendingUp,
  AlertCircle,
  ArrowDownLeft,
  Users2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import React, { useCallback, useState } from "react";

import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import {
  useNetworkStore,
  useCurrentNetwork,
  useConnectionError,
  useNetworkSwitching,
  useAvailableNetworks,
} from "@/stores/useNetworkStore";
import useWalletStore from "@/stores/useWalletStore";
import useDashboardStore from "@/stores/useDashboardStore";
import { Button } from "@/components/ui/button";

const WalletDashboard = () => {
  const router = useRouter();

  const [balanceHidden, setBalanceHidden] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);
  const { balance, conversionRate, isInitializing } = useDashboardStore();

  // Real store hooks
  const currentNetwork = useCurrentNetwork();
  const connectionError = useConnectionError();
  const networkSwitching = useNetworkSwitching();
  const availableNetworks = useAvailableNetworks();
  const { switchNetwork, clearConnectionError } = useNetworkStore();

  // Wallet store
  const { walletAddress, userAddress } = useWalletStore();

  // Use wallet address from store or fallback
  const displayAddress =
    walletAddress ||
    userAddress ||
    "0x742d35Cc6634C0532925a3b8D2C00B2496ed8F3A";

  // Only native token
  const nativeAsset = {
    symbol: currentNetwork?.nativeCurrency?.symbol || "ETH",
    name: currentNetwork?.nativeCurrency?.name || "Ethereum",
    balance: "147.523456",
    value: "$147.52",
    change: "+2.4%",
    isNative: true,
  };

  const navigateTo = (path) => {
    router.push(path);
  };

  const handleNetworkSwitch = async (networkId) => {
    if (networkSwitching) return;

    try {
      await switchNetwork(networkId);
    } catch (error) {
      console.error("Network switch failed:", error);
    }
  };

  const getNetworkStatusColor = (status) => {
    switch (status) {
      case "connected":
        return "bg-emerald-500";
      case "available":
        return "bg-amber-500";
      default:
        return "bg-slate-400";
    }
  };

  const copyAddress = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(displayAddress);
      setAddressCopied(true);
      setTimeout(() => setAddressCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");
      textArea.value = displayAddress;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);
      setAddressCopied(true);
      setTimeout(() => setAddressCopied(false), 2000);
    }
  }, [displayAddress]);

  if (!currentNetwork) {
    return (
      <div className="min-h-screen max-w-lg mx-auto flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen max-w-lg mx-auto">
      <header className="sticky top-0 z-50">
        <div className="mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-primary hover:text-white rounded-xl flex items-center justify-center">
                <Wallet className="w-6 h-6 text-white" />
              </div>

              <div>
                <h1 className="text-lg font-bold text-black">
                  Wallet Dashboard
                </h1>

                <p className="text-xs text-slate-500">Multi-chain wallet</p>
              </div>
            </div>

            <div className="flex items-center space-x-3">
              <button
                onClick={() => navigateTo("/contacts")}
                className="p-2 text-sidebar-foreground hover:bg-primary hover:text-white rounded-lg transition-colors"
              >
                <Users2 className="w-5 h-5" />
              </button>

              <button
                onClick={() => navigateTo("/settings")}
                className="p-2 text-sidebar-foreground hover:bg-primary hover:text-white rounded-lg transition-colors"
              >
                <Settings className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white rounded-xl p-4 mb-6 border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div
                className={`w-3 h-3 rounded-full ${getNetworkStatusColor(
                  currentNetwork.status
                )} ${
                  currentNetwork.status === "connected" ? "animate-pulse" : ""
                }`}
              ></div>

              <span className="text-sm font-medium text-slate-900">
                Connected to {currentNetwork.name}
              </span>

              {networkSwitching && (
                <Loader2 className="w-4 h-4 text-slate-500 animate-spin" />
              )}
            </div>

            <div className="flex items-center space-x-2">
              <Select
                value={currentNetwork.id}
                onValueChange={handleNetworkSwitch}
                disabled={!!networkSwitching}
              >
                <SelectTrigger className="w-auto min-w-[120px]">
                  <SelectValue />
                </SelectTrigger>

                <SelectContent>
                  {availableNetworks.map((network) => (
                    <SelectItem key={network.id} value={network.id}>
                      {network.shortName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {connectionError && (
            <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="w-4 h-4 text-red-600" />
                <span className="text-sm text-red-700">{connectionError}</span>
              </div>

              <button
                onClick={clearConnectionError}
                className="text-sm text-red-600 hover:text-red-800 font-medium"
              >
                Dismiss
              </button>
            </div>
          )}
        </div>

        <div>
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-primary rounded-2xl p-6 text-white shadow-lg">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold">Total Balance</h2>

                <div className="flex items-center space-x-2">
                  <div className="text-xs bg-white/20 px-2 py-1 rounded-full">
                    {currentNetwork.shortName}
                  </div>

                  <button
                    onClick={() => setBalanceHidden(!balanceHidden)}
                    className="p-2 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    {balanceHidden ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              <div className="mb-6">
                <div className="text-3xl font-bold mb-1">
                  {isInitializing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : balanceHidden ? (
                    "••••••"
                  ) : (
                    `$${(Number(balance) * Number(conversionRate)).toFixed(2)}`
                  )}
                </div>

                <div className="text-slate-200 text-sm flex items-center space-x-2">
                  <TrendingUp className="w-4 h-4" />
                  {isInitializing ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>
                      {balance} {currentNetwork.shortName}
                    </span>
                  )}
                </div>
              </div>

              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-3 mb-4">
                <div className="text-xs text-slate-200 mb-1">
                  Wallet Address
                </div>

                <div className="flex items-center justify-between space-x-2">
                  <span className="font-mono text-xs">{displayAddress}</span>

                  <div className="flex">
                    <button
                      onClick={copyAddress}
                      className="text-white hover:bg-white/20 p-1.5 rounded-md transition-colors"
                    >
                      {addressCopied ? (
                        <Check className="w-4 h-4 text-green-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 mb-2">
                <button
                  onClick={() => navigateTo("/send")}
                  className="bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg p-3 text-center transition-colors"
                >
                  <Send className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-xs">Send</div>
                </button>

                <button className="bg-white/20 backdrop-blur-sm hover:bg-white/30 rounded-lg p-3 text-center transition-colors">
                  <ArrowDownLeft className="w-5 h-5 mx-auto mb-1" />
                  <div className="text-xs">Receive</div>
                </button>
              </div>

              <Button
                onClick={() => navigateTo("/transaction")}
                className="bg-white/20 backdrop-blur-sm w-full hover:bg-white/30 rounded-lg p-3 text-center transition-colors"
              >
                <div className="text-xs">Transaction History</div>
              </Button>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Your Holdings</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Native token balance
                </p>
              </CardHeader>

              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-full bg-muted flex items-center justify-center">
                      <span className="text-lg font-semibold text-muted-foreground">
                        {nativeAsset.symbol.charAt(0)}
                      </span>
                    </div>

                    <div>
                      <div className="flex items-center space-x-2">
                        <span className="font-semibold">
                          {nativeAsset.symbol}
                        </span>

                        <Badge variant="secondary" className="text-xs">
                          Native
                        </Badge>
                      </div>

                      <div className="text-sm text-muted-foreground">
                        {nativeAsset.name}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-semibold">
                      {" "}
                      <span className="text-muted-foreground">
                        {isInitializing ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          `${balance} ${currentNetwork.shortName}`
                        )}
                      </span>
                    </div>

                    <div className="text-sm text-right flex justify-end space-x-1">
                      <span className="">
                        {isInitializing
                          ? ""
                          : `$${(balance * conversionRate).toFixed(2)}`}
                      </span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

export default WalletDashboard;
