"use client";

import { motion } from "motion/react";
import { useState, useEffect } from "react";
import { CheckCircle, Timer, RotateCcw } from "lucide-react";
import Image from "next/image";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.3,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: {
      duration: 0.8,
      ease: "easeInOut",
    },
  },
};

const logoVariants = {
  hidden: { opacity: 0, scale: 0.8, y: -20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      type: "spring",
      stiffness: 300,
      damping: 25,
      duration: 0.8,
    },
  },
};

const iconVariants = {
  hidden: { opacity: 0, scale: 0 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: {
      type: "spring",
      stiffness: 500,
      damping: 30,
      delay: 0.1,
    },
  },
};

export function IntroScreen({ onAnimationComplete }) {
  useEffect(() => {
    // Set timeout for the full screen to fade out
    const timer = setTimeout(() => {
      onAnimationComplete();
    }, 1500); // Total duration: 1.5 seconds

    return () => clearTimeout(timer);
  }, [onAnimationComplete]);

  return (
    <motion.div
      className="fixed inset-0 bg-gradient-to-br from-white via-gray-50 to-gray-100 dark:from-gray-900 dark:via-gray-800 dark:to-gray-700 flex flex-col items-center justify-center z-[100] overflow-hidden"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      {/* Main Content */}
      <div className="relative z-10 flex flex-col items-center gap-y-8 px-8 max-w-4xl mx-auto">
        {/* App Logo/Brand */}
        <motion.div
          variants={logoVariants}
          className="flex flex-col items-center space-y-8 max-w-lg"
        >
          <div className="flex items-center gap-4">
            <motion.div
              variants={iconVariants}
              className="p-2 bg-primary/10 rounded-2xl"
              style={{ animationDelay: "0.1s" }}
            >
              <Image
                src="/logo.png"
                alt="Logo"
                width={1000}
                height={1000}
                className="w-36 h-36"
              />
            </motion.div>
          </div>

          <motion.h1
            variants={logoVariants}
            className="text-5xl md:text-6xl font-extrabold text-gray-900 dark:text-gray-100 text-center tracking-tight"
          >
            Bubbl Wallet
          </motion.h1>

          <motion.div
            variants={logoVariants}
            className="text-lg font-bold text-primary uppercase -mt-4 tracking-wider"
          >
            Secure • Offline • Private
          </motion.div>
        </motion.div>
      </div>
    </motion.div>
  );
}

export default IntroScreen;
