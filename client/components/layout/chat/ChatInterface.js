"use client";

import { useRef, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

import { useChatStore } from "@/stores/useChatStore";
import { useCurrentNetwork } from "@/stores/useNetworkStore";

import ChatInput from "./ChatInput";
import ChatHeader from "./ChatHeader";
import MessagesList from "./MessagesList";
import ChatErrorAlert from "./ChatErrorAlert";

const AIChatInterface = () => {
  const router = useRouter();

  const inputRef = useRef(null);
  const messagesEndRef = useRef(null);

  const [inputValue, setInputValue] = useState("");

  // Chat state
  const {
    error,
    messages,
    isLoading,
    clearError,
    sendMessage,
    executeAction,
    initializeChat,
  } = useChatStore();

  // Network state
  const currentNetwork = useCurrentNetwork();

  // Initialize chat once on mount
  useEffect(() => {
    initializeChat();
  }, [initializeChat]);

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSendMessage = async () => {
    if (inputValue.trim()) {
      await sendMessage(inputValue, currentNetwork);
      setInputValue("");
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // UPDATED: Use executeAction from store
  const handleActionClick = async (action) => {
    await executeAction(action, router);
  };

  const isOnline = typeof window !== "undefined" && navigator.onLine;

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto h-screen">
      <ChatHeader isOnline={isOnline} />

      <ChatErrorAlert error={error} onDismiss={clearError} />

      <div className="flex-1 flex flex-col overflow-hidden">
        <MessagesList
          ref={messagesEndRef}
          messages={messages}
          isTyping={isLoading}
          onActionClick={handleActionClick}
        />

        <ChatInput
          ref={inputRef}
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onSend={handleSendMessage}
          onKeyPress={handleKeyPress}
          disabled={isLoading || !isOnline}
          isLoading={isLoading}
          isOnline={isOnline}
        />
      </div>
    </div>
  );
};

export default AIChatInterface;
