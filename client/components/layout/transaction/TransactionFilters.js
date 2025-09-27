import React from "react";
import { Search, Filter } from "lucide-react";

import {
  Select,
  SelectItem,
  SelectValue,
  SelectTrigger,
  SelectContent,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";

const TransactionFilters = ({
  filters,
  setFilters,
  availableNetworks,
  transactionCounts,
}) => {
  const updateFilter = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center space-x-2">
        <Filter className="w-4 h-4 text-muted-foreground" />
        <span className="font-medium">Filters</span>
        <Badge variant="secondary" className="ml-auto">
          {transactionCounts.total} total
        </Badge>
      </div>

      <div className="grid grid-cols-1 gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />

          <Input
            placeholder="Search transactions..."
            value={filters.search}
            onChange={(e) => updateFilter("search", e.target.value)}
            className="pl-10"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            value={filters.network}
            onValueChange={(value) => updateFilter("network", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Networks" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All Networks</SelectItem>
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

          <Select
            value={filters.type}
            onValueChange={(value) => updateFilter("type", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Types" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="sent">
                <div className="flex items-center justify-between w-full">
                  <span>Sent</span>
                  <Badge variant="outline" className="ml-2">
                    {transactionCounts.sent}
                  </Badge>
                </div>
              </SelectItem>
              <SelectItem value="received">
                <div className="flex items-center justify-between w-full">
                  <span>Received</span>
                  <Badge variant="outline" className="ml-2">
                    {transactionCounts.received}
                  </Badge>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Select
            value={filters.status}
            onValueChange={(value) => updateFilter("status", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="executed">
                <div className="flex items-center justify-between w-full">
                  <span>Executed</span>
                  <Badge variant="outline" className="ml-2 text-green-600">
                    {transactionCounts.executed}
                  </Badge>
                </div>
              </SelectItem>
              <SelectItem value="ai_rejected">
                <div className="flex items-center justify-between w-full">
                  <span>AI Rejected</span>
                  <Badge variant="outline" className="ml-2 text-red-600">
                    {transactionCounts.ai_rejected}
                  </Badge>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.dateRange}
            onValueChange={(value) => updateFilter("dateRange", value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="All Time" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="all">All Time</SelectItem>
              <SelectItem value="today">Today</SelectItem>
              <SelectItem value="week">Last 7 days</SelectItem>
              <SelectItem value="month">Last 30 days</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
};

export default TransactionFilters;
