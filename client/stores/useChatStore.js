import { create } from "zustand";

const callAPI = async (message) => {
  const response = await fetch("/api/chat", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      message: message,
    }),
  });

  if (!response.ok) {
    throw new Error(`API Error: ${response.status}`);
  }

  const data = await response.json();

  return {
    content:
      data.response || data.message || "Sorry, I couldn't understand that.",
    actions: data.actions || [], // Optional action buttons from your backend
  };
};

// Better fallback responses with network context
const getFallbackResponse = (userInput, currentNetwork) => {
  const input = userInput.toLowerCase();

  if (input.includes("send") || input.includes("transfer")) {
    return {
      content: `I can help you send cryptocurrency on ${
        currentNetwork?.name || "Hedera"
      }! Let me guide you through a secure transaction.`,
      actions: [
        { type: "send_transaction", label: "Start Transaction" },
        { type: "view_contacts", label: "Choose from Contacts" },
      ],
    };
  }

  if (input.includes("balance") || input.includes("wallet")) {
    return {
      content: `You're connected to ${
        currentNetwork?.name || "Hedera"
      }. Let me help you check your balance and wallet details.`,
      actions: [
        { type: "view_balance", label: "View Balance" },
        { type: "switch_network", label: "Switch Network" },
      ],
    };
  }

  if (input.includes("contact") || input.includes("address")) {
    return {
      content:
        "I can help you manage wallet contacts for safer and easier transactions.",
      actions: [
        { type: "view_contacts", label: "Manage Contacts" },
        { type: "send_transaction", label: "Send to Contact" },
      ],
    };
  }

  if (input.includes("network") || input.includes("chain")) {
    return {
      content: `Currently connected to ${
        currentNetwork?.name || "Hedera"
      }. I can explain different networks or help you switch.`,
      actions: [
        { type: "switch_network", label: "Switch Network" },
        { type: "view_balance", label: "Check Balance" },
      ],
    };
  }

  if (
    input.includes("help") ||
    input.includes("what") ||
    input.includes("how")
  ) {
    return {
      content:
        "I'm your AI wallet assistant! I can help with transactions, check balances, manage contacts, explain crypto concepts, and guide you through wallet operations. What would you like to do?",
      actions: [
        { type: "send_transaction", label: "Send Transaction" },
        { type: "view_balance", label: "Check Balance" },
        { type: "view_contacts", label: "View Contacts" },
        { type: "switch_network", label: "Switch Network" },
      ],
    };
  }

  // Default response
  return {
    content:
      "I'm here to help with your wallet! I can assist with transactions, balances, contacts, and crypto questions. What would you like to know?",
    actions: [
      { type: "send_transaction", label: "Send Crypto" },
      { type: "view_balance", label: "Check Balance" },
      { type: "view_contacts", label: "Contacts" },
      { type: "switch_network", label: "Networks" },
    ],
  };
};

