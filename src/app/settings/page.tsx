import { Bell, Database, KeyRound, Palette } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";

const settings = [
  { title: "Notifications", detail: "Daily brief, overdue items, and finance reminders", icon: Bell, enabled: true },
  { title: "Data source", detail: "Prisma persistence with local fallback", icon: Database, enabled: true },
  { title: "Access", detail: "Default profile and workspace identity", icon: KeyRound, enabled: false },
  { title: "Appearance", detail: "Dark command-center interface", icon: Palette, enabled: true },
];

export default function SettingsPage() {
  return (
    <PageShell
      title="Settings"
      description="Control system behavior, data persistence, appearance, and future automation preferences."
    >
      <section className="rounded-md border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur">
        <div className="grid gap-4 md:grid-cols-2">
          {settings.map((item) => {
            const Icon = item.icon;

            return (
              <div key={item.title} className="rounded-md border border-border/70 bg-background/55 p-5">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex gap-3">
                    <Icon className="mt-0.5 h-5 w-5 text-primary" />
                    <div>
                      <h2 className="font-semibold">{item.title}</h2>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{item.detail}</p>
                    </div>
                  </div>
                  <span className={`h-5 w-9 rounded-full p-0.5 ${item.enabled ? "bg-primary" : "bg-muted"}`}>
                    <span className={`block h-4 w-4 rounded-full bg-background transition-transform ${item.enabled ? "translate-x-4" : ""}`} />
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </section>
    </PageShell>
  );
}
