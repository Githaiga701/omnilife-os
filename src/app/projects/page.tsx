import { CheckCircle2, CirclePause, FolderPlus, ListChecks } from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { db } from "@/lib/db";
import { getMockUser } from "@/lib/mock-auth";
import { createProject, updateProjectStatus } from "@/lib/omni-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import type { Project } from "@prisma/client";

type ProjectListItem = Pick<Project, "id" | "title" | "description" | "status" | "createdAt">;

const statusStyles: Record<string, string> = {
  ACTIVE: "border-sky-400/30 bg-sky-400/10 text-sky-200",
  PAUSED: "border-amber-400/30 bg-amber-400/10 text-amber-200",
  COMPLETED: "border-emerald-400/30 bg-emerald-400/10 text-emerald-200",
};

export default async function ProjectsPage() {
  const user = await getMockUser();
  const projects = (await db.project.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      createdAt: true,
    },
  })) as ProjectListItem[];

  const activeCount = projects.filter((project) => project.status === "ACTIVE").length;
  const pausedCount = projects.filter((project) => project.status === "PAUSED").length;
  const completedCount = projects.filter((project) => project.status === "COMPLETED").length;

  return (
    <PageShell
      title="Projects"
      description="Plan, capture, and move active initiatives without losing sight of current status."
    >
      <section className="grid gap-4 md:grid-cols-3">
        {[
          { label: "Active", value: activeCount, icon: ListChecks },
          { label: "Paused", value: pausedCount, icon: CirclePause },
          { label: "Completed", value: completedCount, icon: CheckCircle2 },
        ].map((item) => {
          const Icon = item.icon;

          return (
            <div key={item.label} className="rounded-md border border-border/70 bg-card/80 p-5 shadow-sm backdrop-blur">
              <div className="flex items-center justify-between">
                <p className="text-sm font-medium text-muted-foreground">{item.label}</p>
                <Icon className="h-4 w-4 text-primary" />
              </div>
              <p className="mt-3 text-3xl font-semibold">{item.value}</p>
            </div>
          );
        })}
      </section>

      <section className="grid gap-4 xl:grid-cols-[0.8fr_1.2fr]">
        <form action={createProject} className="rounded-md border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur">
          <div className="flex items-center gap-3">
            <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary/12 text-primary">
              <FolderPlus className="h-5 w-5" />
            </span>
            <div>
              <h2 className="text-lg font-semibold">Create project</h2>
              <p className="text-sm text-muted-foreground">Add a new initiative to the operating queue.</p>
            </div>
          </div>

          <div className="mt-6 space-y-5">
            <Input name="title" placeholder="Project title" required />
            <Input name="description" placeholder="Short description" />
            <select name="status" className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
              <option value="ACTIVE">Active</option>
              <option value="PAUSED">Paused</option>
              <option value="COMPLETED">Completed</option>
            </select>
            <Button type="submit" className="w-full">Save project</Button>
          </div>
        </form>

        <div className="rounded-md border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">Project queue</h2>
              <p className="text-sm text-muted-foreground">Newest initiatives appear first.</p>
            </div>
            <span className="rounded-md border border-border bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
              {projects.length} total
            </span>
          </div>

          <div className="mt-5 divide-y divide-border/70">
            {projects.length === 0 ? (
              <div className="py-12 text-center">
                <ListChecks className="mx-auto h-8 w-8 text-muted-foreground" />
                <p className="mt-3 font-medium">No projects yet</p>
                <p className="mt-1 text-sm text-muted-foreground">Create the first project to start tracking execution.</p>
              </div>
            ) : (
              projects.map((project) => (
                <div key={project.id} className="py-5 first:pt-0 last:pb-0">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                    <div>
                      <h3 className="font-semibold">{project.title}</h3>
                      <p className="mt-1 text-sm text-muted-foreground">{project.description || "No description yet."}</p>
                    </div>
                    <span className={cn("w-fit rounded-md border px-2.5 py-1 text-xs font-semibold", statusStyles[project.status])}>
                      {project.status}
                    </span>
                  </div>
                  <form action={updateProjectStatus} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
                    <input type="hidden" name="projectId" value={project.id} />
                    <select name="status" defaultValue={project.status} className="h-10 rounded-md border border-input bg-background px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-ring/30">
                      <option value="ACTIVE">Active</option>
                      <option value="PAUSED">Paused</option>
                      <option value="COMPLETED">Completed</option>
                    </select>
                    <Button type="submit" variant="outline">Update status</Button>
                  </form>
                </div>
              ))
            )}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
