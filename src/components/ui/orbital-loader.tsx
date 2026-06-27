"use client";

import { cn } from "@/lib/utils";
import { useTheme } from "@/components/providers/theme-provider";

interface OrbitalLoaderProps {
  size?: "sm" | "md" | "lg" | "xl";
  variant?: "default" | "ai" | "minimal";
  className?: string;
}

export function OrbitalLoader({
  size = "md",
  variant = "default",
  className,
}: OrbitalLoaderProps) {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === "dark";

  const sizeMap = {
    sm: { container: 32, core: 8, ring1: 20, ring2: 28, ring3: 36 },
    md: { container: 48, core: 12, ring1: 30, ring2: 42, ring3: 54 },
    lg: { container: 80, core: 20, ring1: 50, ring2: 70, ring3: 90 },
    xl: { container: 120, core: 30, ring1: 75, ring2: 105, ring3: 135 },
  };

  const s = sizeMap[size];

  const colors = isDark
    ? {
        core: "from-purple-500 via-blue-500 to-cyan-500",
        ring: "rgba(139, 92, 246, 0.3)",
        dot: "bg-purple-400",
        glow: "shadow-purple-500/50",
      }
    : {
        core: "from-purple-600 via-blue-600 to-cyan-600",
        ring: "rgba(139, 92, 246, 0.4)",
        dot: "bg-purple-600",
        glow: "shadow-purple-600/40",
      };

  if (variant === "minimal") {
    return (
      <div className={cn("inline-flex items-center", className)}>
        <div
          className={cn("relative rounded-full bg-gradient-to-r animate-spin-slow", colors.core)}
          style={{ width: s.core, height: s.core }}
        />
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center justify-center", className)}>
      <div
        className="relative"
        style={{ width: s.container, height: s.container }}
      >
        <div
          className={cn(
            "absolute rounded-full bg-gradient-to-br animate-pulse-glow",
            colors.core,
            variant === "ai" && "shadow-lg",
            colors.glow
          )}
          style={{
            width: s.core,
            height: s.core,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />

        <div
          className="absolute rounded-full bg-white/30 blur-sm animate-pulse"
          style={{
            width: s.core * 0.6,
            height: s.core * 0.6,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
          }}
        />

        <div
          className="absolute rounded-full border animate-spin-slow"
          style={{
            width: s.ring1,
            height: s.ring1,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            borderColor: colors.ring,
            borderWidth: 1,
          }}
        >
          <div
            className={cn("absolute w-1.5 h-1.5 rounded-full", colors.dot)}
            style={{
              top: 0,
              left: "50%",
              transform: "translate(-50%, -50%)",
              boxShadow: `0 0 8px ${isDark ? "rgba(139, 92, 246, 0.8)" : "rgba(139, 92, 246, 0.6)"}`,
            }}
          />
        </div>

        <div
          className="absolute rounded-full border animate-spin-slow-reverse"
          style={{
            width: s.ring2,
            height: s.ring2,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) rotate(60deg)",
            borderColor: colors.ring,
            borderWidth: 1,
          }}
        >
          <div
            className="absolute w-1.5 h-1.5 rounded-full bg-blue-400"
            style={{
              bottom: 0,
              left: "50%",
              transform: "translate(-50%, 50%)",
              boxShadow: `0 0 8px ${isDark ? "rgba(59, 130, 246, 0.8)" : "rgba(59, 130, 246, 0.6)"}`,
            }}
          />
        </div>

        <div
          className="absolute rounded-full border animate-spin-very-slow"
          style={{
            width: s.ring3,
            height: s.ring3,
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%) rotate(120deg)",
            borderColor: colors.ring,
            borderWidth: 1,
          }}
        >
          <div
            className="absolute w-1.5 h-1.5 rounded-full bg-cyan-400"
            style={{
              top: "50%",
              right: 0,
              transform: "translate(50%, -50%)",
              boxShadow: `0 0 8px ${isDark ? "rgba(6, 182, 212, 0.8)" : "rgba(6, 182, 212, 0.6)"}`,
            }}
          />
        </div>

        {variant === "ai" && size !== "sm" && (
          <div className="absolute inset-0 animate-ping opacity-20">
            <div
              className={cn("rounded-full bg-gradient-to-br", colors.core)}
              style={{
                width: s.core * 1.5,
                height: s.core * 1.5,
                top: "50%",
                left: "50%",
                transform: "translate(-50%, -50%)",
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
}
