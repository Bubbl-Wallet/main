"use client";

import { Button } from "@/components/ui/button";
import { motion } from "motion/react";
import confetti from "canvas-confetti";
import { useEffect } from "react";

export default function Step5({ onNext }) {
  useEffect(() => {
    confetti({
      particleCount: 100,
      spread: 75,
      origin: { y: 0.6 },
    });
  }, []);

  return (
    <div className="flex flex-col items-center h-full gap-y-8 px-8">
      <div className="flex-1 flex flex-col items-center justify-center gap-y-4">
        <div className="p-8 bg-primary/10 rounded-2xl text-7xl">🥳</div>

        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mt-2 dark:text-gray-100 text-center tracking-tight">
          Welcome
        </h1>

        <div className="text-lg font-bold text-primary -mt-2">
          Your wallet has been created successfully!
        </div>
      </div>

      <div className="flex flex-col items-center gap-y-4 mb-8 w-full">
        <p className="text-sm font-bold text-primary -mt-2 max-w-md text-center tracking-wider">
          Let&apos;s head to the dashboard and start using your wallet!
        </p>

        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Button
            onClick={onNext}
            className="w-full font-extrabold text-lg py-6 min-w-64 rounded-2xl shadow-lg cursor-pointer"
          >
            Hooray!
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
