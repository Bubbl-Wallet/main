// stores/useContactsStore.js
import { create } from "zustand";
import { persist } from "zustand/middleware";

// Utils
const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const generateId = () =>
  `contact_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

export const useContactsStore = create(
  persist(
    (set, get) => ({
      // Core state
      contacts: [],
      isLoading: false,
      error: null,
      searchQuery: "",

      // Actions
      addContact: async (contactData) => {
        set({ isLoading: true, error: null });

        try {
          await delay(300);

          const newContact = {
            ...contactData,
            id: generateId(),
            createdAt: new Date(),
            updatedAt: new Date(),
          };

          set((state) => ({
            contacts: [...state.contacts, newContact],
            isLoading: false,
          }));
        } catch (error) {
          set({ error: "Failed to add contact", isLoading: false });
          throw error;
        }
      },

      updateContact: async (id, updates) => {
        set({ isLoading: true, error: null });

        try {
          await delay(200);

          set((state) => ({
            contacts: state.contacts.map((contact) =>
              contact.id === id
                ? { ...contact, ...updates, updatedAt: new Date() }
                : contact
            ),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: "Failed to update contact", isLoading: false });
          throw error;
        }
      },

      deleteContact: async (id) => {
        set({ isLoading: true, error: null });

        try {
          await delay(200);

          set((state) => ({
            contacts: state.contacts.filter((contact) => contact.id !== id),
            isLoading: false,
          }));
        } catch (error) {
          set({ error: "Failed to delete contact", isLoading: false });
          throw error;
        }
      },

      fetchContacts: async () => {
        set({ isLoading: true, error: null });

        try {
          await delay(500);
          set({ isLoading: false });
        } catch (error) {
          set({ error: "Failed to fetch contacts", isLoading: false });
        }
      },

      setSearchQuery: (query) => set({ searchQuery: query }),
      clearError: () => set({ error: null }),
    }),
    {
      name: "contacts-storage",
      partialize: (state) => ({
        contacts: state.contacts,
      }),
      onRehydrateStorage: () => (state) => {
        if (state && state.contacts) {
          state.contacts = state.contacts.map((contact) => ({
            ...contact,
            createdAt: new Date(contact.createdAt),
            updatedAt: new Date(contact.updatedAt),
          }));
        }
      },
    }
  )
);

// Simple selectors - these are stable
export const useContactsData = () =>
  useContactsStore((state) => state.contacts);
export const useContactsLoading = () =>
  useContactsStore((state) => state.isLoading);
export const useContactsError = () => useContactsStore((state) => state.error);
export const useSearchQuery = () =>
  useContactsStore((state) => state.searchQuery);
