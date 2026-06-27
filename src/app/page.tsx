import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/mock-auth";
import Link from "next/link";
import {
  ArrowUpRight,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  FolderKanban,
  Gauge,
  Sparkles,
  AlertCircle,
  Clock,
  BookOpen,
  Target,
  Brain,
  TrendingUp,
  DollarSign,
  GraduationCap,
  ListChecks,
  Zap,
  ArrowRight,
  BarChart3,
  type LucideIcon,
} from "lucide-react";
import { PageShell } from "@/components/layout/page-shell";
import { PremiumCard } from "@/components/ui/premium-card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

async function safeModelQuery<T>(query: Promise<T> | undefined): Promise<T | null> {
  if (query === undefined) return null;
  try { return await query; } catch { return null; }
}

export default async function Home() {
  const user = await getCurrentUser();

  const [
    projects, accounts, bills, incomes, events,
  ] = await Promise.all([
    db.project.findMany({ where: { userId: user.id } }),
    db.account.findMany({ where: { userId: user.id } }),
    db.bill.findMany({ where: { userId: user.id }, orderBy: { dueDate: "asc" } }),
    db.incomeEntry.findMany({ where: { userId: user.id } }),
    db.calendarEvent.findMany({ where: { userId: user.id }, orderBy: { startTime: "asc" }, take: 5 }),
  ]);

  const [studySessions, assignments, learningPaths, journals] = await Promise.all([
    db.studySession.findMany({ where: { userId: user.id } }),
    db.assignment.findMany({
      where: {
        status: { not: "DONE" },
        unit: { learningPath: { userId: user.id } },
      },
      include: { unit: { include: { learningPath: true } } },
      orderBy: { dueDate: "asc" },
      take: 5,
    }),
    db.learningPath.findMany({
      where: { userId: user.id },
      include: { units: true },
    }),
    db.journalEntry.findMany({
      where: { userId: user.id },
      orderBy: { date: "desc" },
      take: 3,
    }),
  ]);

  const now = new Date();
  const threeDaysFromNow = new Date(now.getTime() + 3 * 86400000);
  const sevenDaysFromNow = new Date(now.getTime() + 7 * 86400000);

  const activeProjects = projects.filter(p => p.status === "ACTIVE").length;
  const totalBalance = accounts.reduce((sum: number, a: { balance: number }) => sum + a.balance, 0);
  const unpaidBills = bills.filter(b => b.status !== "PAID");
  const totalUnpaidBills = unpaidBills.reduce((sum: number, b: { amount: number }) => sum + b.amount, 0);
  const overdueBills = bills.filter(b => b.status === "OVERDUE");
  const billsDueWithin3Days = bills.filter(b => b.status === "UNPAID" && b.dueDate >= now && b.dueDate <= threeDaysFromNow);
  const billsDueWithin7Days = bills.filter(b => b.status === "UNPAID" && b.dueDate > threeDaysFromNow && b.dueDate <= sevenDaysFromNow);
  const assignmentsDueWithin3Days = assignments.filter(a => a.dueDate && a.dueDate >= now && a.dueDate <= threeDaysFromNow);
  const totalStudyMins = studySessions.reduce((sum: number, s: { duration: number }) => sum + s.duration, 0);
  const pendingIncome = incomes.filter(i => i.status !== "PAID");
  const totalPendingIncome = pendingIncome.reduce((sum: number, i: { totalAmount: number, amountPaid: number }) => sum + (i.totalAmount - i.amountPaid), 0);
  const eventsThisWeek = events.length;
  const notifications = [
    ...overdueBills.map(b => ({ type: "overdue" as const, module: "finance" as const, message: `"${b.title}" — $${b.amount.toFixed(2)} overdue`, severity: "critical" as const })),
    ...billsDueWithin3Days.map(b => ({ type: "due-soon" as const, module: "finance" as const, message: `"${b.title}" — $${b.amount.toFixed(2)} due ${new Date(b.dueDate).toLocaleDateString()}`, severity: "warning" as const })),
    ...billsDueWithin7Days.map(b => ({ type: "upcoming" as const, module: "finance" as const, message: `"${b.title}" — $${b.amount.toFixed(2)} due ${new Date(b.dueDate).toLocaleDateString()}`, severity: "info" as const })),
    ...assignmentsDueWithin3Days.map(a => ({ type: "due-soon" as const, module: "learning" as const, message: `"${a.title}" due ${a.dueDate ? new Date(a.dueDate).toLocaleDateString() : ""}`, severity: "warning" as const })),
  ].sort((a, b) => a.severity === "critical" ? -1 : a.severity === "warning" ? -1 : 1);
  const totalPathProgress = learningPaths.length > 0
    ? Math.round(learningPaths.reduce((sum: number, p: { units: { completed: boolean }[] }) => {
        const completed = p.units.filter((u: { completed: boolean }) => u.completed).length;
        const total = p.units.length || 1;
        return sum + (completed / total) * 100;
      }, 0) / learningPaths.length)
    : 0;

  const readinessScore = (() => {
    const hasBills = unpaidBills.length > 0 ? (1 - unpaidBills.length / Math.max(bills.length, 1)) * 30 : 30;
    const hasIncome = pendingIncome.length > 0 ? (1 - pendingIncome.length / Math.max(incomes.length, 1)) * 20 : 20;
    const hasProjects = activeProjects > 0 ? Math.min(activeProjects / 3, 1) * 25 : 25;
    const hasStudy = studySessions.length > 0 ? Math.min(totalStudyMins / 600, 1) * 25 : 25;
    return Math.round(hasBills + hasIncome + hasProjects + hasStudy);
  })();

  const topPriority = notifications.find(n => n.severity === "critical")?.message || null;
  const nextUpcoming = bills.filter(b => b.status === "UNPAID" && b.dueDate >= now).sort((a, b) => a.dueDate.getTime() - b.dueDate.getTime())[0];
  const upcomingAssignments = assignments.filter(a => a.dueDate && a.dueDate >= now).sort((a, b) => a.dueDate!.getTime() - b.dueDate!.getTime());

  return (
    <PageShell
      title="Dashboard"
      description="Your command center — a live overview of work, money, learning, and system health."
    >
      {/* Hero — Readiness + Primary Metric */}
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <PremiumCard glowColor="primary" className="sm:col-span-2 xl:col-span-2 flex flex-col justify-between">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                System readiness
              </p>
              <p className="mt-1 text-4xl font-bold tracking-tight">
                {readinessScore}%
              </p>
            </div>
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-primary/20 to-purple-600/20 ring-1 ring-primary/20">
              <Gauge className="h-6 w-6 text-primary" />
            </div>
          </div>
          <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
            {readinessScore >= 80
              ? "All modules operating within range. Focus on maintaining momentum."
              : readinessScore >= 50
              ? "Some areas need attention. Check your finances and learning path for pending items."
              : "Several areas require attention. Review overdue bills and incomplete assignments."}
          </p>
          {topPriority && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-red-500/20 bg-red-500/10 px-3 py-2 text-sm text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span className="truncate">{topPriority}</span>
            </div>
          )}
          {!topPriority && notifications.length > 0 && (
            <div className="mt-4 flex items-center gap-2 rounded-xl border border-yellow-500/20 bg-yellow-500/10 px-3 py-2 text-sm text-yellow-400">
              <Clock className="h-4 w-4 shrink-0" />
              <span className="truncate">{notifications.length} item{notifications.length > 1 ? "s" : ""} need{notifications.length === 1 ? "s" : ""} attention</span>
            </div>
          )}
          <div className="mt-4 flex gap-3">
            <Link href="/learning" className={cn(buttonVariants({ variant: "glow", size: "sm" }), "gap-2")}>
              <BookOpen className="h-3.5 w-3.5" />
              Learning
            </Link>
            <Link href="/finances" className={cn(buttonVariants({ variant: "glass", size: "sm" }), "gap-2")}>
              <DollarSign className="h-3.5 w-3.5" />
              Finances
            </Link>
          </div>
        </PremiumCard>

        {[
          { label: "Active projects", value: activeProjects, sub: `${projects.length} total`, icon: FolderKanban, color: "from-blue-500/20 to-cyan-500/20 ring-blue-500/20 text-blue-400" },
          { label: "Available balance", value: `$${totalBalance.toFixed(2)}`, sub: `$${totalUnpaidBills.toFixed(2)} in unpaid bills`, icon: CreditCard, color: "from-green-500/20 to-emerald-500/20 ring-green-500/20 text-green-400" },
          { label: "Course progress", value: `${totalPathProgress}%`, sub: `${learningPaths.length} active paths`, icon: GraduationCap, color: "from-purple-500/20 to-pink-500/20 ring-purple-500/20 text-purple-400" },
        ].map((item) => (
          <PremiumCard key={item.label}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                  {item.label}
                </p>
                <p className="mt-2 text-3xl font-bold tracking-tight">{item.value}</p>
              </div>
              <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${item.color} ring-1`}>
                <item.icon className="h-5 w-5" />
              </div>
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{item.sub}</p>
          </PremiumCard>
        ))}
      </section>

      {/* Notifications */}
      {notifications.length > 0 && (
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <AlertCircle className="h-4 w-4" />
            <span>{notifications.length} notification{notifications.length > 1 ? "s" : ""}</span>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {notifications.slice(0, 4).map((n, i) => (
              <div
                key={i}
                className={`flex items-center gap-3 rounded-xl border px-4 py-3 text-sm backdrop-blur-sm ${
                  n.severity === "critical"
                    ? "border-red-500/30 bg-red-500/10 text-red-400"
                    : n.severity === "warning"
                    ? "border-yellow-500/30 bg-yellow-500/10 text-yellow-400"
                    : "border-blue-500/30 bg-blue-500/10 text-blue-400"
                }`}
              >
                {n.severity === "critical" ? (
                  <AlertCircle className="h-4 w-4 shrink-0" />
                ) : (
                  <Clock className="h-4 w-4 shrink-0" />
                )}
                <span className="flex-1">{n.message}</span>
                <span className="text-[10px] uppercase tracking-wider opacity-70">{n.module}</span>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Daily Operating Plan + Right Stats */}
      <section className="grid gap-4 xl:grid-cols-[1.25fr_0.75fr]">
        <PremiumCard glowColor="primary">
          <div className="flex items-center gap-2 text-sm font-medium text-primary">
            <Sparkles className="h-4 w-4" />
            Today&apos;s operating plan
          </div>
          <h2 className="mt-2 text-2xl font-bold tracking-tight">
            {overdueBills.length > 0 || assignments.length > 0 || unpaidBills.length > 0
              ? `${overdueBills.length + assignments.length + unpaidBills.filter(b => b.status !== "OVERDUE").length} items need attention`
              : "All clear — nothing urgent"}
          </h2>

          <div className="mt-6 divide-y divide-border/40">
            {overdueBills.length > 0 && (
              <div className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <AlertCircle className="mt-0.5 h-5 w-5 text-red-400" />
                  <div>
                    <p className="font-medium text-red-400">{overdueBills.length} overdue bill{overdueBills.length > 1 ? "s" : ""}</p>
                    <p className="mt-1 text-sm text-muted-foreground">Finances</p>
                  </div>
                </div>
                <span className="w-fit rounded-lg border border-red-500/30 bg-red-500/10 px-2.5 py-1 text-xs font-semibold text-red-400">
                  ${overdueBills.reduce((s: number, b: { amount: number }) => s + b.amount, 0).toFixed(2)} overdue
                </span>
              </div>
            )}

            {unpaidBills.filter(b => b.status !== "OVERDUE").slice(0, 2).map((bill) => (
              <div key={bill.id} className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <CreditCard className="mt-0.5 h-5 w-5 text-yellow-400" />
                  <div>
                    <p className="font-medium">{bill.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">Due {new Date(bill.dueDate).toLocaleDateString()}</p>
                  </div>
                </div>
                <span className="w-fit rounded-lg border border-border bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                  ${bill.amount.toFixed(2)}
                </span>
              </div>
            ))}

            {assignments.slice(0, 3).map((assg) => (
              <div key={assg.id} className="flex flex-col gap-3 py-4 first:pt-0 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-start gap-3">
                  <BookOpen className="mt-0.5 h-5 w-5 text-blue-400" />
                  <div>
                    <p className="font-medium">{assg.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{assg.unit.learningPath.title}</p>
                  </div>
                </div>
                {assg.dueDate && (
                  <span className="w-fit rounded-lg border border-border bg-muted px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                    Due {new Date(assg.dueDate).toLocaleDateString()}
                  </span>
                )}
              </div>
            ))}

            {overdueBills.length === 0 && unpaidBills.filter(b => b.status !== "OVERDUE").length === 0 && assignments.length === 0 && (
              <div className="py-8 text-center text-sm text-muted-foreground">
                <CheckCircle2 className="mx-auto h-8 w-8 text-green-400 mb-2" />
                <p>Nothing urgent. All bills and assignments are up to date.</p>
              </div>
            )}
          </div>

          <div className="mt-4 pt-4 border-t border-border/40">
            <p className="text-xs text-muted-foreground">
              Press <kbd className="rounded border border-border bg-muted px-1 py-0.5 text-[10px] font-mono">Cmd+K</kbd> to ask the AI
            </p>
          </div>
        </PremiumCard>

        <div className="space-y-4">
          <PremiumCard>
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-primary">Total study time</p>
                <h2 className="mt-2 text-xl font-semibold">
                  {Math.floor(totalStudyMins / 60)}h {totalStudyMins % 60}m
                </h2>
              </div>
              <Brain className="h-5 w-5 text-muted-foreground" />
            </div>
            <div className="mt-4 space-y-3">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Bills</span>
                <span className="font-medium">{bills.length} total ({unpaidBills.length} unpaid)</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Income</span>
                <span className="font-medium">${totalPendingIncome.toFixed(2)} pending</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Study sessions</span>
                <span className="font-medium">{studySessions.length} logged</span>
              </div>
            </div>
          </PremiumCard>

          {journals.length > 0 && (
            <PremiumCard>
              <div className="flex items-center gap-2 text-sm font-medium text-primary mb-3">
                <BookOpen className="h-4 w-4" />
                Latest reflection
              </div>
              <p className="text-sm leading-relaxed text-muted-foreground line-clamp-3">
                {journals[0].content}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                {new Date(journals[0].date).toLocaleDateString()}
              </p>
            </PremiumCard>
          )}
        </div>
      </section>

      {/* Cash Flow + Learning + System Health */}
      <section className="grid gap-4 lg:grid-cols-3">
        <PremiumCard glowColor="neon" className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-primary">
                <TrendingUp className="h-4 w-4 inline mr-1" />
                Cash flow by month
              </p>
              <h2 className="mt-2 text-xl font-semibold">${totalBalance.toFixed(2)} available</h2>
            </div>
          </div>
          <div className="mt-6 grid h-28 grid-cols-12 items-end gap-2">
            {(() => {
              const monthlyTotals: number[] = [];
              for (let m = 0; m < 12; m++) {
                const monthBills = bills.filter(b => {
                  const d = new Date(b.dueDate);
                  return d.getMonth() === m;
                });
                monthlyTotals.push(monthBills.reduce((s: number, b: { amount: number }) => s + b.amount, 0));
              }
              const max = Math.max(...monthlyTotals, 1);
              return monthlyTotals.map((total, i) => (
                <div
                  key={i}
                  className="rounded-t bg-gradient-to-t from-primary/40 to-primary/20 relative group transition-all duration-200 hover:from-primary/60 hover:to-primary/40"
                  style={{ height: `${Math.round((total / max) * 100)}%` }}
                  title={`Month ${i + 1}: $${total.toFixed(0)}`}
                />
              ));
            })()}
          </div>
        </PremiumCard>

        <PremiumCard glowColor="cosmic">
          <p className="text-sm font-medium text-primary">
            <Target className="h-4 w-4 inline mr-1" />
            System health
          </p>
          <p className="mt-4 text-4xl font-semibold tracking-tight">{readinessScore}%</p>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            {readinessScore >= 80
              ? "All modules operating within range. Focus on maintaining momentum."
              : readinessScore >= 50
              ? "Some areas need attention. Check your finances and learning path for pending items."
              : "Several areas require attention. Review overdue bills and incomplete assignments."}
          </p>
        </PremiumCard>
      </section>

      {/* Quick Action Row */}
      <section className="grid gap-3 grid-cols-2 sm:grid-cols-4">
        <Link
          href="/learning"
          className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/60 p-4 shadow-sm backdrop-blur-xl hover:bg-gradient-to-br hover:from-primary/10 hover:to-purple-600/10 transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/10"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500/20 to-cyan-500/20 ring-1 ring-blue-500/20">
            <BookOpen className="h-5 w-5 text-blue-400" />
          </div>
          <div className="text-sm">
            <p className="font-medium">Learning</p>
            <p className="text-muted-foreground text-xs">{assignments.length} pending</p>
          </div>
        </Link>
        <Link
          href="/finances"
          className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/60 p-4 shadow-sm backdrop-blur-xl hover:bg-gradient-to-br hover:from-green-500/10 hover:to-emerald-500/10 transition-all duration-200 hover:border-green-500/30 hover:shadow-lg hover:shadow-green-500/10"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 ring-1 ring-green-500/20">
            <DollarSign className="h-5 w-5 text-green-400" />
          </div>
          <div className="text-sm">
            <p className="font-medium">Finances</p>
            <p className="text-muted-foreground text-xs">{unpaidBills.length} bills due</p>
          </div>
        </Link>
        <Link
          href="/projects"
          className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/60 p-4 shadow-sm backdrop-blur-xl hover:bg-gradient-to-br hover:from-purple-500/10 hover:to-pink-500/10 transition-all duration-200 hover:border-purple-500/30 hover:shadow-lg hover:shadow-purple-500/10"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-purple-500/20 to-pink-500/20 ring-1 ring-purple-500/20">
            <ListChecks className="h-5 w-5 text-purple-400" />
          </div>
          <div className="text-sm">
            <p className="font-medium">Projects</p>
            <p className="text-muted-foreground text-xs">{activeProjects} active</p>
          </div>
        </Link>
        <Link
          href="/calendar"
          className="flex items-center gap-3 rounded-xl border border-border/40 bg-card/60 p-4 shadow-sm backdrop-blur-xl hover:bg-gradient-to-br hover:from-yellow-500/10 hover:to-orange-500/10 transition-all duration-200 hover:border-yellow-500/30 hover:shadow-lg hover:shadow-yellow-500/10"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-br from-yellow-500/20 to-orange-500/20 ring-1 ring-yellow-500/20">
            <CalendarDays className="h-5 w-5 text-yellow-400" />
          </div>
          <div className="text-sm">
            <p className="font-medium">Calendar</p>
            <p className="text-muted-foreground text-xs">{eventsThisWeek} upcoming</p>
          </div>
        </Link>
      </section>
    </PageShell>
  );
}
