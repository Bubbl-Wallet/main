"use client";

import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, CheckCircle2 } from "lucide-react";

const ContactMessages = ({ successMessage, error, onClearError }) => {
  if (!successMessage && !error) return null;

  return (
    <div className="space-y-2">
      {successMessage && (
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-800">
            {successMessage}
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="w-4 h-4" />
          <AlertDescription className="flex items-center justify-between">
            <span>{error}</span>
            <Button variant="ghost" size="sm" onClick={onClearError}>
              ×
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default ContactMessages;
