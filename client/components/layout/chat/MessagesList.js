"use client";

import { forwardRef } from "react";

import ChatMessage from "./ChatMessage";
import TypingIndicator from "./TypingIndicator";

const MessagesList = forwardRef(
  ({ messages, isTyping, onActionClick }, ref) => {
    return (
      <div className="flex-1 overflow-y-auto hide-scroll">
        <div className="p-4 space-y-4">
          {messages.map((message) => (
            <ChatMessage
              key={message.id}
              message={message}
              onActionClick={onActionClick}
            />
          ))}

          {isTyping && <TypingIndicator />}
        </div>

        <div ref={ref} />
      </div>
    );
  }
);

MessagesList.displayName = "MessagesList";
export default MessagesList;
