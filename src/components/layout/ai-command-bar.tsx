"use client";

import { useEffect, useRef, useState } from "react";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { 
  Sparkles, Send, LoaderCircle, CheckCircle2, 
  Bot, User, Zap 
} from "lucide-react";

const toolDisplayNames: Record<string, string> = {
  getLearningPaths: "📚 Reading learning paths...",
  getBills: "💰 Reading bills...",
  getIncomeEntries: "💵 Reading income entries...",
  logStudySession: "⏱️ Logging study session...",
  toggleAssignment: "✅ Updating assignment...",
  updateUnitProgress: "📊 Updating unit progress...",
  addJournalEntry: "📝 Saving journal entry...",
  createBill: "📄 Creating bill...",
  markBillAsPaid: "✅ Marking bill as paid...",
  createIncomeEntry: "💰 Creating income entry...",
  logIncomePayment: "💵 Logging payment...",
  createProject: "🚀 Creating project...",
  createCalendarEvent: "📅 Creating calendar event...",
};

export function AICommandBar() {
  const [open, setOpen] = useState(false);
  const [inputFocused, setInputFocused] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, error, clearError } = useChat({
    id: "omnilife-chat",
    transport: new DefaultChatTransport({ api: "/api/chat" }),
  });

  const isLoading = status === "submitted" || status === "streaming";

  useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === "k" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setOpen((prev) => !prev);
      }
      if (e.key === "Escape" && open) {
        setOpen(false);
      }
    };
    document.addEventListener("keydown", down);
    return () => document.removeEventListener("keydown", down);
  }, [open]);

  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, status]);

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    sendMessage({ text: input });
    setInput("");
  };

  const handleFloatingSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;
    const text = input;
    setInput("");
    setOpen(true);
    sendMessage({ text });
  };

  return (
    <>
      {/* Floating input bar — always visible */}
      <div className="fixed bottom-0 left-0 right-0 z-40 border-t border-border/60 bg-background/95 backdrop-blur-md md:left-60">
        <div className="mx-auto flex max-w-4xl items-center gap-2 px-4 py-3">
          <div
            onClick={() => setOpen(true)}
            className="flex h-10 w-10 shrink-0 cursor-pointer items-center justify-center rounded-full bg-gradient-to-br from-primary to-purple-600 shadow-lg shadow-primary/20"
          >
            <Sparkles className="h-5 w-5 text-white" />
          </div>

          <form onSubmit={handleFloatingSubmit} className="flex flex-1 gap-2">
            <div className="relative flex-1">
              <Input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onFocus={() => setInputFocused(true)}
                onBlur={() => setInputFocused(false)}
                placeholder="Ask OmniLife AI... (e.g., 'Log 2 hours of React study')"
                className="h-10 w-full bg-muted/50 pl-4 pr-10 text-sm ring-1 ring-border/50 focus-visible:ring-primary/30"
                disabled={isLoading}
              />
              {inputFocused && (
                <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-semibold text-muted-foreground sm:inline-flex">
                  ⌘K
                </kbd>
              )}
            </div>
            <Button
              type="submit"
              size="icon"
              disabled={isLoading || !input.trim()}
              className="h-10 w-10 shrink-0"
            >
              {isLoading ? (
                <LoaderCircle className="h-4 w-4 animate-spin" />
              ) : (
                <Zap className="h-4 w-4" />
              )}
            </Button>
          </form>
        </div>
      </div>

      {/* Full dialog for conversation history */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] flex flex-col p-0 gap-0 overflow-hidden rounded-2xl border border-border/40 shadow-2xl shadow-black/30">
          {/* Glow behind title */}
          <div className="absolute -top-20 left-1/2 -translate-x-1/2 h-40 w-72 bg-primary/20 rounded-full blur-[80px] pointer-events-none" />

          <DialogHeader className="px-6 py-4 border-b border-border/40">
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-purple-400" />
              OmniLife AI Assistant
              {isLoading && (
                <Badge variant="secondary" className="ml-2 bg-gradient-to-r from-primary/20 to-purple-600/20 border-primary/30 animate-pulse">
                  <LoaderCircle className="h-3 w-3 mr-1 animate-spin" />
                  Thinking...
                </Badge>
              )}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 px-6 py-4 min-h-[200px] max-h-[50vh]">
            {messages.length === 0 && (
              <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center mb-4">
                  <Bot className="h-8 w-8 text-purple-400" />
                </div>
                <h3 className="text-lg font-semibold mb-2">What can I do for you?</h3>
                <p className="text-sm text-muted-foreground max-w-sm">
                  Try: <em>&quot;I studied React for 2 hours&quot;</em> or <em>&quot;Create a $1,500 rent bill due next Friday&quot;</em>
                </p>
              </div>
            )}

            <div className="space-y-4">
              {messages.map((message) => (
                <div key={message.id} className="space-y-2">
                  {message.role === "user" && (
                    <div className="flex items-start gap-3 justify-end">
                      <div className="bg-primary/10 rounded-2xl rounded-tr-sm px-4 py-3 max-w-[80%]">
                        <p className="text-sm">
                          {message.parts
                            .filter((p) => p.type === "text")
                            .map((p) => (p as any).text || "")
                            .join("")}
                        </p>
                      </div>
                      <User className="h-5 w-5 text-muted-foreground mt-1 flex-shrink-0" />
                    </div>
                  )}

                  {message.parts.map((part, idx) => {
                    if (part.type === "tool-ui") {
                      const { state, toolName } = part as any;
                      const displayName = toolDisplayNames[toolName] || `🔧 Running ${toolName}...`;

                      return (
                        <div
                          key={idx}
                          className={`flex items-center gap-3 px-4 py-2.5 rounded-lg border text-sm transition-all ${
                            state === "output-available"
                              ? "bg-green-500/5 border-green-500/20"
                              : "bg-muted/50 border-muted animate-pulse"
                          }`}
                        >
                          {state === "output-available" ? (
                            <CheckCircle2 className="h-4 w-4 text-green-500 flex-shrink-0" />
                          ) : (
                            <LoaderCircle className="h-4 w-4 text-purple-400 animate-spin flex-shrink-0" />
                          )}
                          <span className={state === "output-available" ? "text-green-600 dark:text-green-400" : "text-muted-foreground"}>
                            {displayName}
                          </span>
                          {state === "output-available" && (
                            <Badge variant="outline" className="ml-auto text-xs border-green-500/30 text-green-600 dark:text-green-400">
                              Done
                            </Badge>
                          )}
                        </div>
                      );
                    }
                    if (part.type === "text" && message.role === "assistant") {
                      const textPart = part as any;
                      if (!textPart.text) return null;
                      return (
                        <div key={idx} className="flex items-start gap-3">
                          <Bot className="h-5 w-5 text-purple-400 mt-1 flex-shrink-0" />
                          <div className="bg-muted/50 rounded-2xl rounded-tl-sm px-4 py-3 max-w-[80%]">
                            <p className="text-sm whitespace-pre-wrap">{textPart.text}</p>
                          </div>
                        </div>
                      );
                    }
                    return null;
                  })}
                  <div ref={messagesEndRef} />
                </div>
              ))}
            </div>
          </ScrollArea>

          <form onSubmit={onSubmit} className="p-4 border-t bg-muted/20">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Tell OmniLife what to do..."
                className="flex-1 bg-background"
                disabled={isLoading}
                autoFocus
              />
              <Button type="submit" disabled={isLoading || !input.trim()} size="icon">
                {isLoading ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" />
                ) : (
                  <Send className="h-4 w-4" />
                )}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
