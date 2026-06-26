import { PageShell } from "@/components/layout/page-shell";

export default function HobbiesPage() {
  return (
    <PageShell
      title="Hobbies"
      description="Capture the passions that keep life vibrant and creative."
    >
      <div className="rounded-3xl border border-border/60 bg-card/70 p-8 shadow-sm">
        <p className="text-sm text-muted-foreground">
          Hobbies, projects, and inspiration boards will be organized here.
        </p>
      </div>
    </PageShell>
  );
}
