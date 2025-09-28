import React, { useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  ArrowLeft,
  ExternalLink,
  Copy,
  CheckCircle,
  Clock,
  XCircle,
  ArrowUpRight,
  ArrowDownLeft,
  Hash,
  Blocks,
  User,
  FileText,
  AlertTriangle,
  Shield,
  Bot,
  Brain,
} from "lucide-react";

const TransactionDetails = ({
  transaction,
  contacts,
  availableNetworks,
  onBack,
  onRefresh,
}) => {
  const [copiedField, setCopiedField] = useState("");

  const formatAddress = (address) => {
    if (!address) return "";
    return address;
  };

  const formatAddressShort = (address) => {
    if (!address) return "";
    return `${address.slice(0, 8)}...${address.slice(-8)}`;
  };

  const getContactName = (address) => {
    if (!contacts || !address) return null;
    const contact = contacts.find(
      (c) => c.address.toLowerCase() === address.toLowerCase()
    );
    return contact?.name;
  };

  const getNetworkInfo = (networkId) => {
    return availableNetworks?.find((n) => n.id === networkId);
  };

  const copyToClipboard = async (text, field) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(field);
      setTimeout(() => setCopiedField(""), 2000);
    } catch (err) {
      console.error("Failed to copy:", err);
    }
  };

  const openInExplorer = () => {
    const network = getNetworkInfo(transaction.network);
    if (network?.blockExplorerUrls?.[0]) {
      const explorerUrl = `${network.blockExplorerUrls[0]}/tx/${transaction.hash}`;
      window.open(explorerUrl, "_blank");
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "executed":
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case "user_signed":
        return <Clock className="w-5 h-5 text-blue-500" />;
      case "pending_ai_analysis":
        return <Brain className="w-5 h-5 text-purple-500" />;
      case "ai_rejected":
        return <XCircle className="w-5 h-5 text-red-500" />;
      default:
        return <Clock className="w-5 h-5 text-gray-400" />;
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "executed":
        return "text-green-600 bg-green-50 border-green-200";
      case "user_signed":
        return "text-blue-600 bg-blue-50 border-blue-200";
      case "pending_ai_analysis":
        return "text-purple-600 bg-purple-50 border-purple-200";
      case "ai_rejected":
        return "text-red-600 bg-red-50 border-red-200";
      default:
        return "text-gray-600 bg-gray-50 border-gray-200";
    }
  };

  const getStatusText = (status) => {
    switch (status) {
      case "executed":
        return "Executed";
      case "user_signed":
        return "Awaiting AI";
      case "pending_ai_analysis":
        return "AI Analyzing";
      case "ai_rejected":
        return "AI Rejected";
      default:
        return status;
    }
  };

  const formatDateTime = (timestamp) => {
    return timestamp.toLocaleString();
  };

  const CopyableField = ({ label, value, field, className = "" }) => (
    <div className={`flex justify-between items-center ${className}`}>
      <span className="text-muted-foreground">{label}:</span>
      <div className="flex items-center space-x-2">
        <span className="font-mono text-sm break-all">{value}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => copyToClipboard(value, field)}
          className="h-6 w-6 p-0 flex-shrink-0"
        >
          {copiedField === field ? (
            <CheckCircle className="w-3 h-3 text-green-500" />
          ) : (
            <Copy className="w-3 h-3" />
          )}
        </Button>
      </div>
    </div>
  );

  const SignatureStatus = ({ signatures }) => (
    <div className="space-y-3">
      <h3 className="font-medium flex items-center space-x-2">
        <Shield className="w-4 h-4" />
        <span>Signatures (2/2 Required)</span>
      </h3>

      <div className="space-y-2">
        {signatures.map((signer, index) => (
          <div
            key={index}
            className="flex items-center justify-between p-3 bg-muted rounded-lg"
          >
            <div className="flex items-center space-x-3">
              <div
                className={`w-3 h-3 rounded-full ${
                  signer.signed ? "bg-green-500" : "bg-gray-300"
                }`}
              />

              <div className="flex items-center space-x-2">
                {signer.type === "user" ? (
                  <User className="w-4 h-4" />
                ) : (
                  <Bot className="w-4 h-4" />
                )}

                <div>
                  <div className="font-medium text-sm">{signer.signer}</div>
                  <div className="font-mono text-xs text-muted-foreground">
                    {formatAddressShort(signer.address)}
                  </div>
                </div>
              </div>
            </div>

            <div className="text-right">
              {/* {signer.signed ? ( */}
              <div>
                <Badge className="text-green-600 bg-green-50 border-green-200 mb-1">
                  Signed
                </Badge>
                {signer.signedAt && (
                  <div className="text-xs text-muted-foreground">
                    {formatDateTime(signer.signedAt)}
                  </div>
                )}
              </div>
              {/* ) : (
                <Badge variant="outline">
                  {signer.type === "ai" ? "AI Pending" : "Pending"}
                </Badge>
              )} */}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  const AIAnalysisSection = ({ aiAnalysis }) => (
    <div className="space-y-3">
      <h3 className="font-medium flex items-center space-x-2">
        <Brain className="w-4 h-4" />
        <span>AI Analysis</span>
      </h3>

      <div className="bg-muted p-4 rounded-lg space-y-3">
        <div className="flex justify-center">
          <Badge
            className={`px-4 py-2 ${
              aiAnalysis.decision === "approved"
                ? "bg-green-100 text-green-800 border-green-200"
                : "bg-red-100 text-red-800 border-red-200"
            }`}
          >
            {aiAnalysis.decision === "approved" ? (
              <CheckCircle className="w-4 h-4 mr-2" />
            ) : (
              <XCircle className="w-4 h-4 mr-2" />
            )}
            {aiAnalysis.decision === "approved" ? "AI Approved" : "AI Rejected"}
          </Badge>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="text-center">
            <div className="text-2xl font-bold">{aiAnalysis.confidence}%</div>
            <div className="text-sm text-muted-foreground">Confidence</div>
          </div>

          <div className="text-center">
            <div className="text-2xl font-bold">
              {aiAnalysis.securityScore}%
            </div>

            <div className="text-sm text-muted-foreground">Security Score</div>
          </div>
        </div>

        {aiAnalysis.analyzedAt && (
          <div className="text-center text-xs text-muted-foreground">
            Analyzed at {formatDateTime(aiAnalysis.analyzedAt)}
          </div>
        )}

        {aiAnalysis.reasons && aiAnalysis.reasons.length > 0 && (
          <Alert className="mt-3">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Reasons:</strong> {aiAnalysis.reasons.join(", ")}
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  );

  const networkInfo = getNetworkInfo(transaction.network);
  const fromContactName = getContactName(transaction.from);
  const toContactName = getContactName(transaction.to);

  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      <Card className="border-0 shadow-none">
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>

            <div className="flex-1">
              <CardTitle className="flex items-center space-x-2">
                {transaction.type === "sent" ? (
                  <ArrowUpRight className="w-5 h-5 text-red-500" />
                ) : (
                  <ArrowDownLeft className="w-5 h-5 text-green-500" />
                )}
                <span>Transaction Details</span>
              </CardTitle>

              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="outline">
                  {networkInfo?.name || transaction.network}
                </Badge>

                <Badge className={getStatusColor(transaction.status)}>
                  {getStatusIcon(transaction.status)}
                  <span className="ml-1">
                    {getStatusText(transaction.status)}
                  </span>
                </Badge>
              </div>
            </div>

            {networkInfo?.blockExplorerUrls?.[0] &&
              transaction.status === "executed" && (
                <Button variant="outline" size="sm" onClick={openInExplorer}>
                  <ExternalLink className="w-4 h-4 mr-2" />
                  Explorer
                </Button>
              )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          <div className="bg-muted p-4 rounded-lg">
            <div className="flex items-center justify-between mb-4">
              <span className="text-muted-foreground">Amount</span>
              <span
                className={`text-2xl font-bold ${
                  transaction.type === "sent"
                    ? "text-red-600"
                    : "text-green-600"
                }`}
              >
                {transaction.type === "sent" ? "-" : "+"}
                {transaction.amount} {transaction.symbol}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="text-muted-foreground">Type:</span>
                <span className="ml-2 font-medium capitalize">
                  {transaction.type}
                </span>
              </div>

              <div>
                <span className="text-muted-foreground">Date:</span>
                <span className="ml-2">
                  {formatDateTime(transaction.timestamp)}
                </span>
              </div>
            </div>
          </div>

          {transaction.status === "user_signed" && (
            <Alert className="border-blue-200 bg-blue-50">
              <Clock className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800">
                <strong>Awaiting AI Analysis:</strong> Your signature has been
                recorded. The AI agent will now analyze this transaction.
              </AlertDescription>
            </Alert>
          )}

          {transaction.status === "pending_ai_analysis" && (
            <Alert className="border-purple-200 bg-purple-50">
              <Brain className="h-4 w-4 text-purple-600" />
              <AlertDescription className="text-purple-800">
                <strong>AI Analysis in Progress:</strong> The AI agent is
                analyzing this transaction for security and approval.
              </AlertDescription>
            </Alert>
          )}

          {transaction.status === "ai_rejected" && (
            <Alert className="border-red-200 bg-red-50">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>Transaction Rejected:</strong> The AI agent has rejected
                this transaction for security reasons.
              </AlertDescription>
            </Alert>
          )}

          <SignatureStatus signatures={transaction.signatures} />

          {transaction.aiAnalysis && (
            <AIAnalysisSection aiAnalysis={transaction.aiAnalysis} />
          )}

          <div className="space-y-3">
            <h3 className="font-medium flex items-center space-x-2">
              <Hash className="w-4 h-4" />
              <span>Transaction Hash</span>
            </h3>
            <CopyableField
              label="Hash"
              value={transaction.hash}
              field="hash"
              className="bg-muted p-3 rounded-lg"
            />
          </div>

          <div className="space-y-3">
            <h3 className="font-medium">Transaction Nonce</h3>
            {/* <div className="bg-muted p-3 rounded-lg">
              <CopyableField
                label="Nonce"
                value={transaction.nonce.toString()}
                field="nonce"
              />
            </div> */}
          </div>

          <div className="space-y-3">
            <h3 className="font-medium flex items-center space-x-2">
              <User className="w-4 h-4" />
              <span>Addresses</span>
            </h3>

            <div className="space-y-3">
              <div className="bg-muted p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">From:</span>

                  <div className="text-right">
                    {fromContactName && (
                      <div className="font-medium text-sm">
                        {fromContactName}
                      </div>
                    )}

                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm">
                        {formatAddressShort(transaction.from)}
                      </span>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() =>
                          copyToClipboard(transaction.from, "from")
                        }
                        className="h-6 w-6 p-0"
                      >
                        {copiedField === "from" ? (
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-muted p-3 rounded-lg">
                <div className="flex justify-between items-center">
                  <span className="text-muted-foreground">To:</span>
                  <div className="text-right">
                    {toContactName && (
                      <div className="font-medium text-sm">{toContactName}</div>
                    )}

                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm">
                        {formatAddressShort(transaction.to)}
                      </span>

                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => copyToClipboard(transaction.to, "to")}
                        className="h-6 w-6 p-0"
                      >
                        {copiedField === "to" ? (
                          <CheckCircle className="w-3 h-3 text-green-500" />
                        ) : (
                          <Copy className="w-3 h-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {transaction.status === "executed" && (
            <div className="space-y-3">
              <h3 className="font-medium flex items-center space-x-2">
                <Blocks className="w-4 h-4" />
                <span>Blockchain Details</span>
              </h3>

              <div className="bg-muted p-3 rounded-lg space-y-2">
                {transaction.blockNumber && (
                  <CopyableField
                    label="Block Number"
                    value={transaction.blockNumber.toString()}
                    field="block"
                  />
                )}

                {transaction.gasUsed && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Gas Used:</span>
                    <span className="font-mono text-sm">
                      {transaction.gasUsed}
                    </span>
                  </div>
                )}

                {transaction.gasPrice && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Gas Price:</span>
                    <span className="font-mono text-sm">
                      {transaction.gasPrice} {transaction.symbol}
                    </span>
                  </div>
                )}

                {transaction.confirmations !== undefined && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">
                      Confirmations:
                    </span>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm">
                        {transaction.confirmations}
                      </span>
                      {transaction.confirmations > 0 && (
                        <Shield className="w-3 h-3 text-green-500" />
                      )}
                    </div>
                  </div>
                )}

                {transaction.feeUsd && (
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Fee (USD):</span>
                    <span className="font-mono text-sm">
                      {transaction.feeUsd}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {transaction.note && (
            <div className="space-y-3">
              <h3 className="font-medium flex items-center space-x-2">
                <FileText className="w-4 h-4" />
                <span>Note</span>
              </h3>

              <div className="bg-muted p-3 rounded-lg">
                <p className="text-sm">{transaction.note}</p>
              </div>
            </div>
          )}

          <div className="flex space-x-3 pt-4">
            <Button variant="outline" onClick={onRefresh} className="flex-1">
              Refresh Status
            </Button>

            {networkInfo?.blockExplorerUrls?.[0] &&
              transaction.status === "executed" && (
                <Button onClick={openInExplorer} className="flex-1">
                  <ExternalLink className="w-4 h-4 mr-2" />
                  View on Explorer
                </Button>
              )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default TransactionDetails;
