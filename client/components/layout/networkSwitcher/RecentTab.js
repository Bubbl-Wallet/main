"use client";

import { History } from "lucide-react";

import { NetworkCard } from "./NetworkCard";

const RecentTab = ({
  recentNetworks,
  currentNetwork,
  onNetworkSwitch,
  networkSwitching,
}) => {
  return (
    <div className="space-y-3 h-full overflow-y-auto hide-scroll">
      <div className="text-sm text-muted-foreground">
        Recently Used Networks
      </div>

      <div className="space-y-2">
        {recentNetworks.length > 0 ? (
          recentNetworks.map((network) => (
            <NetworkCard
              key={network.id}
              network={network}
              isRecent={true}
              isCurrentNetwork={currentNetwork?.id === network.id}
              isSwitching={networkSwitching === network.id}
              onNetworkSwitch={onNetworkSwitch}
            />
          ))
        ) : (
          <div className="text-center py-8 text-muted-foreground">
            <History className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No recent networks</p>
            <p className="text-xs">Switch to a network to see it here</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default RecentTab;
