"use client";

import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

import { useAvailableNetworks } from "@/stores/useNetworkStore";

const SettingsTab = ({
  recentNetworks,
  currentNetwork,
  networkSettings,
  onSettingsUpdate,
}) => {
  const availableNetworks = useAvailableNetworks();

  return (
    <div className="space-y-3 h-full overflow-y-auto">
      <div className="flex items-center justify-between">
        <div className="space-y-0.5">
          <Label htmlFor="show-testnets" className="text-sm font-medium">
            Show Testnets
          </Label>

          <div className="text-xs text-muted-foreground">
            Display test networks in the list
          </div>
        </div>

        <Switch
          id="show-testnets"
          checked={networkSettings.showTestnets}
          onCheckedChange={(checked) =>
            onSettingsUpdate({ showTestnets: checked })
          }
        />
      </div>

      <div className="pt-4 border-t">
        <div className="text-sm font-medium mb-2">Network Statistics</div>

        <div className="space-y-1 text-xs text-muted-foreground">
          <div>Total networks: {availableNetworks.length}</div>

          <div>
            Mainnets: {availableNetworks.filter((n) => !n.isTestnet).length}
          </div>

          <div>
            Testnets: {availableNetworks.filter((n) => n.isTestnet).length}
          </div>

          <div>Recent connections: {recentNetworks.length}</div>
        </div>
      </div>

      {currentNetwork && (
        <div className="pt-4 border-t">
          <div className="text-sm font-medium mb-2">
            Current Network Details
          </div>

          <div className="space-y-1 text-xs text-muted-foreground">
            <div>Name: {currentNetwork.name}</div>
            <div>Chain ID: {currentNetwork.chainId}</div>
            <div>
              Currency: {currentNetwork.nativeCurrency.name} (
              {currentNetwork.nativeCurrency.symbol})
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsTab;
