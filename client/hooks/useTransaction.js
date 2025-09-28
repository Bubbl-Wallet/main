"use client";

import axios from "axios";
import { useState } from "react";

import useWalletStore from "@/stores/useWalletStore";

import {
  extractTransactionId,
  transformTransactionData,
} from "@/utils/transactionUtils";

export default function useTransactions() {
  const { walletAddress } = useWalletStore();
  console.log("Wallet address", walletAddress);

  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);

  const addTransaction = async (transaction) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!walletAddress) {
        throw new Error("Wallet address not found");
      }

      const response = await axios.post(
        `${process.env.NEXT_PUBLIC_API_URL}/transaction/${walletAddress}`,
        { transaction }
      );

      console.log("Transaction added", response.data);

      return response.data;
    } catch (err) {
      console.error("Error adding transaction:", err);
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getAllTransactions = async () => {
    try {
      setIsLoading(true);
      setError(null);

      if (!walletAddress) {
        throw new Error("Wallet address not found");
      }

      // First, get all transaction keys
      const keysResponse = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/transaction/all/${walletAddress}`
      );

      console.log("Transaction keys", keysResponse.data);

      const transactionKeys = keysResponse.data.data || [];

      if (transactionKeys.length === 0) {
        setTransactions([]);
        return keysResponse.data;
      }

      // Extract transaction IDs from keys
      const transactionIds = transactionKeys.map((item) =>
        extractTransactionId(item.Key)
      );

      // Fetch each transaction by ID
      const transactionPromises = transactionIds.map(async (id) => {
        try {
          const txResponse = await axios.get(
            `${process.env.NEXT_PUBLIC_API_URL}/transaction/get/${walletAddress}/${id}`
          );

          // Find corresponding key data
          const keyData = transactionKeys.find(
            (item) => extractTransactionId(item.Key) === id
          );

          if (!keyData) {
            console.error(`Key data not found for transaction ${id}`);
            return null;
          }

          // Transform the transaction data using utility function
          return transformTransactionData(
            txResponse.data.data,
            keyData,
            walletAddress
          );
        } catch (err) {
          console.error(`Error fetching transaction ${id}:`, err);
          return null;
        }
      });

      const fetchedTransactions = await Promise.all(transactionPromises);
      const validTransactions = fetchedTransactions.filter((tx) => tx !== null);

      setTransactions(validTransactions);
      return { success: true, data: validTransactions };
    } catch (err) {
      console.error("Error getting all transactions:", err);
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const getTransaction = async (transactionId) => {
    try {
      setIsLoading(true);
      setError(null);

      if (!walletAddress) {
        throw new Error("Wallet address not found");
      }

      const response = await axios.get(
        `${process.env.NEXT_PUBLIC_API_URL}/transaction/get/${walletAddress}/${transactionId}`
      );

      console.log("Transaction", response.data);

      return response.data;
    } catch (err) {
      console.error("Error getting transaction:", err);
      setError(err.response?.data?.message || err.message);
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  return {
    addTransaction,
    getAllTransactions,
    getTransaction,
    transactions,
    isLoading,
    error,
  };
}
