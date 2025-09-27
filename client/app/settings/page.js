"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Wifi, History, Settings, AlertCircle } from "lucide-react";

import {
  Card,
  CardTitle,
  CardHeader,
  CardDescription,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

import {
  useNetworkStore,
  useCurrentNetwork,
  useRecentNetworks,
  useConnectionError,
  useNetworkSettings,
  useNetworkSwitching,
  useAvailableNetworks,
} from "@/stores/useNetworkStore";

import RecentTab from "@/components/layout/networkSwitcher/RecentTab";
import NetworksTab from "@/components/layout/networkSwitcher/NetworksTab";
import SettingsTab from "@/components/layout/networkSwitcher/SettingsTab";

const SettingsPage = () => {
  const router = useRouter();

  const [activeTab, setActiveTab] = useState("networks");

  const currentNetwork = useCurrentNetwork();
  const recentNetworks = useRecentNetworks();
  const connectionError = useConnectionError();
  const networkSettings = useNetworkSettings();
  const networkSwitching = useNetworkSwitching();
  const availableNetworksRaw = useAvailableNetworks();

  const { switchNetwork, clearConnectionError, updateNetworkSettings } =
    useNetworkStore();

  const availableNetworks = useMemo(() => {
    return availableNetworksRaw.filter(
      (n) => networkSettings.showTestnets || !n.isTestnet
    );
  }, [availableNetworksRaw, networkSettings.showTestnets]);

  const handleNetworkSwitch = async (networkId) => {
    if (networkId === currentNetwork?.id) return;

    try {
      clearConnectionError();
      await switchNetwork(networkId);
    } catch (error) {
      console.error("Network switch failed:", error);
    }
  };

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto h-screen">
      <Card className="border-none shadow-none rounded-b-none">
        <CardHeader className="pb-4 px-0">
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={() => router.back()}>
              <ArrowLeft className="w-4 h-4" />
            </Button>

            <div className="flex-1">
              <CardTitle>Network Switcher</CardTitle>
              <CardDescription>
                Current: {currentNetwork?.name || "None selected"}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
      </Card>

      {connectionError && (
        <div className="px-6 pb-4">
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              {connectionError}
              <Button
                variant="link"
                className="p-0 h-auto ml-2"
                onClick={clearConnectionError}
              >
                Dismiss
              </Button>
            </AlertDescription>
          </Alert>
        </div>
      )}

      <div className="flex-1 flex flex-col overflow-hidden">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="flex flex-col h-full"
        >
          <div className="pb-4">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="networks" className="flex items-center gap-2">
                <Wifi className="w-4 h-4" />
                Networks
              </TabsTrigger>

              <TabsTrigger value="recent" className="flex items-center gap-2">
                <History className="w-4 h-4" />
                Recent
              </TabsTrigger>

              <TabsTrigger value="settings" className="flex items-center gap-2">
                <Settings className="w-4 h-4" />
                Settings
              </TabsTrigger>
            </TabsList>
          </div>

          <div className="flex-1 overflow-hidden">
            <TabsContent value="networks" className="h-full m-0">
              <NetworksTab
                availableNetworks={availableNetworks}
                networkSettings={networkSettings}
                currentNetwork={currentNetwork}
                networkSwitching={networkSwitching}
                onNetworkSwitch={handleNetworkSwitch}
              />
            </TabsContent>

            <TabsContent value="recent" className="h-full m-0">
              <RecentTab
                recentNetworks={recentNetworks}
                currentNetwork={currentNetwork}
                networkSwitching={networkSwitching}
                onNetworkSwitch={handleNetworkSwitch}
              />
            </TabsContent>

            <TabsContent value="settings" className="h-full m-0">
              <SettingsTab
                networkSettings={networkSettings}
                availableNetworks={availableNetworks}
                recentNetworks={recentNetworks}
                currentNetwork={currentNetwork}
                onSettingsUpdate={updateNetworkSettings}
              />
            </TabsContent>
          </div>
        </Tabs>
      </div>
    </div>
  );
};

export default SettingsPage;
