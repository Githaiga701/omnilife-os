"use client";

import { OrbitalLoader } from "@/components/ui/orbital-loader";
import { cn } from "@/lib/utils";

interface AIThinkingProps {
  isThinking: boolean;
  className?: string;
}

export function AIThinking({ isThinking, className }: AIThinkingProps) {
  if (!isThinking) return null;

  return (
    <div className={cn("flex items-center gap-3 px-4 py-3 glass rounded-xl", className)}>
      <OrbitalLoader size="sm" variant="ai" />
      <div className="flex-1">
        <p className="text-sm font-medium text-gradient">OmniLife AI is thinking...</p>
        <p className="text-xs text-muted-foreground">Analyzing your request and executing actions</p>
      </div>
    </div>
  );
}
