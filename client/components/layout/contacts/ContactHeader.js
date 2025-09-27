"use client";

import { Button } from "@/components/ui/button";
import { CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";

const ContactHeader = ({
  onBack,
  isLoading,
  contactsCount,
  showSelectMode,
}) => {
  return (
    <CardHeader className="flex items-center space-x-3 px-0">
      <Button variant="ghost" size="sm" onClick={onBack}>
        <ArrowLeft className="w-4 h-4" />
      </Button>

      <div>
        <CardTitle className="flex items-center space-x-2">
          <span>{showSelectMode ? "Select Contact" : "Contacts"}</span>
          {isLoading && <Loader2 className="w-4 h-4 animate-spin" />}
        </CardTitle>

        <CardDescription>
          {showSelectMode
            ? "Choose a contact to send to"
            : `Manage your saved wallet addresses (${contactsCount})`}
        </CardDescription>
      </div>
    </CardHeader>
  );
};

export default ContactHeader;
