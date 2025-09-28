import {
  Bot,
  Send,
  Clock,
  Activity,
  RefreshCw,
  TrendingUp,
  ArrowLeft,
} from "lucide-react";
import React from "react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";

const TransactionHeader = ({
  onRefresh,
  isLoading,
  pendingCount,
  onNavigateToSend,
  totalTransactions,
  onNavigateToAISend,
}) => {
  const router = useRouter();

  const successCount = totalTransactions - pendingCount;
  const successRate =
    totalTransactions > 0
      ? Math.round((successCount / totalTransactions) * 100)
      : 0;

  return (
    <div className="space-y-4 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4">
      <div className="flex pb-4 border-b items-start justify-between">
        <div className="flex gap-1">
          <Button variant="ghost" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="w-4 h-4" />
          </Button>

          <div>
            <h1 className="text-2xl font-bold">Transaction History</h1>

            <div className="space-y-2 text-sm text-muted-foreground">
              <p>View and manage your blockchain transactions</p>
            </div>
          </div>
        </div>

        <div className="flex items-start space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
          >
            <RefreshCw
              className={`w-4 h-4 mr-2 ${isLoading ? "animate-spin" : ""}`}
            />
            Refresh
          </Button>

          {/* {onNavigateToAISend && (
            <Button variant="outline" onClick={onNavigateToAISend}>
              <Bot className="w-4 h-4 mr-2" />
              AI Send
            </Button>
          )}

          {onNavigateToSend && (
            <Button onClick={onNavigateToSend}>
              <Send className="w-4 h-4 mr-2" />
              Send Transaction
            </Button>
          )} */}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Activity className="w-5 h-5 text-blue-600" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">
                  Total Transactions
                </p>

                <p className="text-2xl font-bold">{totalTransactions}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Pending</p>

                <div className="flex items-center space-x-2">
                  <p className="text-2xl font-bold">{pendingCount}</p>

                  {pendingCount > 0 && (
                    <Badge variant="outline" className="text-yellow-600">
                      {pendingCount} active
                    </Badge>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <TrendingUp className="w-5 h-5 text-green-600" />
              </div>

              <div>
                <p className="text-sm text-muted-foreground">Success Rate</p>
                <p className="text-2xl font-bold">{successRate}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TransactionHeader;
