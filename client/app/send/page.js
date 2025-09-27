"use client";

import React, { useState, useEffect } from "react";

import {
  useNetworkStore,
  useCurrentNetwork,
  useAvailableNetworks,
} from "@/stores/useNetworkStore";
import { useContactsData } from "@/stores/useContactsStore";

import ContactSelector from "@/components/layout/send/ContactSelector";
import MultisigProgress from "@/components/layout/send/MultisigProgress";
import TransactionSteps from "@/components/layout/send/TransactionSteps";
import SignTransactionStep from "@/components/layout/send/SignTransactionStep";
import CreateTransactionStep from "@/components/layout/send/CreateTransactionStep";
import ExecuteTransactionStep from "@/components/layout/send/ExecuteTransactionStep";
import useWalletStore from "@/stores/useWalletStore";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

const SendTransactionPage = () => {
  const router = useRouter();

  const contacts = useContactsData();
  const currentNetwork = useCurrentNetwork();
  const availableNetworks = useAvailableNetworks();
  const switchNetwork = useNetworkStore((state) => state.switchNetwork);

  const [currentStep, setCurrentStep] = useState(1);
  const [aiAnalysis, setAiAnalysis] = useState(null);
  const [showContacts, setShowContacts] = useState(false);
  const [aiTransaction, setAiTransaction] = useState(null);
  const [verifiedPin, setVerifiedPin] = useState(null);
  const [transactionData, setTransactionData] = useState({
    amount: "",
    recipient: "",
    contactName: "",
    data: "0x",
    network: currentNetwork?.id || "hedera",
  });
  const [userSignature, setUserSignature] = useState(null);
  const [llmSignature, setLlmSignature] = useState(null);

  const { userAddress, llmAddress } = useWalletStore();

  const AI_SIGNERS = [
    {
      address: userAddress || "",
      name: "Your Wallet",
      type: "user",
      signed: false,
    },
    {
      address: llmAddress || "",
      name: "AI Agent",
      type: "ai",
      signed: false,
    },
  ];

  useEffect(() => {
    if (currentNetwork && currentStep === 1) {
      setTransactionData((prev) => ({ ...prev, network: currentNetwork.id }));
    }
  }, [currentNetwork, currentStep]);

  const selectedNetwork = availableNetworks?.find(
    (n) => n.id === transactionData.network
  );

  const createTransaction = () => {
    const newTransaction = {
      id: `tx_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      nonce: Math.floor(Math.random() * 1000),
      threshold: 2,
      signers: [...AI_SIGNERS],
      gasEstimate: `${(Math.random() * 0.005 + 0.001).toFixed(6)} ${
        selectedNetwork?.nativeCurrency?.symbol || "ETH"
      }`,
      status: "draft",
      createdAt: new Date(),
    };

    setAiTransaction(newTransaction);
    setCurrentStep(2);
  };

  const resetTransaction = () => {
    setTransactionData({
      network: currentNetwork?.id,
      amount: "",
      recipient: "",
      contactName: "",
    });
    setAiTransaction(null);
    setAiAnalysis(null);
    setVerifiedPin(null);
    setCurrentStep(1);
  };

  const handleSigningComplete = (pin) => {
    setVerifiedPin(pin);
    setCurrentStep(3);
  };

  if (showContacts) {
    return (
      <ContactSelector
        contacts={contacts}
        selectedNetwork={selectedNetwork}
        onBack={() => setShowContacts(false)}
        onSelectContact={(contact) => {
          setTransactionData((prev) => ({
            ...prev,
            recipient: contact.address,
            contactName: contact.name,
          }));
          setShowContacts(false);
        }}
      />
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto py-4">
      <div className="flex gap-1 mb-6">
        <Button variant="ghost" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="w-4 h-4" />
        </Button>

        <div>
          <h1 className="text-2xl font-bold">Send Transaction</h1>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>Create and Send transaction to your contacts or new address</p>
          </div>
        </div>
      </div>

      <TransactionSteps currentStep={currentStep} />

      {aiTransaction && (
        <MultisigProgress
          threshold={aiTransaction.threshold}
          signedCount={aiTransaction.signers.filter((s) => s.signed).length}
        />
      )}

      {currentStep === 1 && (
        <CreateTransactionStep
          contacts={contacts}
          onSubmit={createTransaction}
          switchNetwork={switchNetwork}
          transactionData={transactionData}
          selectedNetwork={selectedNetwork}
          availableNetworks={availableNetworks}
          setTransactionData={setTransactionData}
          onShowContacts={() => setShowContacts(true)}
        />
      )}

      {currentStep === 2 && aiTransaction && (
        <SignTransactionStep
          transactionData={transactionData}
          aiTransaction={aiTransaction}
          setAiTransaction={setAiTransaction}
          selectedNetwork={selectedNetwork}
          onBack={() => setCurrentStep(1)}
          onComplete={handleSigningComplete}
          setUserSignature={setUserSignature}
          setLlmSignature={setLlmSignature}
        />
      )}

      {currentStep === 3 && aiTransaction && verifiedPin && (
        <ExecuteTransactionStep
          aiTransaction={aiTransaction}
          setAiTransaction={setAiTransaction}
          aiAnalysis={aiAnalysis}
          setAiAnalysis={setAiAnalysis}
          transactionData={transactionData}
          selectedNetwork={selectedNetwork}
          verifiedPin={verifiedPin}
          setLlmSignature={setLlmSignature}
          onBack={() => setCurrentStep(2)}
          onComplete={resetTransaction}
          userSignature={userSignature}
          llmSignature={llmSignature}
        />
      )}
    </div>
  );
};

export default SendTransactionPage;
