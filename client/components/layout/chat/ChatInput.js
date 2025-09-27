"use client";

import { forwardRef } from "react";
import { Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const ChatInput = forwardRef(
  (
    { value, onSend, onChange, isOnline, disabled, isLoading, onKeyPress },
    ref
  ) => {
    return (
      <div className="border-t bg-background p-4">
        <div className="flex gap-2">
          <Input
            ref={ref}
            value={value}
            onChange={onChange}
            disabled={disabled}
            onKeyDown={onKeyPress}
            placeholder={
              isOnline
                ? "Ask me anything about your wallet..."
                : "You're offline"
            }
            className="flex-1"
          />

          <Button
            onClick={onSend}
            disabled={!value.trim() || disabled}
            size="sm"
            className="px-3"
          >
            {isLoading ? (
              <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>

        <p className="text-xs text-muted-foreground mt-2">
          {isOnline
            ? "I can help with transactions, balances, contacts, and crypto questions"
            : "Some features may be limited while offline"}
        </p>
      </div>
    );
  }
);

ChatInput.displayName = "ChatInput";
export default ChatInput;
