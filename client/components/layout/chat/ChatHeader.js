"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Brain } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

const ChatHeader = ({ isOnline }) => {
  const router = useRouter();

  return (
    <div className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 flex items-center justify-between p-4">
      <div className="flex items-center space-x-3">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => router.back()}
          className="h-8 w-8 p-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>

        <div className="flex items-center gap-2">
          <Brain className="w-5 h-5 text-primary" />

          <div>
            <h1 className="font-semibold text-sm">AI Assistant</h1>
            <p className="text-xs text-muted-foreground">Bubbl companion</p>
          </div>
        </div>
      </div>

      <Badge
        variant={isOnline ? "secondary" : "destructive"}
        className="flex items-center gap-1 text-xs"
      >
        <div
          className={`w-2 h-2 rounded-full ${
            isOnline ? "bg-green-500" : "bg-red-500"
          }`}
        />

        {isOnline ? "Online" : "Offline"}
      </Badge>
    </div>
  );
};

export default ChatHeader;
