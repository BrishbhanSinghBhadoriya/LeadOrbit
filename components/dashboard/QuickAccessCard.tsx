"use client";

import Link from "next/link";
import { Users, LogIn, Upload, Megaphone, BarChart3, FileSpreadsheet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const ALL_MODULES = [
  {
    href: "/reports/users",
    label: "User Report",
    desc: "Performance & conversion",
    icon: Users,
    color: "bg-blue-50 text-blue-600",
    border: "hover:border-blue-200",
    roles: ["super_admin", "admin", "general_manager", "hr"],
  },
  {
    href: "/attendance",
    label: "Login Report",
    desc: "Attendance & hours",
    icon: LogIn,
    color: "bg-emerald-50 text-emerald-600",
    border: "hover:border-emerald-200",
    roles: null, // all roles
  },
  {
    href: "/leads?import=1",
    label: "Excel Upload",
    desc: "Import & map campaigns",
    icon: Upload,
    color: "bg-amber-50 text-amber-600",
    border: "hover:border-amber-200",
    roles: ["super_admin", "admin", "general_manager"],
  },
  {
    href: "/campaigns",
    label: "Campaigns",
    desc: "Create & assign counsellors",
    icon: Megaphone,
    color: "bg-purple-50 text-purple-600",
    border: "hover:border-purple-200",
    roles: ["super_admin", "admin", "general_manager", "manager", "team_leader"],
  },
  {
    href: "/reports/campaigns",
    label: "Campaign Report",
    desc: "Analytics & payments",
    icon: BarChart3,
    color: "bg-rose-50 text-rose-600",
    border: "hover:border-rose-200",
    roles: ["super_admin", "admin", "general_manager", "manager", "team_leader", "hr"],
  },
  {
    href: "/reports",
    label: "Reports",
    desc: "Export & advanced filters",
    icon: FileSpreadsheet,
    color: "bg-slate-100 text-slate-600",
    border: "hover:border-slate-300",
    roles: ["super_admin", "admin", "general_manager", "manager", "team_leader", "hr"],
  },
];

interface QuickAccessCardProps {
  role?: string;
}

export function QuickAccessCard({ role }: QuickAccessCardProps) {
  const modules = ALL_MODULES.filter(
    (m) => m.roles === null || !role || m.roles.includes(role)
  );

  if (modules.length === 0) return null;

  return (
    <Card className="border border-slate-100 shadow-sm bg-white overflow-hidden">
      <CardHeader className="py-3 px-4 border-b border-slate-100">
        <CardTitle className="text-sm font-bold text-slate-900">Quick Access</CardTitle>
        <p className="text-xs text-slate-400">Reports, imports &amp; campaign tools</p>
      </CardHeader>
      <CardContent className="p-4">
        <div className={`grid gap-3 grid-cols-2 sm:grid-cols-3 ${modules.length >= 6 ? "lg:grid-cols-6" : modules.length >= 4 ? "lg:grid-cols-4" : "lg:grid-cols-3"}`}>
          {modules.map((m) => (
            <Link
              key={m.href}
              href={m.href}
              className={`group flex flex-col gap-2 p-3 rounded-xl border border-slate-100 ${m.border} hover:shadow-sm transition-all bg-white active:scale-95`}
            >
              <div className={`h-8 w-8 rounded-lg flex items-center justify-center shrink-0 ${m.color}`}>
                <m.icon className="h-4 w-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900 group-hover:text-primary leading-tight">{m.label}</p>
                <p className="text-[10px] text-slate-400 mt-0.5 leading-snug">{m.desc}</p>
              </div>
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
