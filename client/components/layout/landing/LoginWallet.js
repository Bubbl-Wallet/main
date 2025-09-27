"use client";

import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import PinInput from "@/components/ui/pin-input";
import { useState, useEffect, useCallback } from "react";
import useWalletStore from "@/stores/useWalletStore";
import useWallet from "@/hooks/useWallet";
import LoadingScreen from "./LoadingScreen";
import { useRouter } from "next/navigation";

export default function LoginWallet() {
  const [pin, setPin] = useState("");
  const isPinComplete = pin.length === 6;
  const { walletName } = useWalletStore();
  const { getWallet, signUserTransaction } = useWallet();
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleConfirm = useCallback(async () => {
    setIsLoading(true);

    try {
      await getWallet(pin, walletName);
      router.push("/dashboard");
    } catch (error) {
    } finally {
      setIsLoading(false);
    }
  }, [pin, walletName, getWallet]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && isPinComplete) {
        handleConfirm();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPinComplete, pin, handleConfirm]);

  if (isLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className="h-screen w-full flex flex-col py-8 items-center">
      <div className="flex-1">
        <div className="flex flex-col items-center h-full gap-y-8 px-8">
          <div className="flex-1 flex flex-col items-center justify-center">
            {<PinInput onPinChange={setPin} isBackEnabled={false} />}
          </div>

          <div className="flex flex-col items-center gap-y-4 mb-8 w-full">
            <p className="text-sm font-extrabold text-primary -mt-2 max-w-md text-center tracking-wider">
              Hi{" "}
              <span className="font-extrabold text-black">
                {walletName}.bubbl.eth
              </span>
              ! Confirm your pin to access your wallet.
            </p>

            <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                className="w-full font-extrabold text-lg py-6 min-w-64 rounded-2xl shadow-lg"
                disabled={!isPinComplete}
                onClick={handleConfirm}
              >
                {"Let's go!"}
              </Button>
            </motion.div>

            {/* <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
              <Button
                className="w-full font-extrabold text-lg py-6 min-w-64 rounded-2xl shadow-lg"
                onClick={() =>
                  signUserTransaction(
                    84532,
                    "0x0000000000000000000000000000000000000000",
                    "0",
                    "0x",
                    pin
                  )
                }
              >
                Try me
              </Button>
            </motion.div> */}
          </div>
        </div>
      </div>
    </div>
  );
}
