import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import "react-loading-skeleton/dist/skeleton.css";
import "simplebar-react/dist/simplebar.min.css";
import { cn } from "@/lib/utils";
import Navbar from "@/Components/Navbar";
import Providers from "@/Components/Providers";
import { Toaster } from "@/Components/ui/toaster";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Doc",
  description:
    "Chat with your PDF documents using AI. Upload a document and ask questions — every answer is grounded in your file.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="light">
      <Providers>
        <body
          className={cn(
            "min-h-screen font-sans antialiased grainy",
            inter.className
          )}
        >
          <Toaster />
          <Navbar />
          {children}
        </body>
      </Providers>
    </html>
  );
}
