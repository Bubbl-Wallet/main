"use client";

import { Brain } from "lucide-react";

const TypingIndicator = () => {
  return (
    <div className="flex gap-3">
      <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center flex-shrink-0">
        <Brain className="w-4 h-4 text-primary" />
      </div>

      <div className="bg-muted p-3 rounded-lg rounded-bl-sm">
        <div className="flex space-x-1">
          <div className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce" />

          <div
            className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"
            style={{ animationDelay: "0.1s" }}
          />

          <div
            className="w-2 h-2 bg-muted-foreground/60 rounded-full animate-bounce"
            style={{ animationDelay: "0.2s" }}
          />
        </div>
      </div>
    </div>
  );
};

export default TypingIndicator;
