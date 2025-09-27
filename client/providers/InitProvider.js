"use client";

import useWallet from "@/hooks/useWallet";
import { useEffect } from "react";

export default function InitProvider({ children }) {
  const { checkWallet } = useWallet();

  useEffect(() => {
    checkWallet();
  }, []);

  return <>{children}</>;
}
