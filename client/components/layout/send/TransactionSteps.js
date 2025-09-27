import React from "react";

import { CheckCircle, ChevronRight, FileCheck, Key, Send } from "lucide-react";

const TransactionSteps = ({ currentStep }) => {
  const steps = [
    { step: 1, label: "Create", icon: FileCheck },
    { step: 2, label: "Sign", icon: Key },
    { step: 3, label: "Execute", icon: Send },
  ];

  return (
    <div className="flex items-center justify-center mb-6 space-x-2 border p-4 rounded-xl">
      {steps.map(({ step, label, icon: Icon }, index) => (
        <div key={step} className="flex items-center">
          <div className="flex flex-col items-center space-y-1">
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium transition-colors ${
                step === currentStep
                  ? "bg-primary text-primary-foreground"
                  : step < currentStep
                  ? "bg-green-500 text-white"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {step < currentStep ? (
                <CheckCircle className="w-5 h-5" />
              ) : (
                <Icon className="w-5 h-5" />
              )}
            </div>

            <span className="text-xs font-medium">{label}</span>
          </div>

          {index < 2 && (
            <ChevronRight className="w-4 h-4 mx-2 text-muted-foreground" />
          )}
        </div>
      ))}
    </div>
  );
};

export default TransactionSteps;
