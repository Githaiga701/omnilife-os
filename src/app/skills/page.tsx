import { db } from "@/lib/db";
import { getMockUser } from "@/lib/mock-auth";
import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createSkill, updateSkillLevel } from "@/app/actions/calendar";
import { Brain, ChartNoAxesColumnIncreasing, GraduationCap, Target } from "lucide-react";
import type { Skill } from "@prisma/client";

export default async function SkillsPage() {
  const user = await getMockUser();
  const skills = (await db.skill.findMany({
    where: { userId: user.id },
    orderBy: { level: "desc" },
  })) as Skill[];

  return (
    <PageShell
      title="Skills"
      description="Prioritize learning tracks, compare current level against target level, and focus practice time."
    >
      <section className="grid gap-4 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-md border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur">
          <GraduationCap className="h-5 w-5 text-primary" />
          <h2 className="mt-4 text-2xl font-semibold">{skills.length} active tracks</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Track skills, set target levels, and monitor your growth over time.
          </p>

          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-3">Add new skill</h3>
            <form action={createSkill} className="space-y-3">
              <Input name="name" placeholder="Skill name (e.g., Product Strategy)" required />
              <Input name="category" placeholder="Category (e.g., Business, Tech)" required />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label htmlFor="level" className="text-xs">Current level</Label>
                  <Input name="level" id="level" type="number" min="0" max="100" defaultValue="0" />
                </div>
                <div>
                  <Label htmlFor="targetLevel" className="text-xs">Target level</Label>
                  <Input name="targetLevel" id="targetLevel" type="number" min="1" max="100" defaultValue="10" />
                </div>
              </div>
              <Button type="submit" className="w-full">Add skill</Button>
            </form>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <div className="rounded-md border border-border/70 bg-background/55 p-4">
              <Brain className="h-4 w-4 text-primary" />
              <p className="mt-3 text-2xl font-semibold">{skills.length}</p>
              <p className="text-sm text-muted-foreground">active skills</p>
            </div>
            <div className="rounded-md border border-border/70 bg-background/55 p-4">
              <Target className="h-4 w-4 text-primary" />
              <p className="mt-3 text-2xl font-semibold">{skills.filter(s => s.level >= s.targetLevel).length}</p>
              <p className="text-sm text-muted-foreground">targets reached</p>
            </div>
          </div>
        </div>

        <div className="rounded-md border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur">
          <div className="flex items-center gap-2">
            <ChartNoAxesColumnIncreasing className="h-5 w-5 text-primary" />
            <h2 className="text-lg font-semibold">Progress matrix</h2>
          </div>

          {skills.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No skills tracked yet. Add one above.</p>
          )}

          <div className="mt-5 space-y-5">
            {skills.map((skill) => (
              <div key={skill.id}>
                <div className="flex items-center justify-between gap-4">
                  <div className="min-w-0">
                    <p className="font-medium truncate">{skill.name}</p>
                    <p className="text-xs text-muted-foreground">{skill.category}</p>
                  </div>
                  <p className="text-sm text-muted-foreground shrink-0">{skill.level}/{skill.targetLevel}</p>
                </div>
                <div className="mt-2 h-2 rounded-full bg-muted">
                  <div
                    className="h-2 rounded-full bg-primary transition-all"
                    style={{ width: `${Math.min((skill.level / skill.targetLevel) * 100, 100)}%` }}
                  />
                </div>
                <form action={updateSkillLevel} className="mt-2 flex gap-2">
                  <input type="hidden" name="id" value={skill.id} />
                  <Input
                    name="level"
                    type="number"
                    min="0"
                    max={skill.targetLevel}
                    defaultValue={skill.level}
                    className="h-7 text-xs w-20"
                  />
                  <Button type="submit" size="sm" variant="outline" className="h-7 text-xs">Update</Button>
                </form>
              </div>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
