import { db } from "@/lib/db";
import { getMockUser } from "@/lib/mock-auth";
import { PageShell } from "@/components/layout/page-shell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createHobby, updateHobbyProgress, deleteHobby } from "@/app/actions/calendar";
import { Brush, Camera, Music2, Trophy, Trash2, type LucideIcon } from "lucide-react";
import type { Hobby } from "@prisma/client";

const hobbyIcons: Record<string, LucideIcon> = {
  Brush, Camera, Music2, Trophy,
};

export default async function HobbiesPage() {
  const user = await getMockUser();
  const hobbies = (await db.hobby.findMany({
    where: { userId: user.id },
    orderBy: { progress: "desc" },
  })) as Hobby[];

  return (
    <PageShell
      title="Hobbies"
      description="Track creative routines with the same care as work, without turning them into chores."
    >
      <section className="grid gap-4 lg:grid-cols-3">
        {hobbies.map((hobby) => {
          const iconKeys = Object.keys(hobbyIcons);
          const Icon = hobbyIcons[iconKeys[hobbies.indexOf(hobby) % iconKeys.length]] || Trophy;

          return (
            <div key={hobby.id} className="rounded-md border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur">
              <div className="flex items-start justify-between">
                <div>
                  <Icon className="h-5 w-5 text-primary" />
                  <h2 className="mt-4 text-lg font-semibold">{hobby.name}</h2>
                  {hobby.cadence && <p className="mt-1 text-sm text-muted-foreground">{hobby.cadence}</p>}
                </div>
                <form action={deleteHobby}>
                  <input type="hidden" name="id" value={hobby.id} />
                  <Button type="submit" size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-red-400">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </form>
              </div>
              <div className="mt-5 h-2 rounded-full bg-muted">
                <div className="h-2 rounded-full bg-primary" style={{ width: `${hobby.progress}%` }} />
              </div>
              <form action={updateHobbyProgress} className="mt-3 flex flex-wrap gap-2">
                <input type="hidden" name="id" value={hobby.id} />
                <Input
                  name="progress"
                  type="number"
                  min="0"
                  max="100"
                  defaultValue={hobby.progress}
                  className="h-7 text-xs w-16"
                />
                <Button type="submit" size="sm" variant="outline" className="h-7 text-xs">Update</Button>
              </form>
              <p className="mt-2 text-sm font-medium">{hobby.progress}% rhythm score</p>
            </div>
          );
        })}

        {/* Add new hobby card */}
        <div className="rounded-md border border-dashed border-border/70 bg-card/40 p-6 shadow-sm backdrop-blur">
          <Trophy className="h-5 w-5 text-muted-foreground" />
          <h2 className="mt-4 text-lg font-semibold">Add hobby</h2>
          <form action={createHobby} className="mt-4 space-y-3">
            <Input name="name" placeholder="Hobby name" required />
            <Input name="cadence" placeholder="Cadence (e.g., 2x weekly)" />
            <Input name="progress" type="number" min="0" max="100" defaultValue="0" placeholder="Progress %" />
            <Button type="submit" className="w-full" variant="outline">Add hobby</Button>
          </form>
        </div>
      </section>
    </PageShell>
  );
}
