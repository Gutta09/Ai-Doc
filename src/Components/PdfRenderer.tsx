"use client";

import { useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import {
  ChevronDown,
  ChevronUp,
  Loader2,
  RotateCw,
  Search,
} from "lucide-react";
import { toast } from "sonner";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "./ui/dropdown-menu";
import { cn } from "@/lib/utils";

pdfjs.GlobalWorkerOptions.workerSrc = `https://unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface PdfRendererProps {
  url: string;
}

const PdfRenderer = ({ url }: PdfRendererProps) => {
  const [numPages, setNumPages] = useState<number>();
  const [currPage, setCurrPage] = useState(1);
  const [scale, setScale] = useState(1);
  const [rotation, setRotation] = useState(0);
  const [pageInput, setPageInput] = useState("1");

  const containerRef = useRef<HTMLDivElement>(null);
  const [width, setWidth] = useState<number>(680);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const observer = new ResizeObserver((entries) => {
      const w = entries[0]?.contentRect.width;
      if (w) setWidth(w);
    });
    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const goToPage = (page: number) => {
    if (!numPages) return;
    const clamped = Math.min(Math.max(page, 1), numPages);
    setCurrPage(clamped);
    setPageInput(String(clamped));
  };

  return (
    <div className="w-full bg-white rounded-md shadow flex flex-col items-center">
      <div className="h-14 w-full border-b border-zinc-200 flex items-center justify-between px-2">
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            aria-label="previous page"
            disabled={currPage <= 1}
            onClick={() => goToPage(currPage - 1)}
          >
            <ChevronDown className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1.5">
            <Input
              className="w-12 h-8"
              value={pageInput}
              onChange={(e) => setPageInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const n = Number(pageInput);
                  if (Number.isNaN(n)) return toast.error("Invalid page");
                  goToPage(n);
                }
              }}
            />
            <p className="text-zinc-700 text-sm space-x-1">
              <span>/</span>
              <span>{numPages ?? "x"}</span>
            </p>
          </div>

          <Button
            variant="ghost"
            aria-label="next page"
            disabled={numPages === undefined || currPage >= numPages}
            onClick={() => goToPage(currPage + 1)}
          >
            <ChevronUp className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-x-2 flex items-center">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="gap-1.5" aria-label="zoom" variant="ghost">
                <Search className="h-4 w-4" />
                {scale * 100}%
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="bg-white">
              {[1, 1.5, 2, 2.5].map((z) => (
                <DropdownMenuItem key={z} onSelect={() => setScale(z)}>
                  {z * 100}%
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={() => setRotation((prev) => prev + 90)}
            variant="ghost"
            aria-label="rotate 90 degrees"
          >
            <RotateCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div
        ref={containerRef}
        className="flex-1 w-full max-h-[calc(100vh-10rem)] overflow-auto"
      >
        <div className="flex justify-center">
          <Document
            file={url}
            onLoadSuccess={({ numPages }) => setNumPages(numPages)}
            onLoadError={() =>
              toast.error("Could not load the PDF. Please try again.")
            }
            loading={
              <div className="flex justify-center py-24">
                <Loader2 className="my-24 h-6 w-6 animate-spin" />
              </div>
            }
            className="max-h-full"
          >
            <Page
              pageNumber={currPage}
              width={width}
              scale={scale}
              rotate={rotation}
              loading={
                <div className="flex justify-center py-24">
                  <Loader2 className="my-24 h-6 w-6 animate-spin" />
                </div>
              }
            />
          </Document>
        </div>
      </div>
    </div>
  );
};

export default PdfRenderer;
