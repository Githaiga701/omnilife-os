import { PageShell } from "@/components/layout/page-shell";

export default function EventsPage() {
  return (
    <PageShell
      title="Events"
      description="Track upcoming occasions, trips, and important milestones."
    >
      <div className="rounded-3xl border border-border/60 bg-card/70 p-8 shadow-sm">
        <p className="text-sm text-muted-foreground">
          Event planning and activity history will be managed here.
        </p>
      </div>
    </PageShell>
  );
}
