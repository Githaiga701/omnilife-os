import { PageShell } from "@/components/layout/page-shell";

export default function SettingsPage() {
  return (
    <PageShell
      title="Settings"
      description="Personalize how OmniLife OS behaves and looks."
    >
      <div className="rounded-3xl border border-border/60 bg-card/70 p-8 shadow-sm">
        <p className="text-sm text-muted-foreground">
          Settings for integrations, themes, and automation rules will appear here.
        </p>
      </div>
    </PageShell>
  );
}
