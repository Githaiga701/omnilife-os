"use client";

import { OrbitalLoader } from "@/components/ui/orbital-loader";
import { useTheme } from "@/components/providers/theme-provider";
import { useEffect, useState } from "react";

interface PageLoaderProps {
  isLoading: boolean;
}

export function PageLoader({ isLoading }: PageLoaderProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";
  const [show, setShow] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setShow(isLoading), isLoading ? 100 : 0);
    return () => clearTimeout(timer);
  }, [isLoading]);

  if (!show) return null;

  return (
    <div
      className={`fixed inset-0 z-50 flex items-center justify-center transition-all duration-500 ${
        isLoading ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
      }`}
      style={{
        backgroundColor: isDark ? "rgba(10, 10, 15, 0.95)" : "rgba(250, 250, 250, 0.95)",
        backdropFilter: "blur(20px)",
      }}
    >
      <div className="flex flex-col items-center gap-6">
        <OrbitalLoader size="xl" variant="ai" />
        <div className="text-center space-y-2">
          <h2 className="text-2xl font-bold text-gradient">OmniLife OS</h2>
          <p className="text-sm text-muted-foreground animate-pulse">
            Initializing your personal operating system...
          </p>
        </div>
      </div>
    </div>
  );
}
