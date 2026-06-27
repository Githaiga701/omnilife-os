import type { ReactNode } from "react";
import { SearchBar } from "@/components/layout/search-bar";

interface PageShellProps {
  title: string;
  description?: string;
  eyebrow?: string;
  children: ReactNode;
}

export function PageShell({ title, description, eyebrow = "OmniLife OS", children }: PageShellProps) {
  return (
    <div className="space-y-6 pb-20 md:pb-0">
      <header className="flex flex-col gap-4 border-b border-border/60 pb-5 lg:flex-row lg:items-end lg:justify-between">
        <div className="max-w-2xl space-y-2">
          <div className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            {eyebrow}
          </div>
          <h1 className="text-3xl font-semibold tracking-tight text-balance sm:text-4xl">{title}</h1>
          {description ? <p className="max-w-xl text-sm leading-6 text-muted-foreground">{description}</p> : null}
        </div>
        <SearchBar />
      </header>

      {children}
    </div>
  );
}
