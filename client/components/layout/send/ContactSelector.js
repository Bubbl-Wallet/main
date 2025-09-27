import React from "react";
import { ArrowLeft, Users } from "lucide-react";

import {
  Card,
  CardTitle,
  CardHeader,
  CardContent,
  CardDescription,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const ContactSelector = ({
  onBack,
  contacts,
  selectedNetwork,
  onSelectContact,
}) => {
  const formatAddress = (address) =>
    `${address.slice(0, 6)}...${address.slice(-4)}`;

  return (
    <div className="w-full max-w-md mx-auto mt-4">
      <Card>
        <CardHeader>
          <div className="flex items-center space-x-3">
            <Button variant="ghost" size="sm" onClick={onBack}>
              <ArrowLeft className="w-4 h-4" />
            </Button>

            <div>
              <CardTitle>Select Contact</CardTitle>

              <CardDescription>
                Choose a recipient from your contacts
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-2">
          {!contacts || contacts.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <Users className="w-8 h-8 mx-auto mb-2" />

              <p>No contacts found</p>
              <p className="text-xs">Add contacts to use this feature</p>
            </div>
          ) : (
            contacts.map((contact) => (
              <div
                key={contact.id}
                className="p-3 border rounded-lg cursor-pointer hover:bg-accent transition-colors"
                onClick={() => onSelectContact(contact)}
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="font-medium">{contact.name}</div>

                    <div className="text-sm text-muted-foreground font-mono">
                      {formatAddress(contact.address)}
                    </div>

                    {contact.note && (
                      <div className="text-xs text-muted-foreground mt-1">
                        {contact.note}
                      </div>
                    )}
                  </div>

                  <Badge variant="outline" className="text-xs ml-2">
                    {selectedNetwork?.name}
                  </Badge>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default ContactSelector;
