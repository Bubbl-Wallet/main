"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowLeft, Delete } from "lucide-react";

const PIN_LENGTH = 6;

export default function PinInput({
  onPinChange,
  onBack,
  isBackEnabled = true,
}) {
  const [pin, setPin] = useState("");
  const [isShaking, setIsShaking] = useState(false);

  // Handle number button clicks
  const handleNumberClick = (num) => {
    if (pin.length >= PIN_LENGTH) return;
    setPin((prevPin) => prevPin + num);
  };

  const handleBackClick = () => {
    onBack();
  };

  // Handle delete button clicks
  const handleDeleteClick = () => {
    setPin((prevPin) => prevPin.slice(0, -1));
  };

  // Trigger a shake animation for feedback
  const triggerShake = () => {
    setIsShaking(true);
    setTimeout(() => setIsShaking(false), 500);
  };

  // Listen for keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (/^\d$/.test(e.key)) {
        pin.length < PIN_LENGTH ? handleNumberClick(e.key) : triggerShake();
      } else if (e.key === "Backspace") {
        handleDeleteClick();
      } else if (e.key === "Escape") {
        handleBackClick();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [pin]); // Dependency array includes pin to get its current length

  // Notify the parent component whenever the pin changes
  useEffect(() => {
    onPinChange(pin);
  }, [pin, onPinChange]);

  const numpadKeys = [1, 2, 3, 4, 5, 6, 7, 8, 9];

  const shakeVariants = {
    shake: {
      x: [0, -10, 10, -10, 10, 0],
      transition: { duration: 0.5 },
    },
    initial: { x: 0 },
  };

  return (
    <div className="flex flex-col items-center gap-10">
      {/* PIN Dots Display */}
      <motion.div
        className="flex items-center gap-3"
        variants={shakeVariants}
        animate={isShaking ? "shake" : "initial"}
      >
        {Array.from({ length: PIN_LENGTH }).map((_, index) => {
          const isActive = index < pin.length;
          return (
            <div
              key={index}
              className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center"
            >
              <AnimatePresence>
                {isActive && (
                  <motion.div
                    className="w-full h-full rounded-full bg-primary"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    exit={{ scale: 0 }}
                    transition={{ type: "spring", duration: 0.5, bounce: 0.5 }}
                  />
                )}
              </AnimatePresence>
            </div>
          );
        })}
      </motion.div>

      {/* On-screen Numpad */}
      <div className="grid grid-cols-3 gap-4">
        {numpadKeys.map((key) => (
          <NumpadButton key={key} onClick={() => handleNumberClick(key)}>
            {key}
          </NumpadButton>
        ))}
        {isBackEnabled && (
          <NumpadButton onClick={handleBackClick}>
            <ArrowLeft />
          </NumpadButton>
        )}
        {!isBackEnabled && <div />}
        <NumpadButton onClick={() => handleNumberClick(0)}>0</NumpadButton>
        <NumpadButton onClick={handleDeleteClick}>
          <Delete />
        </NumpadButton>
      </div>
    </div>
  );
}

// A small helper component for the numpad buttons to keep the main component clean
function NumpadButton({ children, onClick }) {
  return (
    <motion.button
      type="button"
      className="w-20 h-20 rounded-full bg-primary/10 text-2xl font-bold flex items-center justify-center focus:outline-none focus:ring-2 focus:ring-primary focus:ring-opacity-50"
      onClick={onClick}
      whileTap={{ scale: 0.9 }}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {children}
    </motion.button>
  );
}
