import { motion } from "motion/react";

// Define animation variants for the container and the individual dots
const containerVariants = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1, // Each child will animate 0.1s after the previous one
    },
  },
};

const dotVariants = {
  hidden: { y: 20, opacity: 0 },
  show: { y: 0, opacity: 1 },
};

export default function Stepper({ totalSteps, currentStep }) {
  const primaryColor = "#A37764";
  const grayColor = "#D1D5DB";

  return (
    <div>
      <motion.div
        className="flex items-center justify-center gap-2"
        variants={containerVariants}
        initial="hidden"
        animate="show"
      >
        {Array.from({ length: totalSteps }, (_, index) => (
          <motion.div
            key={index}
            className="w-2 h-2 rounded-full"
            variants={dotVariants}
            animate={{
              backgroundColor: index < currentStep ? primaryColor : grayColor,
              scale: index === currentStep - 1 ? 1.25 : 1,
            }}
            transition={{ type: "spring", stiffness: 500, damping: 30 }}
          />
        ))}
      </motion.div>
    </div>
  );
}