export const useChatStore = create((set, get) => ({
  messages: [],
  isLoading: false,
  error: null,

  // Initialize with welcome message
  initializeChat: () => {
    const welcomeMessage = {
      id: `msg_${Date.now()}`,
      type: "assistant",
      content:
        "Hello! I'm your AI wallet assistant. I can help with transactions, balances, contacts, and crypto questions. What would you like to do?",
      timestamp: new Date().toISOString(),
      actions: [
        { type: "send_transaction", label: "Send Transaction" },
        { type: "view_balance", label: "Check Balance" },
        { type: "view_contacts", label: "View Contacts" },
        { type: "switch_network", label: "Switch Network" },
      ],
    };

    set({ messages: [welcomeMessage] });
  },

  // Send message - simple!
  sendMessage: async (content, currentNetwork) => {
    const { messages, isLoading } = get();

    if (!content.trim() || isLoading) return;

    // Add user message
    const userMessage = {
      id: `msg_${Date.now()}`,
      type: "user",
      content: content.trim(),
      timestamp: new Date().toISOString(),
    };

    set({
      messages: [...messages, userMessage],
      isLoading: true,
      error: null,
    });

    try {
      // Call your backend
      const response = await callAPI(content);

      // Add AI response
      const aiMessage = {
        id: `msg_${Date.now() + 1}`,
        type: "assistant",
        content: response.content,
        timestamp: new Date().toISOString(),
        actions: response.actions,
      };

      set((state) => ({
        messages: [...state.messages, aiMessage],
        isLoading: false,
      }));
    } catch (error) {
      console.error("API failed:", error);

      // Use fallback with current network context
      const fallbackResponse = getFallbackResponse(content, currentNetwork);
      const aiMessage = {
        id: `msg_${Date.now() + 1}`,
        type: "assistant",
        content: fallbackResponse.content,
        timestamp: new Date().toISOString(),
        actions: fallbackResponse.actions,
      };

      set((state) => ({
        messages: [...state.messages, aiMessage],
        isLoading: false,
        error: "API unavailable, using offline responses",
      }));
    }
  },

  // Handle action button clicks
  executeAction: async (action, router) => {
    const { messages } = get();

    // Add user action as message
    const actionMessage = {
      type: "user",
      id: `msg_${Date.now()}`,
      content: `[Action: ${action.label}]`,
      timestamp: new Date().toISOString(),
    };

    set({ messages: [...messages, actionMessage], isLoading: true });

    try {
      switch (action.type) {
        case "send_transaction":
          // router.push("/send");

          setTimeout(() => {
            const confirmMessage = {
              type: "assistant",
              id: `msg_${Date.now() + 1}`,
              timestamp: new Date().toISOString(),
              actions: [{ type: "view_contacts", label: "Choose Recipient" }],
              content:
                "Opening transaction interface. I'll help you send crypto safely!",
            };

            set((state) => ({
              messages: [...state.messages, confirmMessage],
              isLoading: false,
            }));
          }, 200);
          break;

        case "view_balance":
          // router.push("/balance");

          setTimeout(() => {
            const balanceMessage = {
              type: "assistant",
              id: `msg_${Date.now() + 1}`,
              timestamp: new Date().toISOString(),
              content:
                "Opening balance view. You can see all your assets and transaction history here.",
              actions: [
                { type: "send_transaction", label: "Send Crypto" },
                { type: "switch_network", label: "Switch Network" },
              ],
            };

            set((state) => ({
              messages: [...state.messages, balanceMessage],
              isLoading: false,
            }));
          }, 200);
          break;

        case "view_contacts":
          // router.push("/contacts");

          setTimeout(() => {
            const contactsMessage = {
              type: "assistant",
              id: `msg_${Date.now() + 1}`,
              timestamp: new Date().toISOString(),
              actions: [{ type: "send_transaction", label: "Send to Contact" }],
              content:
                "Opening contacts manager. You can add, edit, and organize your wallet addresses here.",
            };

            set((state) => ({
              messages: [...state.messages, contactsMessage],
              isLoading: false,
            }));
          }, 200);
          break;

        case "switch_network":
          // router.push("/networks");

          setTimeout(() => {
            const networkMessage = {
              type: "assistant",
              id: `msg_${Date.now() + 1}`,
              timestamp: new Date().toISOString(),
              actions: [{ type: "view_balance", label: "Check New Balance" }],
              content:
                "Opening network selector. You can switch between different blockchain networks here.",
            };

            set((state) => ({
              messages: [...state.messages, networkMessage],
              isLoading: false,
            }));
          }, 200);
          break;

        default:
          throw new Error(`Unknown action type: ${action.type}`);
      }

      // Analytics
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "ai_action_executed", {
          action_type: action.type,
          action_label: action.label,
        });
      }
    } catch (error) {
      console.error("Action execution error:", error);
      set({
        error: `Failed to execute ${action.label}. Please try again.`,
        isLoading: false,
      });
    }
  },

  clearError: () => set({ error: null }),
}));
