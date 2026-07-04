"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Dropzone from "react-dropzone";
import { Cloud, File as FileIcon, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { useUploadThing } from "@/lib/uploadthing";
import { Button } from "./ui/button";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "./ui/dialog";
import { cn } from "@/lib/utils";

const UploadDropzone = ({ onDone }: { onDone: () => void }) => {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { startUpload } = useUploadThing("pdfUploader");

  const startSimulatedProgress = () => {
    setUploadProgress(0);
    const interval = setInterval(() => {
      setUploadProgress((prev) => (prev >= 95 ? prev : prev + 5));
    }, 500);
    return interval;
  };

  return (
    <Dropzone
      multiple={false}
      accept={{ "application/pdf": [".pdf"] }}
      onDrop={async (acceptedFiles) => {
        setIsUploading(true);
        const progressInterval = startSimulatedProgress();

        const res = await startUpload(acceptedFiles);
        clearInterval(progressInterval);

        if (!res || res.length === 0) {
          setIsUploading(false);
          return toast.error("Something went wrong while uploading.");
        }

        setUploadProgress(100);

        const fileId = (res[0]?.serverData as { fileId?: string } | undefined)
          ?.fileId;
        if (!fileId) {
          setIsUploading(false);
          return toast.error("Upload finished but the file could not be processed.");
        }

        queryClient.invalidateQueries({ queryKey: ["files"] });
        onDone();
        router.push(`/dashboard/${fileId}`);
      }}
    >
      {({ getRootProps, getInputProps, acceptedFiles }) => (
        <div
          {...getRootProps()}
          className="border h-64 m-4 border-dashed border-gray-300 rounded-lg"
        >
          <div className="flex items-center justify-center h-full w-full">
            <label
              htmlFor="dropzone-file"
              className="flex flex-col items-center justify-center w-full h-full rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100"
            >
              <div className="flex flex-col items-center justify-center pt-5 pb-6">
                <Cloud className="h-6 w-6 text-zinc-500 mb-2" />
                <p className="mb-2 text-sm text-zinc-700">
                  <span className="font-semibold">Click to upload</span> or drag
                  and drop
                </p>
                <p className="text-xs text-zinc-500">PDF (up to 16MB)</p>
              </div>

              {acceptedFiles && acceptedFiles[0] ? (
                <div className="max-w-xs bg-white flex items-center rounded-md overflow-hidden outline outline-[1px] outline-zinc-200 divide-x divide-zinc-200">
                  <div className="px-3 py-2 h-full grid place-items-center">
                    <FileIcon className="h-4 w-4 text-blue-500" />
                  </div>
                  <div className="px-3 py-2 h-full text-sm truncate">
                    {acceptedFiles[0].name}
                  </div>
                </div>
              ) : null}

              {isUploading ? (
                <div className="w-full mt-4 max-w-xs mx-auto">
                  <div className="h-1 w-full bg-zinc-200 rounded-full overflow-hidden">
                    <div
                      className={cn(
                        "h-full transition-all duration-300",
                        uploadProgress === 100 ? "bg-green-500" : "bg-blue-500"
                      )}
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  {uploadProgress === 100 ? (
                    <div className="flex gap-1 items-center justify-center text-sm text-zinc-700 text-center pt-2">
                      <Loader2 className="h-3 w-3 animate-spin" />
                      Processing your document...
                    </div>
                  ) : null}
                </div>
              ) : null}

              <input
                {...getInputProps()}
                type="file"
                id="dropzone-file"
                className="hidden"
              />
            </label>
          </div>
        </div>
      )}
    </Dropzone>
  );
};

const UploadButton = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild onClick={() => setIsOpen(true)}>
        <Button>Upload PDF</Button>
      </DialogTrigger>
      <DialogContent>
        <UploadDropzone onDone={() => setIsOpen(false)} />
      </DialogContent>
    </Dialog>
  );
};

export default UploadButton;
