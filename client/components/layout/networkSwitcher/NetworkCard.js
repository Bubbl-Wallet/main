"use client";

import Image from "next/image";
import { Wifi, Check } from "lucide-react";

import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
  TooltipProvider,
} from "@/components/ui/tooltip";
import { Badge } from "@/components/ui/badge";

import { NETWORK_STATUS } from "@/lib/networks";

export function NetworkCard({
  network,
  isRecent = false,
  isCurrentNetwork = false,
  isSwitching = false,
  onNetworkSwitch,
}) {
  const isDisabled =
    network.status === NETWORK_STATUS.UNAVAILABLE ||
    network.status === NETWORK_STATUS.MAINTENANCE;

  const getStatusColor = (status) => {
    switch (status) {
      case NETWORK_STATUS.CONNECTED:
        return "bg-green-100 text-green-800 border-green-200";
      case NETWORK_STATUS.AVAILABLE:
        return "bg-blue-100 text-blue-800 border-blue-200";
      case NETWORK_STATUS.MAINTENANCE:
        return "bg-yellow-100 text-yellow-800 border-yellow-200";
      case NETWORK_STATUS.UNAVAILABLE:
        return "bg-gray-100 text-gray-800 border-gray-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case NETWORK_STATUS.CONNECTED:
        return "Connected";
      case NETWORK_STATUS.AVAILABLE:
        return "Available";
      case NETWORK_STATUS.MAINTENANCE:
        return "Maintenance";
      case NETWORK_STATUS.UNAVAILABLE:
        return "Unavailable";
      default:
        return "Unknown";
    }
  };

  return (
    <div
      className={`p-4 rounded-lg border cursor-pointer transition-all duration-200 ${
        isCurrentNetwork
          ? "border-primary bg-primary/5 ring-2 ring-primary/20"
          : isDisabled
          ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
          : "border-border hover:bg-muted/50 hover:border-primary/30"
      }`}
      onClick={() => !isDisabled && onNetworkSwitch(network.id)}
    >
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 bg-muted rounded-full flex items-center justify-center overflow-hidden">
            {network.iconUrl ? (
              <Image
                width={24}
                height={24}
                alt={network.name}
                src={network.iconUrl}
                onError={(e) => {
                  e.target.style.display = "none";
                  e.target.nextSibling.style.display = "flex";
                }}
              />
            ) : null}

            <Wifi
              className="w-5 h-5"
              style={{ display: network.iconUrl ? "none" : "flex" }}
            />
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <div className="font-medium truncate">{network.name}</div>

              {network.isTestnet && (
                <Badge variant="outline" className="text-xs">
                  Testnet
                </Badge>
              )}
            </div>

            <div className="text-sm text-muted-foreground">
              Chain ID: {network.chainId} • {network.nativeCurrency.symbol}
              {isRecent && network.lastConnected && (
                <span className="ml-2">
                  • Last used:{" "}
                  {new Date(network.lastConnected).toLocaleDateString()}
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="flex items-center space-x-2">
          {isSwitching ? (
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          ) : isCurrentNetwork ? (
            <Check className="w-4 h-4 text-primary" />
          ) : null}

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <Badge className={getStatusColor(network.status)}>
                  {getStatusText(network.status)}
                </Badge>
              </TooltipTrigger>

              <TooltipContent>
                <div className="text-xs">
                  <div>RPC: {network.rpcUrls[0]}</div>
                  <div>Explorer: {network.blockExplorerUrls[0]}</div>
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </div>
  );
}
