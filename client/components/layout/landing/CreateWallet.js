"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import Stepper from "./Stepper";
import Step1 from "./createWallet/Step1";
import Step2 from "./createWallet/Step2";
import Step3 from "./createWallet/Step3";
import Step4 from "./createWallet/Step4";
import Step5 from "./createWallet/Step5";
import useWallet from "@/hooks/useWallet";

export default function CreateWallet() {
  const router = useRouter();

  const [pin, setPin] = useState("");
  const [step, setStep] = useState(1);
  const [ensName, setEnsName] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  const { createWallet: createWalletPico } = useWallet();

  const confirmENSName = async () => {
    setIsLoading(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setStep(3);
    } catch (error) {}
    setIsLoading(false);
  };

  const createWallet = async () => {
    setIsCreating(true);

    try {
      await createWalletPico(pin, ensName);

      setStep(5);
    } catch (error) {}
    setIsCreating(false);
  };

  return (
    <div className="h-screen w-full flex flex-col py-8 items-center">
      <div className="flex-1">
        {isCreating && (
          <div className="flex flex-col items-center h-full gap-y-8 px-8">
            <div className="flex-1 flex flex-col items-center justify-center opacity-50">
              <Loader2 className="animate-spin h-20 w-20" />
            </div>
          </div>
        )}

        {!isCreating && step === 1 && <Step1 onNext={() => setStep(2)} />}

        {!isCreating && step === 2 && (
          <Step2
            ensName={ensName}
            isLoading={isLoading}
            setEnsName={setEnsName}
            onNext={() => confirmENSName()}
          />
        )}

        {!isCreating && step === 3 && (
          <Step3
            onNext={() => setStep(4)}
            pin={pin}
            setPin={setPin}
            onBack={() => setStep(2)}
          />
        )}

        {!isCreating && step === 4 && (
          <Step4
            currentPin={pin}
            onBack={() => setStep(3)}
            onNext={() => createWallet()}
          />
        )}

        {!isCreating && step === 5 && (
          <Step5
            onNext={() => {
              router.push("/dashboard");
            }}
          />
        )}
      </div>

      <Stepper totalSteps={4} currentStep={step} />
    </div>
  );
}
