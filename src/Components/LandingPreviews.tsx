// Hand-built product illustrations for the landing page (pure JSX — no
// borrowed screenshots). They mirror the real dashboard layout: PDF viewer on
// the left, grounded chat on the right.

import { FileText, Send, UploadCloud, File as FileIcon } from "lucide-react";

function AssistantBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-[85%] rounded-2xl rounded-tl-sm bg-zinc-100 px-4 py-2.5 text-left text-sm text-zinc-700">
      {children}
    </div>
  );
}

function UserBubble({ children }: { children: React.ReactNode }) {
  return (
    <div className="ml-auto max-w-[85%] rounded-2xl rounded-tr-sm bg-blue-600 px-4 py-2.5 text-left text-sm text-white">
      {children}
    </div>
  );
}

export function ChatPreviewMock() {
  return (
    <div className="grid grid-cols-1 overflow-hidden rounded-md bg-white shadow-2xl ring-1 ring-gray-900/10 md:grid-cols-2">
      {/* PDF pane */}
      <div className="hidden border-r border-zinc-200 md:block">
        <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-2.5 text-xs text-zinc-500">
          <FileText className="h-4 w-4 text-blue-600" />
          annual-report-2025.pdf
          <span className="ml-auto rounded bg-zinc-100 px-1.5 py-0.5">Page 12 / 48</span>
        </div>
        <div className="space-y-2.5 p-6">
          <div className="h-3 w-2/3 rounded bg-zinc-200" />
          <div className="h-2 w-full rounded bg-zinc-100" />
          <div className="h-2 w-full rounded bg-zinc-100" />
          <div className="h-2 w-5/6 rounded bg-zinc-100" />
          <div className="h-2 w-full rounded bg-zinc-100" />
          <div className="mt-4 h-24 w-full rounded bg-blue-50 ring-1 ring-inset ring-blue-100" />
          <div className="h-2 w-full rounded bg-zinc-100" />
          <div className="h-2 w-4/6 rounded bg-zinc-100" />
          <div className="h-2 w-full rounded bg-zinc-100" />
          <div className="h-2 w-3/4 rounded bg-zinc-100" />
        </div>
      </div>

      {/* Chat pane */}
      <div className="flex flex-col">
        <div className="flex flex-1 flex-col gap-3 p-4">
          <UserBubble>What was total revenue in Q3?</UserBubble>
          <AssistantBubble>
            Total revenue in Q3 2025 was <strong>$4.2M</strong>, up 18% from Q2
            — driven mainly by the enterprise tier (p. 12).
          </AssistantBubble>
          <UserBubble>And what does the report say about churn?</UserBubble>
          <AssistantBubble>
            Monthly churn fell from 3.1% to 2.4% after the onboarding redesign
            (p. 17). The report attributes most of the drop to the new
            in-product checklists.
          </AssistantBubble>
        </div>
        <div className="m-3 flex items-center gap-2 rounded-xl border border-zinc-200 px-4 py-2.5 text-sm text-zinc-400">
          Ask a question about your document…
          <Send className="ml-auto h-4 w-4 text-blue-600" />
        </div>
      </div>
    </div>
  );
}

export function UploadPreviewMock() {
  return (
    <div className="rounded-md bg-white p-6 shadow-2xl ring-1 ring-gray-900/10 sm:p-10">
      <div className="mx-auto max-w-lg rounded-xl border-2 border-dashed border-zinc-300 p-8 text-center">
        <UploadCloud className="mx-auto h-8 w-8 text-zinc-400" />
        <p className="mt-2 text-sm font-medium text-zinc-700">
          Click to upload <span className="font-normal text-zinc-500">or drag and drop</span>
        </p>
        <p className="text-xs text-zinc-400">PDF (up to 16MB)</p>

        <div className="mx-auto mt-5 flex max-w-xs items-center gap-2 rounded-md bg-white px-3 py-2 text-left ring-1 ring-zinc-200">
          <FileIcon className="h-4 w-4 shrink-0 text-blue-600" />
          <span className="truncate text-xs text-zinc-600">lecture_notes.pdf</span>
        </div>
        <div className="mx-auto mt-3 h-1 max-w-xs overflow-hidden rounded-full bg-zinc-100">
          <div className="h-full w-4/5 rounded-full bg-blue-600" />
        </div>
        <p className="mt-2 text-xs text-zinc-400">Embedding chunks… 80%</p>
      </div>
    </div>
  );
}
