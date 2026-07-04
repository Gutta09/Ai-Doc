"use client";

import { useEffect, useRef } from "react";
import type { Message as AIMessage } from "ai";
import { Loader2, MessageSquare } from "lucide-react";
import Message from "./Message";

interface MessagesProps {
  messages: AIMessage[];
  isLoading: boolean;
}

const Messages = ({ messages, isLoading }: MessagesProps) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const showThinking =
    isLoading && messages[messages.length - 1]?.role !== "assistant";

  return (
    <div className="flex max-h-[calc(100vh-3.5rem-7rem)] border-zinc-200 flex-1 flex-col-reverse gap-4 p-3 overflow-y-auto scrollbar-thumb-blue scrollbar-thumb-rounded scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch">
      <div ref={bottomRef} />

      {showThinking ? (
        <div className="flex items-center gap-2 text-sm text-zinc-500 px-2">
          <Loader2 className="h-4 w-4 animate-spin" />
          AI Doc is thinking...
        </div>
      ) : null}

      {messages.length > 0 ? (
        messages
          .slice()
          .reverse()
          .map((message, i) => (
            <Message
              key={message.id ?? i}
              role={message.role === "user" ? "user" : "assistant"}
              content={message.content}
            />
          ))
      ) : (
        <div className="flex-1 flex flex-col items-center justify-center gap-2">
          <MessageSquare className="h-8 w-8 text-blue-500" />
          <h3 className="font-semibold text-xl">You&apos;re all set!</h3>
          <p className="text-zinc-500 text-sm">
            Ask your first question about this document.
          </p>
        </div>
      )}
    </div>
  );
};

export default Messages;
