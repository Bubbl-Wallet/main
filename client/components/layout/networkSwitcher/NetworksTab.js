"use client";

import { useMemo } from "react";

import { NetworkCard } from "./NetworkCard";

const NetworksTab = ({
  currentNetwork,
  networkSettings,
  onNetworkSwitch,
  networkSwitching,
  availableNetworks,
}) => {
  const filteredNetworks = useMemo(() => {
    return availableNetworks.filter(
      (network) => networkSettings.showTestnets || !network.isTestnet
    );
  }, [availableNetworks, networkSettings.showTestnets]);

  return (
    <div className="space-y-3 h-full overflow-y-auto hide-scroll pb-6">
      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <span>Available Networks ({filteredNetworks.length})</span>

        {!networkSettings.showTestnets && (
          <span className="text-xs">Testnets hidden</span>
        )}
      </div>

      <div className="space-y-2">
        {filteredNetworks.map((network) => (
          <NetworkCard
            key={network.id}
            network={network}
            isCurrentNetwork={currentNetwork?.id === network.id}
            isSwitching={networkSwitching === network.id}
            onNetworkSwitch={onNetworkSwitch}
          />
        ))}
      </div>
    </div>
  );
};

export default NetworksTab;
