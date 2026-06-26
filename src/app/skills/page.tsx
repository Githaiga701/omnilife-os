import { PageShell } from "@/components/layout/page-shell";

export default function SkillsPage() {
  return (
    <PageShell
      title="Skills"
      description="Develop and track your growth across every discipline."
    >
      <div className="rounded-3xl border border-border/60 bg-card/70 p-8 shadow-sm">
        <p className="text-sm text-muted-foreground">
          Skills, progress goals, and mastery levels will be visualized here.
        </p>
      </div>
    </PageShell>
  );
}
