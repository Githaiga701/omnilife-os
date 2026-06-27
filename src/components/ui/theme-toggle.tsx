"use client";

import { useTheme } from "@/components/providers/theme-provider";
import { Button } from "@/components/ui/button";
import { Sun, Moon } from "lucide-react";
import { cn } from "@/lib/utils";

export function ThemeToggle() {
  const { resolvedTheme, toggleTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggleTheme}
      className={cn(
        "relative h-10 w-10 rounded-xl overflow-hidden transition-all duration-500",
        isDark
          ? "bg-gradient-to-br from-indigo-500/20 to-purple-600/20 hover:from-indigo-500/30 hover:to-purple-600/30"
          : "bg-gradient-to-br from-amber-400/20 to-orange-500/20 hover:from-amber-400/30 hover:to-orange-500/30"
      )}
      aria-label="Toggle theme"
    >
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-500",
          isDark ? "opacity-100" : "opacity-0"
        )}
        style={{
          background: "radial-gradient(circle at center, rgba(139, 92, 246, 0.3) 0%, transparent 70%)",
        }}
      />
      <div
        className={cn(
          "absolute inset-0 transition-opacity duration-500",
          isDark ? "opacity-0" : "opacity-100"
        )}
        style={{
          background: "radial-gradient(circle at center, rgba(251, 191, 36, 0.3) 0%, transparent 70%)",
        }}
      />

      <div
        className={cn(
          "relative z-10 transition-all duration-500",
          isDark ? "rotate-0 scale-100 opacity-100" : "rotate-180 scale-0 opacity-0"
        )}
      >
        <Moon className={cn("h-5 w-5", isDark ? "text-indigo-300" : "text-transparent")} />
      </div>

      <div
        className={cn(
          "absolute inset-0 z-10 flex items-center justify-center transition-all duration-500",
          isDark ? "-rotate-180 scale-0 opacity-0" : "rotate-0 scale-100 opacity-100"
        )}
      >
        <Sun className={cn("h-5 w-5", !isDark ? "text-amber-400" : "text-transparent")} />
      </div>
    </Button>
  );
}
