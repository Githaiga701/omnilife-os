import { PageShell } from "@/components/layout/page-shell";

export default function CalendarPage() {
  return (
    <PageShell
      title="Calendar"
      description="Plan your days and keep your schedule synchronized."
    >
      <div className="rounded-3xl border border-border/60 bg-card/70 p-8 shadow-sm">
        <p className="text-sm text-muted-foreground">
          Calendar views and scheduling workflows will appear here.
        </p>
      </div>
    </PageShell>
  );
}
