import React, { useEffect, useState } from "react";
import {
  ArrowLeft,
  Key,
  Shield,
  User,
  Bot,
  Loader2,
  XCircle,
} from "lucide-react";

import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import PinInput from "@/components/ui/pin-input";
import useWallet from "@/hooks/useWallet";
import { useCurrentNetwork } from "@/stores/useNetworkStore";
import { ethers } from "ethers";

const TransactionSummary = ({
  aiTransaction,
  transactionData,
  selectedNetwork,
}) => {
  const formatAddress = (address) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className="bg-muted/50 p-4 rounded-xl space-y-3 border">
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground text-sm">Network</span>
        <Badge variant="outline" className="font-medium">
          {selectedNetwork?.name}
        </Badge>
      </div>

      <div className="flex justify-between items-start">
        <span className="text-muted-foreground text-sm">To</span>
        <div className="text-right">
          {transactionData.contactName && (
            <div className="font-medium text-sm text-foreground">
              {transactionData.contactName}
            </div>
          )}
          <span className="font-mono text-xs text-muted-foreground">
            {formatAddress(transactionData.recipient)}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-muted-foreground text-sm">Amount</span>
        <span className="font-semibold text-lg">
          {transactionData.amount} {selectedNetwork?.nativeCurrency?.symbol}
        </span>
      </div>
    </div>
  );
};

