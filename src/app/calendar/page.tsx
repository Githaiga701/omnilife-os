import { db } from "@/lib/db";
import { getMockUser } from "@/lib/mock-auth";
import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { createCalendarEvent, deleteCalendarEvent } from "@/app/actions/calendar";
import { CalendarClock, MapPin, Trash2 } from "lucide-react";

export default async function CalendarPage() {
  const user = await getMockUser();
  const events = await db.calendarEvent.findMany({
    where: { userId: user.id },
    orderBy: { startTime: "asc" },
  });

  const todayEvents = events.filter(e => {
    const today = new Date();
    return e.startTime.toDateString() === today.toDateString();
  });

  const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const dayCounts = weekDays.map((_, i) => {
    const dayEvents = events.filter(e => e.startTime.getDay() === (i + 1) % 7);
    return dayEvents.length;
  });
  const maxCount = Math.max(...dayCounts, 1);

  return (
    <PageShell
      title="Calendar"
      description="Schedule events, protect focus blocks, and keep everything aligned."
    >
      <section className="grid gap-4 lg:grid-cols-[1fr_0.85fr]">
        <div className="rounded-md border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary">Week load</p>
              <h2 className="mt-2 text-xl font-semibold">{events.length} total events</h2>
            </div>
            <CalendarClock className="h-5 w-5 text-muted-foreground" />
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-7">
            {weekDays.map((day, i) => (
              <div key={day} className="rounded-md border border-border/70 bg-background/55 p-3">
                <p className="text-xs font-semibold text-center">{day}</p>
                <div className="mt-3 h-20 rounded-md bg-muted flex items-end overflow-hidden">
                  <div
                    className="w-full rounded-t bg-primary/60 transition-all"
                    style={{ height: `${Math.round((dayCounts[i] / maxCount) * 100)}%` }}
                  />
                </div>
                <p className="mt-2 text-xs text-center text-muted-foreground">{dayCounts[i]} events</p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-md border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur">
          <p className="text-sm font-medium text-primary">Add event</p>
          <h2 className="mt-2 text-xl font-semibold">New calendar entry</h2>
          <form action={createCalendarEvent} className="mt-4 space-y-3">
            <div>
              <Label htmlFor="title">Title</Label>
              <Input name="title" id="title" placeholder="Event title" required />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Start</Label>
                <DatePicker name="startTime" includeTime required />
              </div>
              <div>
                <Label>End</Label>
                <DatePicker name="endTime" includeTime required />
              </div>
            </div>
            <div>
              <Label htmlFor="location">Location</Label>
              <Input name="location" id="location" placeholder="Optional venue/link" />
            </div>
            <Button type="submit" className="w-full">Add to calendar</Button>
          </form>
        </div>
      </section>

      {/* Event list */}
      <section className="rounded-md border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur">
        <h2 className="text-lg font-semibold mb-4">All events</h2>
        {events.length === 0 && (
          <p className="text-sm text-muted-foreground text-center py-8">No events yet. Add one above.</p>
        )}
        <div className="divide-y divide-border/70">
          {events.map((event) => (
            <div key={event.id} className="flex items-center justify-between py-3 first:pt-0 last:pb-0">
              <div className="flex items-start gap-3 min-w-0">
                <CalendarClock className="h-5 w-5 text-primary mt-0.5 shrink-0" />
                <div className="min-w-0">
                  <p className="font-medium truncate">{event.title}</p>
                  <p className="text-xs text-muted-foreground">
                    {new Date(event.startTime).toLocaleString()} – {new Date(event.endTime).toLocaleTimeString()}
                    {event.location && <span className="ml-2 inline-flex items-center gap-1"><MapPin className="h-3 w-3" />{event.location}</span>}
                  </p>
                </div>
              </div>
              <form action={deleteCalendarEvent}>
                <input type="hidden" name="id" value={event.id} />
                <Button type="submit" size="icon" variant="ghost" className="h-8 w-8 text-muted-foreground hover:text-red-400">
                  <Trash2 className="h-4 w-4" />
                </Button>
              </form>
            </div>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
