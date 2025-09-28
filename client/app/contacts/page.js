"use client";

import { Plus, Search } from "lucide-react";
import { useState, useEffect, useMemo } from "react";

import {
  Dialog,
  DialogTitle,
  DialogHeader,
  DialogContent,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

import {
  useNetworkSettings,
  useAvailableNetworks,
} from "@/stores/useNetworkStore";

import {
  useSearchQuery,
  useContactsData,
  useContactsStore,
  useContactsError,
  useContactsLoading,
} from "@/stores/useContactsStore";

import ContactList from "@/components/layout/contacts/ContactList";
import ContactForm from "@/components/layout/contacts/ContactForm";
import ContactHeader from "@/components/layout/contacts/ContactHeader";
import ContactMessages from "@/components/layout/contacts/ContactMessages";
import { useRouter } from "next/navigation";

const ContactPage = () => {
  const {
    addContact,
    clearError,
    updateContact,
    deleteContact,
    fetchContacts,
    setSearchQuery,
  } = useContactsStore();

  const router = useRouter();

  const error = useContactsError();
  const contacts = useContactsData();
  const searchQuery = useSearchQuery();
  const isLoading = useContactsLoading();

  // Filter contacts in component with useMemo to prevent re-renders
  const filteredContacts = useMemo(() => {
    if (!searchQuery) {
      return [...contacts].sort(
        (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
      );
    }

    const query = searchQuery.toLowerCase();

    return contacts
      .filter(
        (contact) =>
          contact.name.toLowerCase().includes(query) ||
          contact.address.toLowerCase().includes(query) ||
          contact.network.toLowerCase().includes(query) ||
          contact.note?.toLowerCase().includes(query)
      )
      .sort((a, b) => b.updatedAt.getTime() - a.updatedAt.getTime());
  }, [contacts, searchQuery]);

  // Network data
  const networkSettings = useNetworkSettings();
  const availableNetworksRaw = useAvailableNetworks();

  // const availableNetworks = useMemo(() => {
  //   return availableNetworksRaw.filter(
  //     (n) => networkSettings.showTestnets || !n.isTestnet
  //   );
  // }, [availableNetworksRaw, networkSettings.showTestnets]);

  const availableNetworks = availableNetworksRaw;

  // Local state
  const [formData, setFormData] = useState({
    note: "",
    name: "",
    address: "",
    network: "",
  });
  const [formErrors, setFormErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [editingContact, setEditingContact] = useState(null);
  const [isAddingContact, setIsAddingContact] = useState(false);

  // Initialize form with first available network
  useEffect(() => {
    if (availableNetworks.length > 0 && !formData.network) {
      setFormData((prev) => ({ ...prev, network: availableNetworks[0].id }));
    }
  }, [availableNetworks, formData.network]);

  // Fetch contacts on mount
  useEffect(() => {
    fetchContacts();
  }, [fetchContacts]);

  // Clear success message after delay
  useEffect(() => {
    if (successMessage) {
      const timer = setTimeout(() => setSuccessMessage(""), 3000);
      return () => clearTimeout(timer);
    }
  }, [successMessage]);

  // Form validation
  const validateForm = (data) => {
    const errors = {};

    if (!data.name.trim()) {
      errors.name = "Name is required";
    }

    if (!data.address.trim()) {
      errors.address = "Address is required";
    } else if (!/^0x[a-fA-F0-9]{40}$/.test(data.address.trim())) {
      errors.address = "Invalid wallet address format";
    }

    if (!data.network) {
      errors.network = "Network is required";
    }

    return errors;
  };

  // Reset form data
  const resetForm = () => {
    setFormData({
      name: "",
      note: "",
      address: "",
      network: availableNetworks[0]?.id || "",
    });
    setFormErrors({});
    setEditingContact(null);
  };

  // Handle form submission (add or edit)
  const handleFormSubmit = async () => {
    const errors = validateForm(formData);
    setFormErrors(errors);

    if (Object.keys(errors).length > 0) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (editingContact) {
        await updateContact(editingContact.id, formData);
        setEditingContact(null);
        setSuccessMessage("Contact updated!");
      } else {
        await addContact(formData);
        setIsAddingContact(false);
        setSuccessMessage("Contact added!");
      }

      resetForm();
    } catch (error) {
      // Error handled by store
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle form cancellation
  const handleFormCancel = () => {
    setIsAddingContact(false);
    setEditingContact(null);
    resetForm();
  };

  // Handle edit contact
  const handleEditContact = (contact) => {
    setFormData({
      name: contact.name,
      note: contact.note || "",
      address: contact.address,
      network: contact.network,
    });

    setEditingContact(contact);
  };

  // Handle delete contact
  const handleDeleteContact = async (id) => {
    try {
      await deleteContact(id);
      setSuccessMessage("Contact deleted!");
    } catch (error) {
      // Error handled by store
    }
  };

  // Get network icon
  const getNetworkIcon = (networkId) => {
    const network = availableNetworks.find((n) => n.id === networkId);
    return network?.icon || "◎";
  };

  // Get network name
  const getNetworkName = (networkId) => {
    const network = availableNetworks.find((n) => n.id === networkId);
    return network?.name || networkId;
  };

  // Handle back navigation (for standalone use)
  const handleBack = () => {
    router.push("/dashboard");
  };

  return (
    <div className="flex flex-col w-full max-w-lg mx-auto h-screen overflow-hidden pb-4">
      <Card className="border-none shadow-none rounded-b-none">
        <ContactHeader
          onBack={handleBack}
          isLoading={isLoading}
          showSelectMode={false}
          contactsCount={contacts.length}
        />

        <div className="space-y-4">
          <ContactMessages
            error={error}
            onClearError={clearError}
            successMessage={successMessage}
          />

          {contacts.length > 0 && (
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />

              <Input
                value={searchQuery}
                className="pl-10"
                placeholder="Search contacts..."
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          )}
        </div>
      </Card>

      <Dialog open={isAddingContact} onOpenChange={setIsAddingContact}>
        <DialogTrigger asChild>
          <Button className="w-full">
            <Plus className="w-4 h-4 mr-2" />
            Add New Contact
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Contact</DialogTitle>

            <DialogDescription>
              Save a wallet address for easy access later
            </DialogDescription>
          </DialogHeader>

          <ContactForm
            formData={formData}
            setFormData={setFormData}
            formErrors={formErrors}
            isSubmitting={isSubmitting}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            availableNetworks={availableNetworks}
            isEdit={false}
          />
        </DialogContent>
      </Dialog>

      <Dialog
        open={!!editingContact}
        onOpenChange={(open) => !open && setEditingContact(null)}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Contact</DialogTitle>

            <DialogDescription>Update contact information</DialogDescription>
          </DialogHeader>

          <ContactForm
            formData={formData}
            setFormData={setFormData}
            formErrors={formErrors}
            isSubmitting={isSubmitting}
            onSubmit={handleFormSubmit}
            onCancel={handleFormCancel}
            availableNetworks={availableNetworks}
            isEdit={true}
          />
        </DialogContent>
      </Dialog>

      <ContactList
        isLoading={isLoading}
        searchQuery={searchQuery}
        contacts={filteredContacts}
        showSelectMode={false}
        getNetworkIcon={getNetworkIcon}
        getNetworkName={getNetworkName}
        onSelectContact={null}
        onEditContact={handleEditContact}
        onDeleteContact={handleDeleteContact}
      />
    </div>
  );
};

export default ContactPage;
