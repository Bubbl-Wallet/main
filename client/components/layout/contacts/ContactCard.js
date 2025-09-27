"use client";

import { useState, useEffect } from "react";
import { Edit, Trash2, Send, CheckCircle2, Copy } from "lucide-react";

import {
  AlertDialog,
  AlertDialogTitle,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogContent,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";

const ContactCard = ({
  contact,
  onEditContact,
  showSelectMode,
  getNetworkIcon,
  getNetworkName,
  onSelectContact,
  onDeleteContact,
}) => {
  const [isCopied, setIsCopied] = useState(false);

  // Clear copied state after delay
  useEffect(() => {
    if (isCopied) {
      const timer = setTimeout(() => setIsCopied(false), 2000);
      return () => clearTimeout(timer);
    }
  }, [isCopied]);

  // Handle copy address internally
  const handleCopyAddress = async (address) => {
    try {
      await navigator.clipboard.writeText(address);
      setIsCopied(true);
    } catch (error) {
      console.error("Failed to copy:", error);
    }
  };

  return (
    <div className="flex items-start justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors">
      <div className="flex-1">
        <div className="flex items-center space-x-2 mb-2">
          <div className="w-8 h-8 bg-primary/10 rounded-full flex items-center justify-center">
            <span className="text-sm">{getNetworkIcon(contact.network)}</span>
          </div>

          <div>
            <div className="font-medium">{contact.name}</div>
            <div className="text-xs text-muted-foreground">
              {getNetworkName(contact.network)}
            </div>
          </div>
        </div>

        <div
          className="text-sm font-mono text-muted-foreground mb-1 cursor-pointer hover:text-foreground transition-colors flex items-center space-x-2 group"
          onClick={() => handleCopyAddress(contact.address)}
          title="Click to copy address"
        >
          <span>
            {contact.address.slice(0, 10)}...{contact.address.slice(-8)}
          </span>

          {isCopied ? (
            <CheckCircle2 className="w-3 h-3 text-green-600" />
          ) : (
            <Copy className="w-3 h-3 opacity-50 group-hover:opacity-100 transition-opacity" />
          )}
        </div>

        {contact.note && (
          <div className="text-xs text-muted-foreground">{contact.note}</div>
        )}
      </div>

      <div className="flex items-center space-x-1 ml-2">
        {showSelectMode && onSelectContact ? (
          <Button size="sm" onClick={() => onSelectContact(contact)}>
            <Send className="w-3 h-3 mr-1" />
            Select
          </Button>
        ) : (
          <>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onEditContact(contact)}
            >
              <Edit className="w-3 h-3" />
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="ghost" size="sm">
                  <Trash2 className="w-3 h-3" />
                </Button>
              </AlertDialogTrigger>

              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete Contact</AlertDialogTitle>
                </AlertDialogHeader>

                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>

                  <AlertDialogAction
                    onClick={() => onDeleteContact(contact.id)}
                    className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </>
        )}
      </div>
    </div>
  );
};

export default ContactCard;
