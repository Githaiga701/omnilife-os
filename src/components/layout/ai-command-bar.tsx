"use client";

import { useEffect, useState } from "react";
import {
  CommandDialog,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "@/components/ui/command";
import { Calendar, CreditCard, Folder, Sparkles, Zap, Brain } from "lucide-react";

export function AICommandBar() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((current) => !current);
      }
    };

    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, []);

  return (
    <CommandDialog open={open} onOpenChange={setOpen}>
      <CommandInput placeholder="Ask OmniLife anything... (e.g. 'Book Tokyo trip and deduct $2k from savings')" />
      <CommandList>
        <CommandEmpty>No results found.</CommandEmpty>

        <CommandGroup heading="AI Actions">
          <CommandItem onSelect={() => setOpen(false)}>
            <Brain className="mr-2 h-4 w-4 text-purple-400" />
            <span>Analyze my week and suggest schedule changes</span>
          </CommandItem>
          <CommandItem onSelect={() => setOpen(false)}>
            <Zap className="mr-2 h-4 w-4 text-yellow-400" />
            <span>Auto-categorize my pending bills</span>
          </CommandItem>
        </CommandGroup>

        <CommandSeparator />

        <CommandGroup heading="Quick Create">
          <CommandItem onSelect={() => setOpen(false)}>
            <Folder className="mr-2 h-4 w-4 text-blue-400" />
            <span>New Project</span>
          </CommandItem>
          <CommandItem onSelect={() => setOpen(false)}>
            <CreditCard className="mr-2 h-4 w-4 text-green-400" />
            <span>Log Expense</span>
          </CommandItem>
          <CommandItem onSelect={() => setOpen(false)}>
            <Calendar className="mr-2 h-4 w-4 text-orange-400" />
            <span>Schedule Event</span>
          </CommandItem>
        </CommandGroup>
      </CommandList>
    </CommandDialog>
  );
}
