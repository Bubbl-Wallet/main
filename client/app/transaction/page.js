"use client";

import { useRouter } from "next/navigation";
import React, { useState, useEffect, useMemo } from "react";

import {
  useCurrentNetwork,
  useNetworkSettings,
  useAvailableNetworks,
} from "@/stores/useNetworkStore";
import { useContactsData } from "@/stores/useContactsStore";

import useTransactions from "@/hooks/useTransaction";

import TransactionList from "@/components/layout/transaction/TransactionList";
import TransactionHeader from "@/components/layout/transaction/TransactionHeader";
import TransactionFilters from "@/components/layout/transaction/TransactionFilters";
import TransactionDetails from "@/components/layout/transaction/TransactionDetails";

import { Card } from "@/components/ui/card";

export default function BlockchainTransactions() {
  const router = useRouter();

  const contacts = useContactsData();
  const currentNetwork = useCurrentNetwork();
  const networkSettings = useNetworkSettings();
  const availableNetworksRaw = useAvailableNetworks();

  // Use real transaction hook instead of mock data
  const { getAllTransactions, transactions, isLoading, error } =
    useTransactions();

  const availableNetworks = availableNetworksRaw;

  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [filters, setFilters] = useState({
    network: "all",
    type: "all", // all, sent, received
    status: "all", // all, executed, ai_rejected
    dateRange: "all", // all, today, week, month
    search: "",
  });

  // Navigation handlers
  const handleNavigateToSend = () => {
    router.push("/send");
  };

  const handleNavigateToAISend = () => {
    router.push("/ai-send");
  };

  // Load real transactions on component mount
  useEffect(() => {
    loadTransactions();
  }, []);

  // Filter transactions based on current filters
  const filteredTransactions = useMemo(() => {
    let filtered = [...transactions];

    // Network filter
    if (filters.network !== "all") {
      filtered = filtered.filter((tx) => tx.network === filters.network);
    }

    // Type filter
    if (filters.type !== "all") {
      filtered = filtered.filter((tx) => tx.type === filters.type);
    }

    // Status filter
    if (filters.status !== "all") {
      filtered = filtered.filter((tx) => tx.status === filters.status);
    }

    // Date range filter
    if (filters.dateRange !== "all") {
      const now = new Date();
      const cutoff = new Date();

      switch (filters.dateRange) {
        case "today":
          cutoff.setHours(0, 0, 0, 0);
          break;
        case "week":
          cutoff.setDate(now.getDate() - 7);
          break;
        case "month":
          cutoff.setMonth(now.getMonth() - 1);
          break;
      }

      filtered = filtered.filter((tx) => new Date(tx.timestamp) >= cutoff);
    }

    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (tx) =>
          tx.hash?.toLowerCase().includes(searchLower) ||
          tx.from?.toLowerCase().includes(searchLower) ||
          tx.to?.toLowerCase().includes(searchLower) ||
          tx.contactName?.toLowerCase().includes(searchLower) ||
          tx.aiAnalysis?.reasoning?.toLowerCase().includes(searchLower) ||
          tx.id?.toLowerCase().includes(searchLower)
      );
    }

    // Sort by timestamp (newest first)
    return filtered.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }, [transactions, filters]);

  // Transaction counts for filters
  const transactionCounts = useMemo(() => {
    return {
      total: transactions.length,
      sent: transactions.filter((tx) => tx.type === "sent").length,
      received: transactions.filter((tx) => tx.type === "received").length,
      executed: transactions.filter((tx) => tx.status === "executed").length,
      ai_rejected: transactions.filter((tx) => tx.status === "ai_rejected")
        .length,
    };
  }, [transactions]);

  // Get count of pending transactions
  const pendingCount = useMemo(() => {
    return transactions.filter(
      (tx) => tx.status === "user_signed" || tx.status === "pending_ai_analysis"
    ).length;
  }, [transactions]);

  // Load transactions from API
  const loadTransactions = async () => {
    try {
      await getAllTransactions();
    } catch (error) {
      console.error("Failed to load transactions:", error);
    }
  };

  const handleRefresh = () => {
    loadTransactions();
  };

  if (selectedTransaction) {
    return (
      <TransactionDetails
        contacts={contacts}
        onRefresh={handleRefresh}
        transaction={selectedTransaction}
        availableNetworks={availableNetworks}
        onBack={() => setSelectedTransaction(null)}
      />
    );
  }

  return (
    <div className="w-full max-w-lg mx-auto space-y-4">
      <TransactionHeader
        pendingCount={pendingCount}
        isLoading={isLoading}
        onRefresh={handleRefresh}
        currentNetwork={currentNetwork}
        onNavigateToSend={handleNavigateToSend}
        onNavigateToAISend={handleNavigateToAISend}
        totalTransactions={filteredTransactions.length}
      />

      {error && (
        <Card className="p-4 m-4 border-red-200 bg-red-50">
          <div className="flex items-center justify-between">
            <p className="text-red-600 text-sm">Error: {error}</p>
            <button
              onClick={handleRefresh}
              className="text-red-600 underline text-sm hover:text-red-800"
            >
              Retry
            </button>
          </div>
        </Card>
      )}

      <Card className="p-4 m-4">
        <TransactionFilters
          filters={filters}
          setFilters={setFilters}
          availableNetworks={availableNetworks}
          transactionCounts={transactionCounts}
        />
      </Card>

      <TransactionList
        contacts={contacts}
        isLoading={isLoading}
        searchQuery={filters.search}
        transactions={filteredTransactions}
        availableNetworks={availableNetworks}
        onSelectTransaction={setSelectedTransaction}
      />
    </div>
  );
}
