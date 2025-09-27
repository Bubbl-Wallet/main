"use client";

import useInitialize from "@/hooks/useInitialize";
import { useCurrentNetwork } from "@/stores/useNetworkStore";
import { useEffect } from "react";

export default function DashboardProvider({ children }) {
  const { initialize } = useInitialize();
  const network = useCurrentNetwork();

  useEffect(() => {
    initialize();
  }, [network?.chainId]);

  return <>{children}</>;
}
