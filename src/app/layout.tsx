import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { AICommandBar } from "@/components/layout/ai-command-bar";
import { AnimatedBackground } from "@/components/layout/animated-background";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { checkEnv } from "@/lib/env";

checkEnv();

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
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.className} antialiased`} suppressHydrationWarning>
        <ThemeProvider>
          <AnimatedBackground />
          <div className="relative flex h-screen overflow-hidden">
            <Sidebar />
            <main className="flex-1 overflow-y-auto px-4 py-5 pb-20 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-7xl">
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
              </div>
            </main>
          </div>
          <AICommandBar />
        </ThemeProvider>
      </body>
    </html>
  );
}
