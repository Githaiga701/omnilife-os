import { db } from "@/lib/db";
import { getMockUser } from "@/lib/mock-auth";
import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { StudyTimer } from "@/components/learning/study-timer";
import { 
  createLearningPath, updateUnitProgress, 
  toggleAssignment, addJournalEntry 
} from "@/app/actions/learning";
import { BookOpen, Clock } from "lucide-react";
import type { Assignment, JournalEntry, LearningPath, StudySession, Unit } from "@prisma/client";

type UnitWithAssignments = Unit & { assignments: Assignment[] };
type LearningPathWithUnits = LearningPath & { units: UnitWithAssignments[] };

export default async function LearningPage() {
  const user = await getMockUser();

  const learningPaths = (await db.learningPath.findMany({
    where: { userId: user.id },
    include: {
      units: { 
        orderBy: { order: "asc" },
        include: { assignments: true }
      },
    },
    orderBy: { createdAt: "desc" },
  })) as LearningPathWithUnits[];

  const journals = (await db.journalEntry.findMany({
    where: { userId: user.id },
    orderBy: { date: "desc" },
    take: 3,
  }).catch(() => [])) as JournalEntry[];

  const studySessions = (await db.studySession.findMany({
    where: { userId: user.id },
  })) as StudySession[];

  const totalMins = studySessions.reduce((sum, log) => sum + log.duration, 0);

  return (
    <PageShell
      title="Learning & Growth"
      description="Track your skills, units, and study time."
    >
      <div className="flex gap-4">
        <div className="flex-1" />
        <Card className="w-40">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Study Time</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{Math.floor(totalMins / 60)}h {totalMins % 60}m</div>
          </CardContent>
        </Card>
      </div>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Start a New Learning Path</CardTitle>
        </CardHeader>
        <CardContent>
          <form action={createLearningPath} className="flex gap-2">
            <Input name="title" placeholder="e.g., Learn Machine Learning, Spanish B2..." className="flex-1" required />
            <Button type="submit">Create Path</Button>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-6 mt-6">
        {learningPaths.length === 0 && (
          <div className="text-center py-12 border rounded-lg border-dashed">
            <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
            <h3 className="mt-4 text-lg font-semibold">No learning paths yet</h3>
            <p className="text-sm text-muted-foreground">Create your first course or skill above to get started.</p>
          </div>
        )}

        {learningPaths.map((path) => {
          const avgProgress = path.units.length > 0 
            ? Math.round((path.units.filter(u => u.completed).length / path.units.length) * 100)
            : 0;

          return (
            <Card key={path.id} className="overflow-hidden">
              <CardHeader className="bg-muted/50">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-xl">{path.title}</CardTitle>
                  <Badge variant="secondary">{avgProgress}% Complete</Badge>
                </div>
                <Progress value={avgProgress} className="h-2 mt-2" />
              </CardHeader>
              
              <CardContent className="grid md:grid-cols-2 gap-6 pt-6">
                <div className="space-y-6">
                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      <BookOpen className="h-4 w-4" /> Units / Chapters
                    </h3>
                    <div className="space-y-3">
                      {path.units.map((unit) => (
                        <div key={unit.id} className="flex items-center gap-2">
                          <Checkbox 
                            id={unit.id}
                            checked={unit.completed}
                            onCheckedChange={(checked) => updateUnitProgress(unit.id, !!checked)}
                          />
                          <label 
                            htmlFor={unit.id} 
                            className={`flex-1 text-sm ${unit.completed ? "line-through text-muted-foreground" : ""}`}
                          >
                            {unit.title}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="font-semibold mb-3 flex items-center gap-2">
                      Assignments
                    </h3>
                    <div className="space-y-2">
                      {path.units.flatMap(u => u.assignments).length === 0 && <p className="text-sm text-muted-foreground">No assignments added yet.</p>}
                      {path.units.flatMap(u => u.assignments).map((assg) => {
                        const nextStatus = assg.status === "PENDING" ? "IN_PROGRESS" : assg.status === "IN_PROGRESS" ? "DONE" : "PENDING";
                        return (
                          <form key={assg.id} action={toggleAssignment.bind(null, assg.id, nextStatus)} className="flex items-center space-x-2">
                            <input type="hidden" name="assignmentId" value={assg.id} />
                            <button type="submit" className={`h-5 w-5 rounded border flex items-center justify-center transition-colors cursor-pointer ${
                              assg.status === "DONE" ? "bg-green-500 border-green-500 text-white" :
                              assg.status === "IN_PROGRESS" ? "bg-blue-500/20 border-blue-400" :
                              "bg-transparent border-muted-foreground/30 hover:border-muted-foreground"
                            }`}>
                              {assg.status === "DONE" && <span className="text-xs">✓</span>}
                              {assg.status === "IN_PROGRESS" && <span className="text-xs text-blue-500">◐</span>}
                            </button>
                            <span className={`text-sm font-medium leading-none ${
                              assg.status === "DONE" ? "line-through text-muted-foreground" :
                              assg.status === "IN_PROGRESS" ? "text-blue-400" : ""
                            }`}>
                              {assg.title}
                              {assg.status === "IN_PROGRESS" && <span className="ml-2 text-xs text-blue-400">(in progress)</span>}
                            </span>
                          </form>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="space-y-6">
                  <StudyTimer learningPathId={path.id} learningPathTitle={path.title} />
                  
                  <div>
                    <h3 className="font-semibold mb-3">Recent Journal Entries</h3>
                    <div className="space-y-3 mb-4">
                      {journals.map((j) => (
                        <div key={j.id} className="p-3 bg-muted rounded-md text-sm">
                          <p className="text-muted-foreground text-xs mb-1">
                            {new Date(j.date).toLocaleDateString()}
                          </p>
                          <p>{j.content}</p>
                        </div>
                      ))}
                    </div>
                    <form action={addJournalEntry.bind(null, path.id)} className="space-y-2">
                      <Textarea name="content" placeholder="What did you learn today? Any breakthroughs?" rows={3} />
                      <Button type="submit" variant="outline" className="w-full">Save Journal Entry</Button>
                    </form>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </PageShell>
  );
}
