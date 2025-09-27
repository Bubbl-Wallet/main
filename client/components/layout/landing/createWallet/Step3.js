"use client";

import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import PinInput from "@/components/ui/pin-input";
import { useEffect } from "react";

export default function Step3({ onNext, pin, setPin, onBack }) {
  const isPinComplete = pin.length === 6;

  const handleConfirm = () => {
    if (isPinComplete) {
      onNext();
    }
  };

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && isPinComplete) {
        onNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isPinComplete, onNext]);

  return (
    <div className="flex flex-col items-center h-full gap-y-8 px-8">
      <div className="flex-1 flex flex-col items-center justify-center">
        {<PinInput onPinChange={setPin} onBack={onBack} />}
      </div>

      <div className="flex flex-col items-center gap-y-4 mb-8 w-full">
        <p className="text-sm font-extrabold text-primary -mt-2 max-w-md text-center tracking-wider">
          Set a 6 digit pin to secure your wallet. This will be used to access
          your wallet.
        </p>

        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Button
            className="w-full font-extrabold text-lg py-6 min-w-64 rounded-2xl shadow-lg"
            disabled={!isPinComplete}
            onClick={handleConfirm}
          >
            Confirm
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