const SignersList = ({ signers, threshold, isSigning }) => {
  const formatAddress = (address) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`;
  const signedCount = signers.filter((s) => s.signed).length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <h4 className="font-medium flex items-center space-x-2">
          <Shield className="w-4 h-4 text-primary" />
          <span>Signatures</span>
        </h4>
        <Badge variant="secondary" className="text-xs">
          {signedCount}/{threshold}
        </Badge>
      </div>

      <div className="space-y-2">
        {signers.map((signer, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-background border rounded-lg hover:bg-muted/30 transition-colors"
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-2.5 h-2.5 rounded-full transition-colors ${
                  signer.signed
                    ? "bg-green-500"
                    : isSigning && signer.type === "user"
                    ? "bg-yellow-500 animate-pulse"
                    : "bg-muted-foreground/30"
                }`}
              />

              <div className="flex items-center space-x-2">
                {signer.type === "user" ? (
                  <User className="w-4 h-4 text-blue-500" />
                ) : (
                  <Bot className="w-4 h-4 text-purple-500" />
                )}

                <div>
                  <div className="font-medium text-sm">{signer.name}</div>
                  <div className="font-mono text-xs text-muted-foreground">
                    {formatAddress(signer.address)}
                  </div>
                </div>
              </div>
            </div>

            {signer.signed ? (
              <Badge
                variant="outline"
                className="text-green-600 border-green-200 bg-green-50"
              >
                Signed
              </Badge>
            ) : signer.type === "user" ? (
              <Badge variant="secondary">Pending</Badge>
            ) : (
              <Badge variant="outline">Waiting</Badge>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const SignTransactionStep = ({
  onBack,
  onComplete,
  aiTransaction,
  transactionData,
  selectedNetwork,
  setAiTransaction,
  setUserSignature,
}) => {
  const [isSigning, setIsSigning] = useState(false);
  const [showPinDialog, setShowPinDialog] = useState(false);
  const [pin, setPin] = useState("");
  const [pinError, setPinError] = useState("");
  const [isVerifyingPin, setIsVerifyingPin] = useState(false);
  const [mainError, setMainError] = useState("");
  const { signUserTransaction } = useWallet();
  const currentNetwork = useCurrentNetwork();

  const CORRECT_PIN = "123456";

  const formatAddress = (address) => {
    if (!address || typeof address !== "string") return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  useEffect(() => {
    if (pin.length === 6) {
      handlePinVerification(pin);
    }
  }, [pin]);

  const handlePinChange = (newPin) => {
    setPin(newPin);
    setPinError("");
  };

  const handlePinVerification = async (pinToVerify) => {
    setIsVerifyingPin(true);
    setIsSigning(true);

    try {
      const userSignaturePayload = await signUserTransaction(
        currentNetwork.chainId,
        transactionData.recipient,
        ethers.utils.parseEther(transactionData.amount.toString()),
        transactionData.data,
        pinToVerify
      );

      const updatedSigners = aiTransaction.signers.map((signer) =>
        signer.type === "user" ? { ...signer, signed: true } : signer
      );

      setAiTransaction((prev) => ({
        ...prev,
        signers: updatedSigners,
        status: "user_signed",
        safeTxHash: userSignaturePayload.transaction_id,
      }));

      setUserSignature(userSignaturePayload);

      setShowPinDialog(false);

      onComplete(pinToVerify);

      // await new Promise((resolve) => setTimeout(resolve, 1000));
      // if (pinToVerify === CORRECT_PIN) {
      //   setIsVerifyingPin(false);
      //   setShowPinDialog(false);
      //   setPin("");
      //   setPinError("");
      //   setMainError("");
      //   await executeSignTransaction(pinToVerify);
      // } else {
      //   setIsVerifyingPin(false);
      //   setPin("");
      //   setPinError("Incorrect PIN entered");
      //   // Close dialog and show error on main card
      //   setTimeout(() => {
      //     setShowPinDialog(false);
      //     setPinError("");
      //     setMainError("Incorrect PIN. Please try again with the correct PIN.");
      //   }, 1500);
      // }
    } catch (error) {
      console.error("PIN verification failed:", error);
      setPinError("Verification failed");

      setTimeout(() => {
        setShowPinDialog(false);
        setPinError("");
        setMainError("PIN verification failed. Please try again.");
      }, 1500);
    } finally {
      setIsVerifyingPin(false);
      setIsSigning(false);
    }
  };

  const handleSignTransaction = async () => {
    setMainError(""); // Clear any previous errors
    setShowPinDialog(true);
    setPin("");
    setPinError("");
  };

  const executeSignTransaction = async (verifiedPin) => {
    setIsSigning(true);

    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const updatedSigners = aiTransaction.signers.map((signer) =>
        signer.type === "user" ? { ...signer, signed: true } : signer
      );

      setAiTransaction((prev) => ({
        ...prev,
        signers: updatedSigners,
        status: "user_signed",
        safeTxHash: `0x${Math.random()
          .toString(16)
          .slice(2, 66)
          .padStart(64, "0")}`,
      }));

      setIsSigning(false);
      onComplete(verifiedPin);
    } catch (error) {
      console.error("Transaction signing failed:", error);
      setIsSigning(false);
    }
  };

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={onBack}
              disabled={isSigning || showPinDialog}
              className="h-8 w-8 p-0"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>

            <div>
              <CardTitle className="flex items-center space-x-2 text-lg">
                <Key className="w-5 h-5 text-primary" />
                <span>Sign Transaction</span>
              </CardTitle>
              <CardDescription className="text-sm">
                Verify with your PIN to authorize this transaction
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <TransactionSummary
            transactionData={transactionData}
            aiTransaction={aiTransaction}
            selectedNetwork={selectedNetwork}
          />

          <SignersList
            signers={aiTransaction.signers}
            threshold={aiTransaction.threshold}
            isSigning={isSigning}
          />

          {/* Main Error Display */}
          {mainError && (
            <Alert variant="destructive" className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4" />
              <AlertDescription className="text-red-800">
                {mainError}
              </AlertDescription>
            </Alert>
          )}

          <div className="flex space-x-3">
            <Button
              variant="outline"
              onClick={onBack}
              disabled={isSigning || showPinDialog}
              className="flex-1"
            >
              Back
            </Button>

            <Button
              onClick={handleSignTransaction}
              disabled={isSigning || showPinDialog}
              className="flex-1"
              size="default"
            >
              {isSigning ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Signing...
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4 mr-2" />
                  Sign with PIN
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={showPinDialog} onOpenChange={() => setShowPinDialog(false)}>
        <DialogContent
          className="sm:max-w-sm p-0 gap-0"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <DialogHeader className="p-6 pb-4">
            <DialogTitle className="flex items-center space-x-2 text-lg">
              <Shield className="w-5 h-5 text-primary" />
              <span>Enter PIN</span>
            </DialogTitle>
            <DialogDescription className="text-sm">
              Confirm your 6-digit PIN to sign this transaction
            </DialogDescription>
          </DialogHeader>

          <div className="px-6 pb-6 space-y-4">
            {/* Compact Transaction Info */}
            <div className="bg-muted/30 p-3 rounded-lg space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Amount</span>
                <span className="font-medium">
                  {transactionData.amount}{" "}
                  {selectedNetwork?.nativeCurrency?.symbol}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">To</span>
                <span className="font-mono text-xs">
                  {formatAddress(transactionData.recipient)}
                </span>
              </div>
            </div>

            <div className="flex justify-center">
              <PinInput
                onPinChange={handlePinChange}
                onBack={() => {}}
                isBackEnabled={false}
              />
            </div>

            {pinError && (
              <Alert variant="destructive" className="py-3">
                <XCircle className="h-4 w-4" />
                <AlertDescription className="text-sm">
                  {pinError}
                </AlertDescription>
              </Alert>
            )}

            {isSigning && (
              <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>Signing transaction...</span>
              </div>
            )}

            <div className="text-center">
              <p className="text-xs text-muted-foreground">
                Demo PIN: <span className="font-mono">123456</span>
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default SignTransactionStep;
