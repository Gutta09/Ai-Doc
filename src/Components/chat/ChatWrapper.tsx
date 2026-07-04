"use client";

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, Loader2, XCircle } from "lucide-react";
import type { UploadStatus } from "@prisma/client";
import { buttonVariants } from "../ui/button";
import ChatSession from "./ChatSession";

interface ChatWrapperProps {
  fileId: string;
  status: UploadStatus;
}

const ChatWrapper = ({ fileId, status }: ChatWrapperProps) => {
  // Poll the file's processing status until it is done (or failed).
  const { data: file } = useQuery<{ uploadStatus: UploadStatus }>({
    queryKey: ["file-status", fileId],
    queryFn: async () => {
      const res = await fetch(`/api/files/${fileId}`);
      if (!res.ok) throw new Error("Failed to load file status");
      return res.json();
    },
    initialData: { uploadStatus: status },
    refetchInterval: (query) => {
      const s = query.state.data?.uploadStatus;
      return s === "SUCCESS" || s === "FAILED" ? false : 1000;
    },
  });

  const uploadStatus = file?.uploadStatus ?? status;

  if (uploadStatus === "PROCESSING" || uploadStatus === "PENDING") {
    return (
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        <div className="flex-1 flex justify-center items-center flex-col mb-28">
          <div className="flex flex-col items-center gap-2">
            <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            <h3 className="font-semibold text-xl">Processing PDF...</h3>
            <p className="text-zinc-500 text-sm">This won&apos;t take long.</p>
          </div>
        </div>
      </div>
    );
  }

  if (uploadStatus === "FAILED") {
    return (
      <div className="relative min-h-full bg-zinc-50 flex divide-y divide-zinc-200 flex-col justify-between gap-2">
        <div className="flex-1 flex justify-center items-center flex-col mb-28">
          <div className="flex flex-col items-center gap-2">
            <XCircle className="h-8 w-8 text-red-500" />
            <h3 className="font-semibold text-xl">Processing failed</h3>
            <p className="text-zinc-500 text-sm">
              We couldn&apos;t read this PDF. Try uploading a different file.
            </p>
            <Link
              href="/dashboard"
              className={buttonVariants({
                variant: "secondary",
                className: "mt-4",
              })}
            >
              <ChevronLeft className="h-3 w-3 mr-1.5" />
              Back to dashboard
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <ChatSession fileId={fileId} />;
};

export default ChatWrapper;
