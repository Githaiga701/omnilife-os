import { cn } from "@/lib/utils";

interface PremiumCardProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: "primary" | "premium" | "neon" | "cosmic" | "none";
  hover?: boolean;
}

const glowMap = {
  primary: "shadow-primary/15",
  premium: "shadow-[oklch(0.58_0.19_325)]/15",
  neon: "shadow-[oklch(0.72_0.19_165)]/15",
  cosmic: "shadow-[oklch(0.52_0.18_255)]/15",
  none: "",
};

export function PremiumCard({
  children,
  className,
  glowColor = "none",
  hover = false,
}: PremiumCardProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-2xl border border-border/40 bg-card/60 p-6 shadow-sm backdrop-blur-xl",
        glowColor !== "none" && `shadow-lg ${glowMap[glowColor]}`,
        hover && "transition-all duration-300 hover:shadow-xl hover:-translate-y-0.5 hover:border-border/60",
        className
      )}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-transparent to-white/[0.02] dark:to-white/[0.03] pointer-events-none" />
      {children}
    </div>
  );
}
