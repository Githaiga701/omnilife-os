import type { ReactNode } from "react";
import { Sparkles } from "lucide-react";

interface PageShellProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function PageShell({ title, description, children }: PageShellProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between gap-4 rounded-3xl border border-border/60 bg-card/70 p-6 shadow-sm backdrop-blur">
        <div className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            OmniLife OS
          </div>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          {description ? <p className="text-sm text-muted-foreground">{description}</p> : null}
        </div>
      </div>

      {children}
    </div>
  );
}
