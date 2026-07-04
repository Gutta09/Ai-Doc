"use client";

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import type { Message } from "ai";
import Chat from "./Chat";

interface ChatSessionProps {
  fileId: string;
}

type DBMessage = {
  id: string;
  isUserMessage: boolean;
  text: string;
  createdAt: string;
};

const ChatSession = ({ fileId }: ChatSessionProps) => {
  const { data, isLoading } = useQuery<{ messages: DBMessage[] }>({
    queryKey: ["messages", fileId],
    queryFn: async () => {
      const res = await fetch(`/api/files/${fileId}/messages?limit=50`);
      if (!res.ok) throw new Error("Failed to load messages");
      return res.json();
    },
  });

  if (isLoading) {
    return (
      <div className="relative min-h-full bg-zinc-50 flex flex-col justify-center items-center gap-2">
        <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
        <p className="text-zinc-500 text-sm">Loading conversation...</p>
      </div>
    );
  }

  // API returns newest-first; reverse to chronological order for the chat.
  const initialMessages: Message[] = (data?.messages ?? [])
    .slice()
    .reverse()
    .map((m) => ({
      id: m.id,
      role: m.isUserMessage ? "user" : "assistant",
      content: m.text,
    }));

  return <Chat fileId={fileId} initialMessages={initialMessages} />;
};

export default ChatSession;
