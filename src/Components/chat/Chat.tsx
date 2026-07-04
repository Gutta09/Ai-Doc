"use client";

import { useChat } from "@ai-sdk/react";
import type { Message } from "ai";
import { toast } from "sonner";
import Messages from "./Messages";
import ChatInput from "./ChatInput";

interface ChatProps {
  fileId: string;
  initialMessages: Message[];
}

const Chat = ({ fileId, initialMessages }: ChatProps) => {
  const { messages, input, handleInputChange, handleSubmit, status } = useChat({
    api: "/api/message",
    initialMessages,
    body: { fileId },
    onError: () => {
      toast.error("Something went wrong. Please try again.");
    },
  });

  const isLoading = status === "submitted" || status === "streaming";

  return (
    <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
      <div className="flex-1 justify-between flex flex-col mb-28">
        <Messages messages={messages} isLoading={isLoading} />
      </div>

      <ChatInput
        input={input}
        handleInputChange={handleInputChange}
        handleSubmit={handleSubmit}
        isLoading={isLoading}
      />
    </div>
  );
};

export default Chat;
