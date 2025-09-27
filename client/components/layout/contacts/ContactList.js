import { User, Loader2 } from "lucide-react";

import ContactCard from "./ContactCard";

const ContactList = ({
  contacts,
  isLoading,
  searchQuery,
  onEditContact,
  showSelectMode,
  getNetworkIcon,
  getNetworkName,
  onSelectContact,
  onDeleteContact,
}) => {
  if (isLoading && contacts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <Loader2 className="w-8 h-8 mx-auto mb-4 animate-spin" />
        <p>Loading contacts...</p>
      </div>
    );
  }

  if (contacts.length === 0) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        <User className="w-12 h-12 mx-auto mb-4 opacity-50" />
        <p>No contacts {searchQuery ? "found" : "saved yet"}</p>

        <p className="text-sm">
          {searchQuery
            ? "Try a different search term"
            : "Add contacts for quick access when sending transactions"}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-3 flex-1 overflow-y-auto mt-4 hide-scroll">
      {contacts.map((contact) => (
        <ContactCard
          key={contact.id}
          contact={contact}
          showSelectMode={showSelectMode}
          onSelectContact={onSelectContact}
          onEditContact={onEditContact}
          onDeleteContact={onDeleteContact}
          getNetworkIcon={getNetworkIcon}
          getNetworkName={getNetworkName}
        />
      ))}
    </div>
  );
};

export default ContactList;
