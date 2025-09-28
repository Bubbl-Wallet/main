import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  ArrowUpRight,
  ArrowDownLeft,
  Clock,
  CheckCircle,
  XCircle,
  ExternalLink,
  Loader2,
  FileText,
  Bot,
  Brain,
} from "lucide-react";

const TransactionList = ({
  transactions,
  contacts,
  availableNetworks,
  isLoading,
  onSelectTransaction,
  searchQuery,
}) => {
  const formatAddress = (address) => {
    if (!address) return "";
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
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

  const getStatusIcon = (status) => {
    switch (status) {
      case "executed":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case "user_signed":
        return <Clock className="w-4 h-4 text-blue-500" />;
      case "pending_ai_analysis":
        return <Brain className="w-4 h-4 text-purple-500" />;
      case "ai_rejected":
        return <XCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-400" />;
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

  const formatTimeAgo = (timestamp) => {
    const now = new Date();
    const diff = now.getTime() - timestamp.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (minutes < 1) return "Just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  const getSignatureProgress = (signatures) => {
    const signedCount = signatures.filter((s) => s.signed).length;
    return `${signedCount}/2`;
  };

  if (isLoading && transactions.length === 0) {
    return (
      <Card className="m-4">
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-8 h-8 mb-4 animate-spin text-muted-foreground" />

          <p className="text-muted-foreground">Loading transactions...</p>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <FileText className="w-12 h-12 mb-4 text-muted-foreground opacity-50" />

          <p className="text-lg font-medium text-muted-foreground">
            {searchQuery
              ? "No transactions found"
              : "No completed transactions"}
          </p>

          <p className="text-sm text-muted-foreground">
            {searchQuery
              ? "Try adjusting your search or filters"
              : "Your completed AI-assisted transactions will appear here"}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-3 p-4">
      {transactions.map((transaction) => {
        const contactName = getContactName(
          transaction.type === "sent" ? transaction.to : transaction.from
        );
        const networkInfo = getNetworkInfo(transaction.network);

        return (
          <Card
            key={transaction.id}
            className="hover:shadow-md transition-shadow cursor-pointer p-0"
          >
            <CardContent
              className="p-4"
              onClick={() => onSelectTransaction(transaction)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4 flex-1">
                  <div className="flex items-center space-x-2">
                    {transaction.type === "sent" ? (
                      <ArrowUpRight className="w-5 h-5 text-red-500" />
                    ) : (
                      <ArrowDownLeft className="w-5 h-5 text-green-500" />
                    )}
                    {getStatusIcon(transaction.status)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center space-x-2">
                      <p className="font-medium">
                        {transaction.type === "sent"
                          ? "Sent to"
                          : "Received from"}
                      </p>

                      <Badge variant="outline" className="text-xs">
                        {networkInfo?.name || transaction.network}
                      </Badge>
                    </div>

                    <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                      {contactName ? (
                        <span className="font-medium text-foreground">
                          {contactName}
                        </span>
                      ) : (
                        <span className="font-mono">
                          {formatAddress(
                            transaction.type === "sent"
                              ? transaction.to
                              : transaction.from
                          )}
                        </span>
                      )}
                      <span>•</span>
                      <span>{formatTimeAgo(transaction.timestamp)}</span>
                    </div>

                    {transaction.note && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {transaction.note}
                      </p>
                    )}

                    {/* Transaction status info */}
                    <div className="flex items-center space-x-2 text-xs mt-1">
                      {transaction.status === "user_signed" && (
                        <Badge
                          variant="outline"
                          className="text-blue-600 bg-blue-50 border-blue-200"
                        >
                          <Clock className="w-3 h-3 mr-1" />
                          Awaiting AI signature
                        </Badge>
                      )}
                      {transaction.status === "pending_ai_analysis" && (
                        <Badge
                          variant="outline"
                          className="text-purple-600 bg-purple-50 border-purple-200"
                        >
                          <Brain className="w-3 h-3 mr-1" />
                          AI analyzing
                        </Badge>
                      )}
                      {transaction.status === "executed" && (
                        <div className="flex items-center space-x-2">
                          <span className="text-green-600">
                            Signatures:{" "}
                            {getSignatureProgress(transaction.signatures)}
                          </span>
                          {transaction.confirmations > 0 && (
                            <span className="text-green-600">
                              • {transaction.confirmations} confirmations
                            </span>
                          )}
                        </div>
                      )}
                      {transaction.status === "ai_rejected" && (
                        <Badge
                          variant="outline"
                          className="text-red-600 bg-red-50 border-red-200"
                        >
                          <XCircle className="w-3 h-3 mr-1" />
                          AI rejected
                        </Badge>
                      )}
                    </div>

                    {/* AI Analysis confidence for completed transactions */}
                    {transaction.aiAnalysis &&
                      transaction.status === "executed" && (
                        <div className="text-xs text-muted-foreground mt-1">
                          AI confidence: {transaction.aiAnalysis.confidence}%
                        </div>
                      )}
                  </div>
                </div>

                <div className="text-right space-y-1">
                  <div className="flex items-center space-x-2">
                    <span
                      className={`font-semibold ${
                        transaction.type === "sent"
                          ? "text-red-600"
                          : "text-green-600"
                      }`}
                    >
                      {transaction.type === "sent" ? "-" : "+"}
                      {transaction.amount} {transaction.symbol}
                    </span>
                  </div>

                  {/* <Badge
                    variant="outline"
                    className={`text-xs ${getStatusColor(transaction.status)}`}
                  >
                    {getStatusText(transaction.status)}
                  </Badge> */}
                </div>

                <div className="ml-4 flex items-center space-x-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTransaction(transaction);
                    }}
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default TransactionList;
