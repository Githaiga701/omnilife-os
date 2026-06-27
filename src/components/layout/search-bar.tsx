"use client";

import { Command, Search } from "lucide-react";

export function SearchBar() {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }))}
      className="flex w-full cursor-pointer items-center gap-2 rounded-md border border-border/70 bg-card/75 px-3 py-2 shadow-sm backdrop-blur lg:w-80"
    >
      <Search className="h-4 w-4 text-muted-foreground" />
      <span className="min-w-0 flex-1 truncate text-start text-sm text-muted-foreground">Search or run a command</span>
      <kbd className="hidden rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground sm:inline-flex">
        <Command className="mr-1 h-3 w-3" />K
      </kbd>
    </button>
  );
}
