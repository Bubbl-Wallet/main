"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { motion } from "motion/react";
import { useEffect } from "react";

export default function Step1({ onNext }) {
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === "Enter") {
        onNext();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, []);

  return (
    <div className="flex flex-col items-center h-full gap-y-8 px-8">
      <div className="flex-1 flex flex-col items-center justify-center gap-y-4">
        <div className="p-2 bg-primary/10 rounded-2xl">
          <Image
            src="/logo.png"
            alt="Logo"
            width={1000}
            height={1000}
            className="w-36 h-36"
          />
        </div>

        <h1 className="text-5xl md:text-6xl font-extrabold text-gray-900 mt-2 dark:text-gray-100 text-center tracking-tight">
          Bubbl Wallet
        </h1>

        <div className="text-lg font-bold text-primary uppercase -mt-2 tracking-wider">
          Secure • Offline • Private
        </div>
      </div>

      <div className="flex flex-col items-center gap-y-4 mb-8 w-full">
        <p className="text-sm font-bold text-primary -mt-2 max-w-md text-center tracking-wider">
          Initialize your hardware wallet with customized AI and on-chain
          security features.
        </p>

        <motion.div whileHover={{ scale: 1.01 }} whileTap={{ scale: 0.99 }}>
          <Button
            className="w-full font-extrabold text-lg py-6 min-w-64 rounded-2xl shadow-lg"
            onClick={onNext}
          >
            Create Wallet
          </Button>
        </motion.div>
      </div>
    </div>
  );
}
