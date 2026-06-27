import { db } from "@/lib/db";
import { getMockUser } from "@/lib/mock-auth";
import { PageShell } from "@/components/layout/page-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DatePicker } from "@/components/ui/date-picker";
import { createCalendarEvent, deleteCalendarEvent } from "@/app/actions/calendar";
import { MapPinned, Plane, Ticket, Users, CalendarClock, Trash2 } from "lucide-react";
import type { CalendarEvent } from "@prisma/client";

const eventTypeIcons: Record<string, any> = {
  Travel: Plane,
  Learning: Ticket,
  Milestone: Users,
};

export default async function EventsPage() {
  const user = await getMockUser();
  const events = (await db.calendarEvent.findMany({
    where: { userId: user.id },
    orderBy: { startTime: "asc" },
  })) as CalendarEvent[];

  const planCount = events.filter(e => e.startTime > new Date(Date.now() + 7 * 86400000)).length;
  const bookCount = events.filter(e => {
    const diff = e.startTime.getTime() - Date.now();
    return diff > 0 && diff <= 7 * 86400000;
  }).length;
  const confirmCount = events.filter(e => e.startTime <= new Date()).length;

  return (
    <PageShell
      title="Events"
      description="Keep trips, occasions, and milestone logistics visible."
    >
      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-md border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary">Upcoming</p>
              <h2 className="mt-2 text-xl font-semibold">{events.length} events</h2>
            </div>
            <MapPinned className="h-5 w-5 text-muted-foreground" />
          </div>
          <div className="mt-6 grid grid-cols-3 gap-2">
            {[
              { label: "Plan", count: planCount, desc: "> 1 week out" },
              { label: "Book", count: bookCount, desc: "within a week" },
              { label: "Past", count: confirmCount, desc: "occurred" },
            ].map((item) => (
              <div key={item.label} className="rounded-md border border-border/70 bg-background/55 p-3">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">{item.label}</p>
                <p className="mt-3 text-2xl font-semibold">{item.count}</p>
                <p className="text-[10px] text-muted-foreground mt-1">{item.desc}</p>
              </div>
            ))}
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-3">Add new event</h3>
            <form action={createCalendarEvent} className="space-y-3">
              <Input name="title" placeholder="Event title" required />
              <div className="grid grid-cols-2 gap-2">
                <DatePicker name="startTime" includeTime required />
                <DatePicker name="endTime" includeTime required />
              </div>
              <Input name="location" placeholder="Location / venue" />
              <Button type="submit" className="w-full">Create event</Button>
            </form>
          </div>
        </div>

        <div className="rounded-md border border-border/70 bg-card/80 p-6 shadow-sm backdrop-blur">
          <h2 className="text-lg font-semibold">Event pipeline</h2>
          {events.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-8">No events yet.</p>
          )}
          <div className="mt-5 divide-y divide-border/70">
            {events.map((event) => {
              const typeLabel = event.type || "General";
              const Icon = eventTypeIcons[typeLabel] || CalendarClock;

              return (
                <div key={event.id} className="flex items-center justify-between gap-4 py-4 first:pt-0 last:pb-0">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-primary/12 text-primary">
                      <Icon className="h-5 w-5" />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate font-medium">{event.title}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(event.startTime).toLocaleDateString()}
                        {event.location && ` · ${event.location}`}
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
              );
            })}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
