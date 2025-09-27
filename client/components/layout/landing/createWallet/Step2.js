"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";
import { motion } from "motion/react";
import { useEffect } from "react";

export default function Step2({ onNext, ensName, setEnsName, isLoading }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter" && !isLoading && ensName.length >= 3) {
        onNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [ensName.length, isLoading, onNext]);

  return (
    <div className="flex flex-col items-center h-full gap-y-8 px-8">
      <div className="flex-1 flex flex-col items-center justify-center">
        <input
          placeholder="michael"
          value={ensName}
          onChange={(e) => setEnsName(e.target.value)}
          className="w-full text-6xl font-extrabold focus:outline-none border-none bg-transparent text-center lowercase"
        />

        <p className="text-3xl font-extrabold text-center">.bubbl.eth</p>
      </div>

      <div className="flex flex-col items-center gap-y-4 mb-8 w-full">
        <p className="text-sm font-extrabold text-primary -mt-2 max-w-md text-center tracking-wider">
          Assign a ENS name to your wallet. This will be used to identify your
          wallet on the blockchain.
        </p>

        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Button
            className="w-full font-extrabold text-lg py-6 min-w-64 rounded-2xl shadow-lg"
            onClick={onNext}
            disabled={!ensName || ensName.length < 3 || isLoading}
          >
            {isLoading ? <Loader2 className="animate-spin" /> : "Awesome!"}
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
