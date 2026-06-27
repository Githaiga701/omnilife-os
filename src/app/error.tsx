"use client";

import { AlertTriangle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  console.error("[Page Error]", error);

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
      <AlertTriangle className="h-12 w-12 text-red-400 mb-4" />
      <h1 className="text-xl font-semibold mb-2">Something went wrong</h1>
      <p className="text-sm text-muted-foreground max-w-md mb-6">
        {error.message || "An unexpected error occurred while loading this page."}
      </p>
      <Button type="button" onClick={reset} variant="outline">
        <RefreshCw className="h-4 w-4 mr-2" /> Try again
      </Button>
    </div>
  );
}
