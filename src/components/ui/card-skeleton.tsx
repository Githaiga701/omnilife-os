import { cn } from "@/lib/utils";

const lineWidths = [72, 88, 64, 80, 68, 92];

interface CardSkeletonProps {
  className?: string;
  lines?: number;
}

export function CardSkeleton({ className, lines = 3 }: CardSkeletonProps) {
  return (
    <div className={cn("glass rounded-2xl p-6 space-y-4", className)}>
      <div className="flex items-center gap-3">
        <div className="h-10 w-10 rounded-xl bg-muted animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 bg-muted rounded animate-pulse" />
          <div className="h-3 w-24 bg-muted rounded animate-pulse" />
        </div>
      </div>

      <div className="space-y-3">
        {Array.from({ length: lines }).map((_, i) => (
          <div
            key={i}
            className="h-3 bg-muted rounded animate-pulse"
            style={{
              width: `${lineWidths[i % lineWidths.length]}%`,
              animationDelay: `${i * 100}ms`,
            }}
          />
        ))}
      </div>

      <div className="flex gap-2 pt-2">
        <div className="h-8 w-20 bg-muted rounded-lg animate-pulse" />
        <div className="h-8 w-20 bg-muted rounded-lg animate-pulse" />
      </div>
    </div>
  );
}
