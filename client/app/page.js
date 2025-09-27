"use client";

import { useState } from "react";
import { AnimatePresence } from "motion/react";
import IntroScreen from "../components/layout/landing/IntroScreen";
import CreateWallet from "@/components/layout/landing/CreateWallet";
import InitProvider from "@/providers/InitProvider";
import useWalletStore from "@/stores/useWalletStore";
import LoadingScreen from "@/components/layout/landing/LoadingScreen";
import LoginWallet from "@/components/layout/landing/LoginWallet";

export default function Home() {
  const [showIntroScreen, setShowIntroScreen] = useState(true);
  const { isInitializing, isWalletExists } = useWalletStore();

  if (showIntroScreen) {
    return (
      <AnimatePresence>
        {showIntroScreen && (
          <IntroScreen onAnimationComplete={() => setShowIntroScreen(false)} />
        )}
      </AnimatePresence>
    );
  }

  return (
    <>
      <InitProvider>
        {isInitializing && <LoadingScreen />}

        {!isInitializing && !isWalletExists && <CreateWallet />}

        {!isInitializing && isWalletExists && <LoginWallet />}
      </InitProvider>
    </>
  );
}
