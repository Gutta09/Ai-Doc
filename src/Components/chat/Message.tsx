"use client";

import ReactMarkdown from "react-markdown";
import { Bot, User2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface MessageProps {
  role: "user" | "assistant";
  content: string;
}

const Message = ({ role, content }: MessageProps) => {
  const isUser = role === "user";

  return (
    <div className={cn("flex items-end", { "justify-end": isUser })}>
      <div
        className={cn(
          "relative flex h-6 w-6 aspect-square items-center justify-center rounded-sm",
          {
            "order-2 bg-blue-600 text-white": isUser,
            "order-1 bg-zinc-800 text-white": !isUser,
          }
        )}
      >
        {isUser ? (
          <User2 className="h-3/4 w-3/4" />
        ) : (
          <Bot className="h-3/4 w-3/4" />
        )}
      </div>

      <div
        className={cn("flex flex-col space-y-2 text-sm max-w-md mx-2", {
          "order-1 items-end": isUser,
          "order-2 items-start": !isUser,
        })}
      >
        <div
          className={cn(
            "px-4 py-2 rounded-lg inline-block prose prose-sm max-w-none break-words",
            {
              "bg-blue-600 text-white prose-invert": isUser,
              "bg-gray-200 text-gray-900": !isUser,
            }
          )}
        >
          <ReactMarkdown>{content}</ReactMarkdown>
        </div>
      </div>
    </div>
  );
};

export default Message;
