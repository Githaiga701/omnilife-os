"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CalendarDays,
  Command,
  FolderKanban,
  GraduationCap,
  LayoutDashboard,
  PanelsTopLeft,
  Palette,
  Settings,
  Ticket,
  Wallet,
  LogOut,
} from "lucide-react";
import { BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { cn } from "@/lib/utils";
import { logout } from "@/app/actions/auth";

const sidebarItems = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Projects", href: "/projects", icon: FolderKanban },
  { name: "Finances", href: "/finances", icon: Wallet },
  { name: "Calendar", href: "/calendar", icon: CalendarDays },
  { name: "Events", href: "/events", icon: Ticket },
  { name: "Skills", href: "/skills", icon: GraduationCap },
  { name: "Learning", href: "/learning", icon: BookOpen },
  { name: "Hobbies", href: "/hobbies", icon: Palette },
];

export function Sidebar() {
  const pathname = usePathname();

  const isAuthPage = pathname === "/login" || pathname === "/signup";
  if (isAuthPage) return null;

  return (
    <>
      <aside className="sticky top-0 hidden h-screen w-72 shrink-0 flex-col border-r border-sidebar-border bg-sidebar/95 text-sidebar-foreground shadow-2xl shadow-black/20 backdrop-blur-xl md:flex">
        <div className="relative flex h-20 items-center border-b border-sidebar-border px-5">
          <div className="absolute -top-12 left-0 h-24 w-24 bg-primary/10 rounded-full blur-[60px] pointer-events-none" />
          <Link href="/" className="flex min-w-0 items-center gap-3 font-semibold">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-md bg-gradient-to-br from-primary to-purple-600 text-sidebar-primary-foreground shadow-lg shadow-primary/20">
              <PanelsTopLeft className="h-5 w-5" />
            </div>
            <div className="min-w-0">
              <span className="block truncate text-base">OmniLife OS</span>
              <span className="block text-xs font-medium text-sidebar-foreground/55">Personal command center</span>
            </div>
          </Link>
        </div>

        <ScrollArea className="flex-1 py-5 scrollbar-thin">
          <nav className="flex flex-col gap-1.5 px-3">
            {sidebarItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;

              return (
                <Link
                  key={item.name}
                  href={item.href}
                  className={cn(
                    "group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    isActive
                      ? "bg-gradient-to-r from-sidebar-accent to-sidebar-accent/50 text-sidebar-accent-foreground shadow-sm border-l-2 border-primary"
                      : "text-sidebar-foreground/68 hover:border-l-2 hover:border-primary/30"
                  )}
                >
                  <Icon className={cn("h-4 w-4", isActive ? "text-primary" : "text-sidebar-foreground/48 group-hover:text-sidebar-foreground")} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </ScrollArea>

        <Separator />

        <div className="p-4 space-y-2">
          <div className="flex items-center justify-between px-2 py-2">
            <span className="text-xs text-sidebar-foreground/55 uppercase tracking-[0.18em] font-semibold">Theme</span>
            <ThemeToggle />
          </div>

          <Separator className="bg-sidebar-border my-2" />

          <Link href="/settings">
            <Button variant="ghost" className="w-full justify-start gap-3 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground">
              <Settings className="h-4 w-4" />
              Settings
            </Button>
          </Link>

          <form action={logout}>
            <Button type="submit" variant="ghost" className="w-full justify-start gap-3 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-red-500">
              <LogOut className="h-4 w-4" />
              Logout
            </Button>
          </form>
        </div>
      </aside>

      <nav className="sticky top-0 z-40 grid h-16 w-full grid-cols-5 border-b border-border/70 bg-card/95 p-2 shadow-lg shadow-black/20 backdrop-blur md:hidden">
        {sidebarItems.slice(0, 5).map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.name}
              href={item.href}
              aria-label={item.name}
              className={cn(
                "flex h-12 items-center justify-center rounded-lg transition-colors",
                isActive ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground"
              )}
            >
              <Icon className="h-4 w-4" />
            </Link>
          );
        })}
      </nav>
    </>
  );
}
