"use client";

import { Send } from "lucide-react";
import TextareaAutosize from "react-textarea-autosize";
import { Button } from "../ui/button";

interface ChatInputProps {
  input: string;
  handleInputChange: (
    e: React.ChangeEvent<HTMLTextAreaElement> | React.ChangeEvent<HTMLInputElement>
  ) => void;
  handleSubmit: (e?: { preventDefault?: () => void }) => void;
  isLoading: boolean;
}

const ChatInput = ({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
}: ChatInputProps) => {
  return (
    <div className="absolute bottom-0 left-0 w-full">
      <div className="mx-2 flex flex-row gap-3 md:mx-4 md:last:mb-6 lg:mx-auto lg:max-w-2xl xl:max-w-3xl">
        <div className="relative flex h-full flex-1 items-stretch md:flex-col">
          <div className="relative flex flex-col w-full flex-grow p-4">
            <div className="relative">
              <TextareaAutosize
                rows={1}
                maxRows={4}
                autoFocus
                value={input}
                onChange={handleInputChange}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (!isLoading && input.trim().length > 0) {
                      handleSubmit();
                    }
                  }
                }}
                placeholder="Ask a question about this document..."
                className="resize-none pr-12 text-base py-3 scrollbar-thumb-rounded scrollbar-thumb-blue scrollbar-track-blue-lighter scrollbar-w-2 scrolling-touch bg-white rounded-md border border-zinc-200 focus:outline-none focus:ring-2 focus:ring-blue-500 w-full"
              />

              <Button
                disabled={isLoading || input.trim().length === 0}
                className="absolute bottom-1.5 right-[8px]"
                aria-label="send message"
                onClick={() => handleSubmit()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
