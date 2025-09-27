import React from "react";
import { FileCheck, Users, ChevronRight } from "lucide-react";

import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import {
  Select,
  SelectItem,
  SelectValue,
  SelectContent,
  SelectTrigger,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const CreateTransactionStep = ({
  onSubmit,
  contacts,
  switchNetwork,
  onShowContacts,
  transactionData,
  selectedNetwork,
  availableNetworks,
  setTransactionData,
}) => {
  const handleNetworkChange = async (networkId) => {
    try {
      await switchNetwork(networkId);
      setTransactionData((prev) => ({
        ...prev,
        network: networkId,
        recipient: "",
        contactName: "",
      }));
    } catch (error) {
      console.error("Failed to switch network:", error);
    }
  };

  const handleSubmit = () => {
    if (!transactionData.recipient || !transactionData.amount) return;
    onSubmit();
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileCheck className="w-5 h-5" />
          <span>Create Transaction</span>
        </CardTitle>

        <CardDescription>Set up your AI-assisted transaction</CardDescription>
      </CardHeader>

      <CardContent>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="network">Network</Label>

            <Select
              value={transactionData.network}
              onValueChange={handleNetworkChange}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                {availableNetworks?.map((network) => (
                  <SelectItem key={network.id} value={network.id}>
                    <div className="flex items-center space-x-2">
                      <span>{network.name}</span>

                      {network.isTestnet && (
                        <Badge variant="outline" className="text-xs">
                          Testnet
                        </Badge>
                      )}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="recipient">Recipient Address</Label>

              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={onShowContacts}
              >
                <Users className="w-3 h-3 mr-1" />
                Contacts ({contacts?.length || 0})
              </Button>
            </div>

            <Input
              required
              id="recipient"
              value={transactionData.recipient}
              placeholder="0x... or select from contacts"
              onChange={(e) =>
                setTransactionData((prev) => ({
                  ...prev,
                  recipient: e.target.value,
                  contactName: "",
                }))
              }
            />

            {transactionData.contactName && (
              <p className="text-xs text-muted-foreground">
                Sending to: {transactionData.contactName}
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount</Label>

            <div className="relative">
              <Input
                id="amount"
                type="number"
                step="0.000001"
                placeholder="0.0"
                value={transactionData.amount}
                onChange={(e) =>
                  setTransactionData((prev) => ({
                    ...prev,
                    amount: e.target.value,
                  }))
                }
                required
              />

              <div className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">
                {selectedNetwork?.nativeCurrency?.symbol || "TOKEN"}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="data">Data (Optional)</Label>

            <Input
              id="data"
              type="text"
              placeholder="0x..."
              value={transactionData.data}
              onChange={(e) =>
                setTransactionData((prev) => ({
                  ...prev,
                  data: e.target.value,
                }))
              }
              required
            />
          </div>

          <Button
            type="button"
            onClick={handleSubmit}
            className="w-full"
            disabled={!transactionData.recipient || !transactionData.amount}
          >
            Create AI Transaction
            <ChevronRight className="w-4 h-4 ml-2" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default CreateTransactionStep;
