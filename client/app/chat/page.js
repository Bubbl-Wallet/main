"use client";

import { Suspense } from "react";

import { ChatSkeleton } from "@/components/layout/chat/ChatSkeleton";
import ChatInterface from "@/components/layout/chat/ChatInterface";

export default function ChatPage() {
  return (
    <Suspense fallback={<ChatSkeleton />}>
      <ChatInterface />
    </Suspense>
  );
}
