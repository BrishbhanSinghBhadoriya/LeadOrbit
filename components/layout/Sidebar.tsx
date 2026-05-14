"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard, Users, Kanban, GraduationCap, BookOpen,
  CalendarClock, UserCog, BarChart3, Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { Role } from "@/types";

const NAV = [
  { href: "/dashboard", label: "Dashboard", icon: LayoutDashboard, roles: "all" },
  { href: "/leads", label: "Leads", icon: Users, roles: "all" },
  { href: "/pipeline", label: "Pipeline", icon: Kanban, roles: ["super_admin", "admin", "general_manager", "manager", "team_leader"] },
  { href: "/universities", label: "Universities", icon: GraduationCap, roles: ["super_admin", "admin", "general_manager", "it"] },
  { href: "/courses", label: "Courses", icon: BookOpen, roles: ["super_admin", "admin", "general_manager", "it"] },
  { href: "/followups", label: "Follow-ups", icon: CalendarClock, roles: "all" },
  { href: "/employees", label: "Employees", icon: UserCog, roles: ["super_admin", "general_manager", "hr", "admin"] },
  { href: "/analytics", label: "Analytics", icon: BarChart3, roles: ["super_admin", "admin", "general_manager", "manager", "team_leader", "hr"] },
  { href: "/settings", label: "Settings", icon: Settings, roles: ["super_admin", "it"] },
] as const;

export function Sidebar({ role }: { role: Role }) {
  const pathname = usePathname();
  return (
    <aside className="hidden md:flex w-60 flex-col border-r bg-background">
      <div className="h-16 flex items-center px-6 border-b">
        <span className="font-bold">Edu CRM</span>
      </div>
      <nav className="flex-1 p-3 space-y-1">
        {NAV.filter((n) => n.roles === "all" || (n.roles as readonly string[]).includes(role)).map((n) => {
          const active = pathname?.startsWith(n.href);
          const Icon = n.icon;
          return (
            <Link key={n.href} href={n.href}
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition",
                active ? "bg-primary text-primary-foreground" : "hover:bg-muted"
              )}>
              <Icon className="h-4 w-4" />
              {n.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
