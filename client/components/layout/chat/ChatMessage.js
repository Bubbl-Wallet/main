"use client";

import { useState, useCallback } from "react";
import { User, Brain, Copy, Check } from "lucide-react";

import { cn } from "@/lib/utils";

import { Button } from "@/components/ui/button";

const ChatMessage = ({ message, onActionClick }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(message.content);
      setCopied(true);

      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement("textarea");

      textArea.value = message.content;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand("copy");
      document.body.removeChild(textArea);

      setCopied(true);

      setTimeout(() => setCopied(false), 2000);
    }
  }, [message.content]);

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();

    const diff = now - date;
    const minutes = Math.floor(diff / 60000);

    if (minutes < 1) return "now";
    if (minutes < 60) return `${minutes}m`;
    if (minutes < 1440) return `${Math.floor(minutes / 60)}h`;

    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isUser = message.type === "user";

  return (
    <div className={cn("flex gap-3", isUser ? "flex-row-reverse" : "flex-row")}>
      <div
        className={cn(
          "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
          isUser ? "bg-primary text-primary-foreground" : "bg-muted"
        )}
      >
        {isUser ? (
          <User className="w-4 h-4" />
        ) : (
          <Brain className="w-4 h-4 text-primary" />
        )}
      </div>

      <div
        className={cn("flex-1 space-y-1", isUser ? "text-right" : "text-left")}
      >
        <div
          className={cn(
            "inline-block p-3 rounded-lg max-w-[85%]",
            isUser
              ? "bg-primary text-primary-foreground rounded-br-sm"
              : "bg-muted rounded-bl-sm"
          )}
        >
          <p className="text-sm leading-relaxed whitespace-pre-wrap">
            {message.content}
          </p>

          {message.actions && message.actions.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {message.actions.map((action, index) => (
                <Button
                  key={index}
                  variant="outline"
                  size="sm"
                  className="h-7 text-xs bg-background/50 hover:bg-background"
                  onClick={() => onActionClick(action)}
                >
                  {action.label}
                </Button>
              ))}
            </div>
          )}
        </div>

        <div
          className={cn(
            "flex items-center gap-1 text-xs text-muted-foreground",
            isUser ? "justify-end" : "justify-start"
          )}
        >
          <time dateTime={message.timestamp}>
            {formatTime(message.timestamp)}
          </time>

          <Button
            size="sm"
            variant="ghost"
            onClick={handleCopy}
            className="h-4 w-4 p-0 hover:bg-transparent"
          >
            {copied ? (
              <Check className="w-3 h-3 text-green-600" />
            ) : (
              <Copy className="w-3 h-3" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatMessage;
