import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { Sidebar } from "@/components/layout/sidebar";
import { AICommandBar } from "@/components/layout/ai-command-bar";
import { AnimatedBackground } from "@/components/layout/animated-background";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { ErrorBoundary } from "@/components/ui/error-boundary";
import { checkEnv } from "@/lib/env";

checkEnv();

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
      <body className="antialiased" suppressHydrationWarning>
        <ThemeProvider>
          <AnimatedBackground />
          <div className="relative flex h-dvh min-h-dvh flex-col overflow-hidden md:flex-row">
            <Sidebar />
            <main className="min-w-0 flex-1 overflow-y-auto px-3 py-4 pb-24 sm:px-6 lg:px-8">
              <div className="mx-auto max-w-7xl">
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
              </div>
            </main>
          </div>
          <AICommandBar />
        </ThemeProvider>
        <Analytics />
      </body>
    </html>
  );
}
