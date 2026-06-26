import { PageShell } from "@/components/layout/page-shell";
import { db } from "@/lib/db";
import { createProject, updateProjectStatus } from "@/lib/omni-actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export default async function ProjectsPage() {
  const projects = await db.project.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      description: true,
      status: true,
      createdAt: true,
    },
  });

  return (
    <PageShell
      title="Projects"
      description="Keep your active initiatives centered and moving forward."
    >
      <div className="grid gap-6 lg:grid-cols-[0.85fr_1.15fr]">
        <form action={createProject} className="rounded-3xl border border-border/60 bg-card/70 p-6 shadow-sm space-y-4">
          <div>
            <h2 className="text-lg font-semibold">Create project</h2>
            <p className="text-sm text-muted-foreground">Capture a new initiative and assign its current state.</p>
          </div>
          <Input name="title" placeholder="Project title" required />
          <Input name="description" placeholder="Short description" />
          <select name="status" className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
            <option value="ACTIVE">Active</option>
            <option value="PAUSED">Paused</option>
            <option value="COMPLETED">Completed</option>
          </select>
          <Button type="submit">Save project</Button>
        </form>

        <div className="space-y-4">
          {projects.length === 0 ? (
            <div className="rounded-3xl border border-border/60 bg-card/70 p-8 shadow-sm text-sm text-muted-foreground">
              No projects yet. Create the first one to start tracking your work.
            </div>
          ) : (
            projects.map((project) => (
              <div key={project.id} className="rounded-3xl border border-border/60 bg-card/70 p-6 shadow-sm">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{project.title}</h3>
                    <p className="text-sm text-muted-foreground">{project.description || "No description yet."}</p>
                  </div>
                  <span className={cn(
                    "rounded-full px-3 py-1 text-xs font-medium",
                    project.status === "COMPLETED" && "bg-emerald-500/15 text-emerald-400",
                    project.status === "PAUSED" && "bg-amber-500/15 text-amber-400",
                    project.status === "ACTIVE" && "bg-sky-500/15 text-sky-400"
                  )}>
                    {project.status}
                  </span>
                </div>
                <form action={updateProjectStatus} className="mt-4 flex items-center gap-3">
                  <input type="hidden" name="projectId" value={project.id} />
                  <select name="status" defaultValue={project.status} className="rounded-md border border-input bg-background px-3 py-2 text-sm">
                    <option value="ACTIVE">Active</option>
                    <option value="PAUSED">Paused</option>
                    <option value="COMPLETED">Completed</option>
                  </select>
                  <Button type="submit" variant="outline">Update</Button>
                </form>
              </div>
            ))
          )}
        </div>
      </div>
    </PageShell>
  );
}
