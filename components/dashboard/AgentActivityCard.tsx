"use client";

import { Users, UserCheck, LogIn, Coffee, Phone, CalendarClock } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";

interface AgentActivityCardProps {
  stats: {
    totalUsers: number;
    activeUsersToday: number;
    loggedInUsers: number;
    idleUsers: number;
    totalCallsToday: number;
    totalFollowUpsToday: number;
    recentLogins: {
      id: string;
      name: string;
      role: string;
      loginAt: string | Date;
      lastActiveAt?: string | Date;
      online: boolean;
    }[];
  };
}

export function AgentActivityCard({ stats }: AgentActivityCardProps) {
  const tiles = [
    { label: "Total Users",   value: stats.totalUsers,          icon: Users,         color: "text-blue-600",    bg: "bg-blue-50" },
    { label: "Active Today",  value: stats.activeUsersToday,    icon: UserCheck,     color: "text-emerald-600", bg: "bg-emerald-50" },
    { label: "Logged In",     value: stats.loggedInUsers,       icon: LogIn,         color: "text-indigo-600",  bg: "bg-indigo-50" },
    { label: "Idle",          value: stats.idleUsers,           icon: Coffee,        color: "text-amber-600",   bg: "bg-amber-50" },
    { label: "Calls Today",   value: stats.totalCallsToday,     icon: Phone,         color: "text-primary",     bg: "bg-primary/10" },
    { label: "Follow-ups",    value: stats.totalFollowUpsToday, icon: CalendarClock, color: "text-rose-600",    bg: "bg-rose-50" },
  ];

  return (
    <Card className="border border-slate-100 shadow-sm bg-white overflow-hidden h-full">
      <CardHeader className="py-3 px-4 border-b border-slate-100">
        <CardTitle className="text-sm font-bold text-slate-900">Agent Activity</CardTitle>
        <p className="text-xs text-slate-400">Live team availability &amp; productivity</p>
      </CardHeader>

      <CardContent className="p-4 flex flex-col gap-4">
        {/* Stat tiles — 3 cols always */}
        <div className="grid grid-cols-3 gap-2">
          {tiles.map((t) => (
            <div key={t.label} className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
              <div className={`h-6 w-6 rounded-md flex items-center justify-center mb-1.5 ${t.bg}`}>
                <t.icon className={`h-3.5 w-3.5 ${t.color}`} />
              </div>
              <p className="text-[9px] font-bold text-slate-500 uppercase tracking-wide leading-tight">{t.label}</p>
              <p className="text-lg font-bold text-slate-900 leading-tight">{t.value}</p>
            </div>
          ))}
        </div>

        {/* User list */}
        <div>
          <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">User Status</p>
          <div className="flex flex-col gap-1 max-h-[200px] overflow-y-auto">
            {stats.recentLogins.length === 0 ? (
              <p className="text-xs text-slate-400 italic py-4 text-center">No login activity today</p>
            ) : (
              stats.recentLogins.map((u) => (
                <div key={u.id} className="flex items-center justify-between px-3 py-2 rounded-lg border border-slate-100 hover:bg-slate-50 transition-colors">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative shrink-0">
                      <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary">
                        {u.name.charAt(0).toUpperCase()}
                      </div>
                      <span className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-white ${u.online ? "bg-emerald-500" : "bg-slate-300"}`} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold text-slate-900 leading-tight truncate">{u.name}</p>
                      <p className="text-[10px] text-slate-400 capitalize">{u.role.replace("_", " ")}</p>
                    </div>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <p className="text-[10px] font-medium text-slate-600">{format(new Date(u.loginAt), "hh:mm a")}</p>
                    <p className={`text-[9px] font-bold uppercase ${u.online ? "text-emerald-600" : "text-slate-400"}`}>
                      {u.online ? "Online" : "Offline"}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
