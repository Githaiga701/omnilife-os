import { ArrowUpRight, CalendarDays, CreditCard, Sparkles } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";

export default function Home() {
  return (
    <PageShell
      title="Dashboard"
      description="Your life at a glance, with the AI command palette ready whenever you need it."
    >
      <div className="grid gap-4 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-muted-foreground">Today’s momentum</p>
              <h2 className="mt-2 text-2xl font-semibold">3 priorities moving forward</h2>
            </div>
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              <Sparkles className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            {[
              { label: "Projects", value: "4 active" },
              { label: "Finances", value: "$12.4k saved" },
              { label: "Events", value: "2 this week" },
            ].map((item) => (
              <div key={item.label} className="rounded-2xl border border-border/50 bg-background/70 p-4">
                <p className="text-sm text-muted-foreground">{item.label}</p>
                <p className="mt-2 font-semibold">{item.value}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <CalendarDays className="h-4 w-4" />
              Upcoming
            </div>
            <p className="mt-4 text-lg font-semibold">Design review at 4:00 PM</p>
            <p className="mt-2 text-sm text-muted-foreground">A calm, focused block to keep your week aligned.</p>
          </div>

          <div className="rounded-3xl border border-border/60 bg-card/80 p-6 shadow-sm">
            <div className="flex items-center gap-2 text-sm font-medium text-primary">
              <CreditCard className="h-4 w-4" />
              Balance snapshot
            </div>
            <p className="mt-4 text-lg font-semibold">$8,420.90 available</p>
            <button className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
              Review finances <ArrowUpRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </PageShell>
  );
}
