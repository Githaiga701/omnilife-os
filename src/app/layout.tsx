import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { AICommandBar } from "@/components/layout/ai-command-bar";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OmniLife OS",
  description: "Your autonomous personal operating system.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased`}>
        <div className="flex h-screen overflow-hidden bg-background">
          <Sidebar />

          <main className="flex-1 overflow-y-auto p-8">
            <div className="mx-auto max-w-7xl">{children}</div>
          </main>
        </div>

        <AICommandBar />
      </body>
    </html>
  );
}
