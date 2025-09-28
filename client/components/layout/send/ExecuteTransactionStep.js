import React, { useState } from "react";
import {
  Bot,
  Send,
  Loader2,
  XCircle,
  ArrowLeft,
  CheckCircle,
  AlertTriangle,
} from "lucide-react";

import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import useWallet from "@/hooks/useWallet";
import { useCurrentNetwork } from "@/stores/useNetworkStore";
import useWalletStore from "@/stores/useWalletStore";
import { ethers } from "ethers";

const ExecuteTransactionStep = ({
  onBack,
  aiAnalysis,
  onComplete,
  aiTransaction,
  setAiAnalysis,
  setAiTransaction,
  transactionData,
  selectedNetwork,
  verifiedPin,
  userSignature,
  setLlmSignature,
  llmSignature,
}) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [isExecuting, setIsExecuting] = useState(false);
  const {
    signLlmTransaction,
    executeTransaction: executeTransactionWallet,
    indexTransaction,
  } = useWallet();
  const { userAddress, llmAddress, walletAddress } = useWalletStore();

  const currentNetwork = useCurrentNetwork();

  const formatAddress = (address) => {
    if (!address || typeof address !== "string") return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const handleAnalysis = async () => {
    setIsAnalyzing(true);

    try {
      const llmSignaturePayload = await signLlmTransaction(
        userSignature.transaction_id,
        currentNetwork?.chainId,
        transactionData.recipient,
        ethers.utils.parseEther(transactionData.amount),
        transactionData.data,
        verifiedPin,
        `{
          "to": "${transactionData.recipient}",
          "value": "${transactionData.amount}",
          "data": "${transactionData.data}",
          "current_balance": "25.0",
          "whitelisted_addresses": [
            "0xA2d6267B5b167Ee27174BfDa808408F90391D949"
          ],
          "blocked_addresses": [
            "0xf79ed4531139db9Be79a83245F2A2afEeA5b448B",
            "0x3C700d88616C9e186aed7dd59B2e7f60819bf863"
          ],
          "blocked_data_signatures": [
            "0xdeadbeef"
          ]
        }`
      );

      console.log("llmSignaturePayload", llmSignaturePayload);

      setLlmSignature(llmSignaturePayload);

      const decision = llmSignaturePayload.decision;

      const Analysis = {
        decision,
        confidence: llmSignaturePayload.confidence_score,
        securityScore: llmSignaturePayload.security_score,
        riskFactors: [],
        reasons: [],
        recommendedAction: llmSignaturePayload.reasoning,
      };

      if (decision) {
        setAiTransaction((prev) => ({
          ...prev,
          signers: prev.signers.map((signer) =>
            signer.type === "ai" ? { ...signer, signed: true } : signer
          ),
          status: "ready",
        }));
      }

      setAiAnalysis(Analysis);

      // // Simulate AI analysis delay
      // await new Promise((resolve) => setTimeout(resolve, 3000));
      // const decision =
      //   Math.random() > 0.15
      //     ? "approved"
      //     : Math.random() > 0.7
      //     ? "rejected"
      //     : "warning";
      // const mockAnalysis = {
      //   decision,
      //   confidence: Math.floor(Math.random() * 20) + 80,
      //   gasEstimate: aiTransaction.gasEstimate,
      //   securityScore: Math.floor(Math.random() * 20) + 80,
      //   riskFactors: [],
      //   reasons: [],
      //   recommendedAction: "",
      // };
      // if (mockAnalysis.decision === "approved") {
      //   mockAnalysis.reasons = [
      //     "Recipient address verified in your contacts",
      //     "Transaction amount within reasonable limits",
      //     "Network conditions are optimal",
      //     "No security risks detected",
      //     "Gas fees are within normal range",
      //   ];
      //   mockAnalysis.recommendedAction =
      //     "Transaction approved and signed by AI";
      //   setAiTransaction((prev) => ({
      //     ...prev,
      //     signers: prev.signers.map((signer) =>
      //       signer.type === "ai" ? { ...signer, signed: true } : signer
      //     ),
      //     status: "ready",
      //   }));
      // } else if (mockAnalysis.decision === "rejected") {
      //   mockAnalysis.reasons = [
      //     "Recipient address flagged as suspicious",
      //     "Transaction amount exceeds safe limits",
      //     "Unusual network activity detected",
      //     "High risk of transaction failure",
      //   ];
      //   mockAnalysis.riskFactors = [
      //     "Suspicious recipient",
      //     "High transaction amount",
      //     "Network risks",
      //   ];
      //   mockAnalysis.recommendedAction =
      //     "AI has rejected this transaction for security reasons";
      // } else {
      //   mockAnalysis.reasons = [
      //     "Transaction appears legitimate but requires caution",
      //     "Recipient address not in your contacts",
      //     "Higher than usual gas fees detected",
      //   ];
      //   mockAnalysis.riskFactors = ["New recipient", "High gas costs"];
      //   mockAnalysis.recommendedAction =
      //     "AI recommends proceeding with caution";
      //   setAiTransaction((prev) => ({
      //     ...prev,
      //     signers: prev.signers.map((signer) =>
      //       signer.type === "ai" ? { ...signer, signed: true } : signer
      //     ),
      //     status: "ready",
      //   }));
      // }
      // setAiAnalysis(mockAnalysis);
    } catch (error) {
      console.error("Analysis failed:", error);
      // Handle analysis error
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleExecute = async () => {
    // Use the verified PIN from signing step to directly execute
    if (verifiedPin) {
      executeTransaction();
    } else {
      console.error("No verified PIN available");
    }
  };

  const executeTransaction = async () => {
    setIsExecuting(true);

    try {
      if (llmSignature.decision) {
        console.log(userSignature.transaction_id);
        await executeTransactionWallet(
          userAddress,
          llmAddress,
          walletAddress,
          currentNetwork?.chainId,
          transactionData.recipient,
          ethers.utils.parseEther(transactionData.amount),
          transactionData.data,
          userSignature.transaction_id,
          userSignature.signature,
          llmSignature.signature,
          llmSignature.confidence_score,
          llmSignature.decision,
          llmSignature.reasoning,
          llmSignature.security_score
        );

        setAiTransaction((prev) => ({
          ...prev,
          status: "executed",
          safeTxHash: userSignature.transaction_id,
        }));

        // Show success for 3 seconds then complete
        setTimeout(() => {
          onComplete();
        }, 3000);
      } else {
        console.log(userSignature.transaction_id);
        await indexTransaction(
          userAddress,
          llmAddress,
          walletAddress,
          currentNetwork?.chainId,
          transactionData.recipient,
          ethers.utils.parseEther(transactionData.amount),
          transactionData.data,
          userSignature.transaction_id,
          llmSignature.confidence_score,
          llmSignature.decision,
          llmSignature.reasoning,
          llmSignature.security_score
        );
      }
    } catch (error) {
      console.error("Transaction execution failed:", error);
      // Handle execution error
    } finally {
      setIsExecuting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={onBack}
            disabled={isAnalyzing || isExecuting}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <div>
            <CardTitle className="flex items-center space-x-2">
              <Send className="w-5 h-5" />
              <span>AI Decision</span>
            </CardTitle>

            <CardDescription>
              {aiTransaction.status === "executed"
                ? "Transaction executed successfully"
                : isAnalyzing
                ? "AI is analyzing transaction..."
                : isExecuting
                ? "Executing transaction..."
                : aiAnalysis
                ? "AI analysis complete"
                : "Waiting for AI analysis"}
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        <TransactionStatus
          aiTransaction={aiTransaction}
          transactionData={transactionData}
          selectedNetwork={selectedNetwork}
        />

        {aiTransaction.status === "executed" ? (
          <ExecutionSuccess />
        ) : isAnalyzing ? (
          <AnalysisLoading />
        ) : aiAnalysis ? (
          <AIAnalysisResult
            aiAnalysis={aiAnalysis}
            onBack={onBack}
            onExecute={handleExecute}
            isExecuting={isExecuting}
          />
        ) : (
          <div className="flex flex-col items-center justify-center py-8">
            <Button onClick={handleAnalysis} size="lg">
              <Bot className="w-4 h-4 mr-2" />
              Get AI Analysis
            </Button>

            <p className="text-sm text-muted-foreground mt-2">
              Let AI analyze and approve/reject this transaction
            </p>
          </div>
        )}

        {/* PIN Status Indicator */}
        {verifiedPin && (
          <div className="bg-green-50 border border-green-200 rounded-lg p-3">
            <div className="flex items-center space-x-2 text-green-800">
              <CheckCircle className="w-4 h-4" />
              <span className="text-sm font-medium">PIN Verified</span>
            </div>
            <p className="text-xs text-green-600 mt-1">
              Ready to execute with verified authorization
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

const TransactionStatus = ({
  aiTransaction,
  transactionData,
  selectedNetwork,
}) => {
  const formatAddress = (address) => {
    if (!address || typeof address !== "string") return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="bg-muted p-4 rounded-lg space-y-2">
      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">Status:</span>
        <Badge
          variant={
            aiTransaction.status === "executed"
              ? "default"
              : aiTransaction.status === "ready"
              ? "secondary"
              : "outline"
          }
          className={
            aiTransaction.status === "executed"
              ? "bg-green-100 text-green-800"
              : ""
          }
        >
          {aiTransaction.status === "executed"
            ? "Executed"
            : aiTransaction.status === "ready"
            ? "Ready to Execute"
            : "User Signed"}
        </Badge>
      </div>

      <div className="flex justify-between items-start">
        <span className="text-muted-foreground">To:</span>
        <div className="text-right">
          {transactionData.contactName && (
            <div className="font-medium text-sm">
              {transactionData.contactName}
            </div>
          )}
          <span className="font-mono text-sm">
            {formatAddress(transactionData.recipient)}
          </span>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <span className="text-muted-foreground">Amount:</span>
        <span className="font-medium text-lg">
          {transactionData.amount} {selectedNetwork?.nativeCurrency?.symbol}
        </span>
      </div>

      {aiTransaction.safeTxHash && (
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Transaction Id:</span>
          <span className="font-mono text-xs">
            {formatAddress(aiTransaction.safeTxHash)}
          </span>
        </div>
      )}
    </div>
  );
};

const ExecutionSuccess = () => (
  <div className="flex flex-col items-center justify-center py-8 space-y-4">
    <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
      <CheckCircle className="w-8 h-8 text-green-600" />
    </div>

    <div className="text-center space-y-2">
      <h3 className="font-semibold text-green-600">Transaction Executed!</h3>
      <p className="text-sm text-muted-foreground">
        Your AI-assisted transaction has been successfully executed
      </p>
    </div>
  </div>
);

const AnalysisLoading = () => (
  <div className="flex flex-col items-center justify-center py-8 space-y-4">
    <div className="relative">
      <Loader2 className="w-8 h-8 animate-spin text-primary" />
      <Bot className="w-4 h-4 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
    </div>

    <div className="text-center space-y-2">
      <p className="font-medium">AI Analyzing Transaction</p>
      <p className="text-sm text-muted-foreground">
        Checking security, validating recipient, and determining approval...
      </p>
    </div>
  </div>
);

const AIAnalysisResult = ({ aiAnalysis, onBack, onExecute, isExecuting }) => (
  <div className="space-y-4">
    <AIDecisionBadge decision={aiAnalysis.decision} />

    <div className="grid grid-cols-2 gap-4">
      <div className="text-center p-3 bg-muted rounded-lg">
        <div className="text-2xl font-bold">{aiAnalysis.confidence}%</div>
        <div className="text-sm text-muted-foreground">Confidence</div>
      </div>

      <div className="text-center p-3 bg-muted rounded-lg">
        <div className="text-2xl font-bold">{aiAnalysis.securityScore}%</div>
        <div className="text-sm text-muted-foreground">Security Score</div>
      </div>
    </div>

    {aiAnalysis.riskFactors.length > 0 && (
      <Alert>
        <AlertTriangle className="h-4 w-4" />
        <AlertDescription>
          <strong>Risk Factors:</strong> {aiAnalysis.riskFactors.join(", ")}
        </AlertDescription>
      </Alert>
    )}

    <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
      <p className="text-sm font-medium text-blue-900 flex items-center space-x-1">
        <Bot className="w-4 h-4" />
        <span>AI Recommendation:</span>
      </p>
      <p className="text-sm text-blue-800">{aiAnalysis.recommendedAction}</p>
    </div>

    <ExecutionButtons
      onBack={onBack}
      onExecute={onExecute}
      isExecuting={isExecuting}
      decision={aiAnalysis.decision}
    />
  </div>
);

const AIDecisionBadge = ({ decision }) => (
  <div className="flex items-center justify-center">
    <div
      className={`flex items-center space-x-2 px-4 py-2 rounded-full ${
        decision ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
      }`}
    >
      {decision ? (
        <CheckCircle className="w-5 h-5" />
      ) : (
        <XCircle className="w-5 h-5" />
      )}
      <span className="font-medium">
        {decision ? "AI Approved" : "AI Rejected"}
      </span>
    </div>
  </div>
);

const ExecutionButtons = ({ decision, onBack, onExecute, isExecuting }) => (
  <div className="flex space-x-3 pt-4">
    {decision === "rejected" ? (
      <>
        <Button variant="outline" onClick={onBack} className="flex-1">
          Back to Review
        </Button>
        <Button variant="destructive" disabled className="flex-1">
          <XCircle className="w-4 h-4 mr-2" />
          AI Blocked
        </Button>
      </>
    ) : (
      <>
        <Button
          variant="outline"
          onClick={onBack}
          disabled={isExecuting}
          className="flex-1"
        >
          Cancel
        </Button>
        <Button onClick={onExecute} disabled={isExecuting} className="flex-1">
          {isExecuting ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Executing...
            </>
          ) : (
            <>
              <Send className="w-4 h-4 mr-2" />
              {decision ? "Execute" : "Index"} Transaction
            </>
          )}
        </Button>
      </>
    )}
  </div>
);

export default ExecuteTransactionStep;
