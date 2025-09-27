"use client";

import { AlertCircle, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const ChatErrorAlert = ({ error, onDismiss }) => {
  if (!error) return null;

  return (
    <div className="px-4 pb-2 mt-2">
      <Alert variant="destructive" className="relative pr-10">
        <AlertCircle className="h-4 w-4" />

        <AlertDescription className="text-sm">{error}</AlertDescription>

        <Button
          variant="ghost"
          size="sm"
          className="absolute right-1 top-1 h-6 w-6 p-0"
          onClick={onDismiss}
        >
          <X className="h-3 w-3" />
        </Button>
      </Alert>
    </div>
  );
};

export default ChatErrorAlert;
