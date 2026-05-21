"use client";

import { useState, useTransition } from "react";
import { useRouter, usePathname } from "next/navigation";
import {
  Clock, LogIn, LogOut, Users, Timer,
  Download, Filter, Calendar, ChevronDown,
  User as UserIcon, Activity, CheckCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { format, differenceInMinutes } from "date-fns";
import Link from "next/link";

// ── Types ────────────────────────────────────────────────────────────────────
interface LogEntry {
  _id: string;
  userId: { _id: string; name: string; role: string } | null;
  loginAt: string | null;
  logoutAt: string | null;
  lastActiveAt: string | null;
  workingMinutes: number;
  ip: string | null;
  device: string | null;
}

interface UserSummary {
  userId: string;
  name: string;
  role: string;
  totalSessions: number;
  totalMinutes: number;
  firstLogin: string | null;
  lastLogout: string | null;
}

interface Props {
  logs: LogEntry[];
  userSummaries: UserSummary[];
  teamMembers: { _id: string; name: string; role: string }[];
  isAdmin: boolean;
  currentUserId: string;
  currentUserName: string;
  activeRange: string;
  activeFrom: string;
  activeTo: string;
  activeUserId: string;
}

// ── Helpers ──────────────────────────────────────────────────────────────────
function fmtMins(mins: number) {
  if (!mins || mins <= 0) return "0h 0m";
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${h}h ${m}m`;
}

function getWorkingMins(log: LogEntry) {
  if (log.logoutAt && log.loginAt) {
    return Math.max(0, differenceInMinutes(new Date(log.logoutAt), new Date(log.loginAt)));
  }
  return log.workingMinutes ?? 0;
}

function WorkBadge({ mins }: { mins: number }) {
  const h = mins / 60;
  if (h >= 8)  return <span className="text-[10px] font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded-full">{fmtMins(mins)}</span>;
  if (h >= 4)  return <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full">{fmtMins(mins)}</span>;
  return <span className="text-[10px] font-bold text-red-500 bg-red-50 px-1.5 py-0.5 rounded-full">{fmtMins(mins)}</span>;
}

const RANGE_OPTIONS = [
  { value: "today",     label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "7days",     label: "Last 7 Days" },
  { value: "15days",    label: "Last 15 Days" },
  { value: "month",     label: "This Month" },
  { value: "custom",    label: "Custom Range" },
];

// ── Main Component ───────────────────────────────────────────────────────────
export function AttendanceClient({
  logs, userSummaries, teamMembers, isAdmin,
  currentUserId, currentUserName,
  activeRange, activeFrom, activeTo, activeUserId,
}: Props) {
  const router   = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  const [range,   setRange]   = useState(activeRange || "today");
  const [from,    setFrom]    = useState(activeFrom  || "");
  const [to,      setTo]      = useState(activeTo    || "");
  const [userId,  setUserId]  = useState(activeUserId || "");
  const [tab,     setTab]     = useState<"summary" | "detail">(isAdmin ? "summary" : "detail");

  function applyFilters(overrides?: Partial<{ range: string; from: string; to: string; userId: string }>) {
    const r  = overrides?.range  ?? range;
    const f  = overrides?.from   ?? from;
    const t  = overrides?.to     ?? to;
    const u  = overrides?.userId ?? userId;
    const params = new URLSearchParams();
    params.set("range", r);
    if (r === "custom" && f) params.set("from", f);
    if (r === "custom" && t) params.set("to", t);
    if (u) params.set("userId", u);
    startTransition(() => router.push(`${pathname}?${params.toString()}`));
  }

  // ── Stats ──────────────────────────────────────────────────────────────
  const totalSessions  = logs.length;
  const totalMins      = logs.reduce((s, l) => s + getWorkingMins(l), 0);
  const activeSessions = logs.filter((l) => !l.logoutAt).length;
  const uniqueUsers    = new Set(logs.map((l) => l.userId?._id)).size;

  const rangeLabel = RANGE_OPTIONS.find((o) => o.value === range)?.label ?? "Today";

  return (
    <div className="flex flex-col gap-4 pb-6 pl-10 md:pl-0">

      {/* ── Header ── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 leading-tight">
            {isAdmin ? "Attendance & Login Report" : "My Attendance"}
          </h1>
          <p className="text-xs text-slate-400 mt-0.5">
            {isAdmin
              ? "Team login time, working hours & session history"
              : `Login history for ${currentUserName}`}
          </p>
        </div>
        <Button variant="outline" size="sm" asChild className="h-8 rounded-lg text-xs font-semibold bg-white self-start sm:self-auto">
          <Link href={`/api/reports/attendance/export?range=${range}&from=${from}&to=${to}&userId=${userId}`}
            className="flex items-center gap-1.5">
            <Download className="h-3.5 w-3.5" /> Export Excel
          </Link>
        </Button>
      </div>

      {/* ── Filters ── */}
      <div className="rounded-xl border border-slate-100 bg-white shadow-sm p-3 flex flex-col gap-3">
        {/* Date range pills */}
        <div className="flex flex-wrap gap-1.5">
          {RANGE_OPTIONS.map((o) => (
            <button
              key={o.value}
              onClick={() => {
                setRange(o.value);
                if (o.value !== "custom") applyFilters({ range: o.value });
              }}
              className={`px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                range === o.value
                  ? "bg-primary text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {o.label}
            </button>
          ))}
        </div>

        {/* Custom date inputs */}
        {range === "custom" && (
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5">
              <Calendar className="h-3.5 w-3.5 text-slate-400" />
              <Input type="date" value={from} onChange={(e) => setFrom(e.target.value)}
                className="h-8 text-xs w-36 border-slate-200 rounded-lg" />
            </div>
            <span className="text-xs text-slate-400">to</span>
            <Input type="date" value={to} onChange={(e) => setTo(e.target.value)}
              className="h-8 text-xs w-36 border-slate-200 rounded-lg" />
            <Button size="sm" onClick={() => applyFilters()} disabled={!from || !to}
              className="h-8 rounded-lg text-xs font-semibold px-3">
              Apply
            </Button>
          </div>
        )}

        {/* User filter — admin only */}
        {isAdmin && (
          <div className="flex items-center gap-2">
            <UserIcon className="h-3.5 w-3.5 text-slate-400 shrink-0" />
            <select
              value={userId}
              onChange={(e) => { setUserId(e.target.value); applyFilters({ userId: e.target.value }); }}
              className="h-8 px-2.5 text-xs border border-slate-200 rounded-lg bg-white outline-none focus:ring-1 focus:ring-primary/20 flex-1 max-w-xs"
            >
              <option value="">All Team Members</option>
              {teamMembers.map((m) => (
                <option key={m._id} value={m._id}>{m.name} ({m.role.replace("_", " ")})</option>
              ))}
            </select>
            {isPending && <span className="text-[10px] text-slate-400 animate-pulse">Loading…</span>}
          </div>
        )}
      </div>

      {/* ── Summary tiles ── */}
      <div className={`grid gap-3 ${isAdmin ? "grid-cols-2 sm:grid-cols-4" : "grid-cols-2 sm:grid-cols-3"}`}>
        {isAdmin && (
          <div className="rounded-xl border border-slate-100 bg-white p-3 flex items-center gap-3 shadow-sm">
            <div className="h-9 w-9 rounded-xl bg-blue-50 flex items-center justify-center shrink-0">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Users</p>
              <p className="text-xl font-bold text-slate-900">{uniqueUsers}</p>
            </div>
          </div>
        )}
        <div className="rounded-xl border border-slate-100 bg-white p-3 flex items-center gap-3 shadow-sm">
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <LogIn className="h-4 w-4 text-primary" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Sessions</p>
            <p className="text-xl font-bold text-slate-900">{totalSessions}</p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-3 flex items-center gap-3 shadow-sm">
          <div className="h-9 w-9 rounded-xl bg-emerald-50 flex items-center justify-center shrink-0">
            <Timer className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Total Hours</p>
            <p className="text-xl font-bold text-slate-900">{fmtMins(totalMins)}</p>
          </div>
        </div>
        <div className="rounded-xl border border-slate-100 bg-white p-3 flex items-center gap-3 shadow-sm">
          <div className="h-9 w-9 rounded-xl bg-amber-50 flex items-center justify-center shrink-0">
            <Activity className="h-4 w-4 text-amber-600" />
          </div>
          <div>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">Active Now</p>
            <p className="text-xl font-bold text-slate-900">{activeSessions}</p>
          </div>
        </div>
      </div>

      {/* ── Tabs (admin only) ── */}
      {isAdmin && (
        <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
          {(["summary", "detail"] as const).map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all capitalize ${
                tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"
              }`}
            >
              {t === "summary" ? "User Summary" : "Session Detail"}
            </button>
          ))}
        </div>
      )}

      {/* ── Admin: User Summary tab ── */}
      {isAdmin && tab === "summary" && (
        <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60">
            <p className="text-xs font-bold text-slate-700">
              Team Summary — <span className="text-primary">{rangeLabel}</span>
            </p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left">
                  <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">User</th>
                  <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Role</th>
                  <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Sessions</th>
                  <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Time</th>
                  <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">First Login</th>
                  <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Last Logout</th>
                  <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Avg/Day</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {userSummaries.length === 0 ? (
                  <tr><td colSpan={7} className="px-4 py-10 text-center text-slate-400 italic text-xs">No attendance data for this period</td></tr>
                ) : userSummaries.map((s) => {
                  const avgMins = s.totalSessions > 0 ? Math.round(s.totalMinutes / s.totalSessions) : 0;
                  return (
                    <tr key={s.userId} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-2.5">
                        <div className="flex items-center gap-2">
                          <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-[11px] font-bold text-primary shrink-0">
                            {s.name.charAt(0).toUpperCase()}
                          </div>
                          <button
                            onClick={() => { setUserId(s.userId); setTab("detail"); applyFilters({ userId: s.userId }); }}
                            className="font-semibold text-slate-900 hover:text-primary transition-colors text-left"
                          >
                            {s.name}
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-2.5">
                        <span className="capitalize text-slate-500">{s.role.replace("_", " ")}</span>
                      </td>
                      <td className="px-4 py-2.5 font-semibold text-slate-700">{s.totalSessions}</td>
                      <td className="px-4 py-2.5"><WorkBadge mins={s.totalMinutes} /></td>
                      <td className="px-4 py-2.5 text-slate-500">
                        {s.firstLogin ? format(new Date(s.firstLogin), "dd MMM, hh:mm a") : "—"}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500">
                        {s.lastLogout ? format(new Date(s.lastLogout), "dd MMM, hh:mm a") : <span className="text-emerald-600 font-semibold">Active</span>}
                      </td>
                      <td className="px-4 py-2.5 text-slate-500">{fmtMins(avgMins)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Session Detail (both admin + counsellor) ── */}
      {(!isAdmin || tab === "detail") && (
        <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
          <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60 flex items-center justify-between">
            <p className="text-xs font-bold text-slate-700">
              {isAdmin ? "Session Detail" : "My Login History"} —{" "}
              <span className="text-primary">{rangeLabel}</span>
            </p>
            <span className="text-[10px] text-slate-400">{logs.length} sessions</span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="border-b border-slate-100 bg-slate-50 text-left">
                  {isAdmin && <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">User</th>}
                  <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Date</th>
                  <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Login Time</th>
                  <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Logout Time</th>
                  <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Working Time</th>
                  <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Last Active</th>
                  <th className="px-4 py-2.5 text-[10px] font-bold text-slate-500 uppercase tracking-wider">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {logs.length === 0 ? (
                  <tr><td colSpan={isAdmin ? 7 : 6} className="px-4 py-10 text-center text-slate-400 italic text-xs">No sessions found for this period</td></tr>
                ) : logs.map((log) => {
                  const mins    = getWorkingMins(log);
                  const isLive  = !log.logoutAt;
                  return (
                    <tr key={log._id} className="hover:bg-slate-50 transition-colors">
                      {isAdmin && (
                        <td className="px-4 py-2.5">
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary shrink-0">
                              {(log.userId?.name ?? "?").charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <p className="font-semibold text-slate-900">{log.userId?.name ?? "—"}</p>
                              <p className="text-[10px] text-slate-400 capitalize">{log.userId?.role?.replace("_", " ")}</p>
                            </div>
                          </div>
                        </td>
                      )}
                      <td className="px-4 py-2.5 text-slate-600 font-medium whitespace-nowrap">
                        {log.loginAt ? format(new Date(log.loginAt), "dd MMM yyyy") : "—"}
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-emerald-700 font-semibold">
                          <LogIn className="h-3 w-3" />
                          {log.loginAt ? format(new Date(log.loginAt), "hh:mm a") : "—"}
                        </div>
                      </td>
                      <td className="px-4 py-2.5 whitespace-nowrap">
                        {log.logoutAt ? (
                          <div className="flex items-center gap-1 text-red-500 font-semibold">
                            <LogOut className="h-3 w-3" />
                            {format(new Date(log.logoutAt), "hh:mm a")}
                          </div>
                        ) : (
                          <span className="text-slate-400">—</span>
                        )}
                      </td>
                      <td className="px-4 py-2.5">
                        <WorkBadge mins={mins} />
                      </td>
                      <td className="px-4 py-2.5 text-slate-400 whitespace-nowrap">
                        {log.lastActiveAt ? format(new Date(log.lastActiveAt), "hh:mm a") : "—"}
                      </td>
                      <td className="px-4 py-2.5">
                        {isLive ? (
                          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            Live
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[10px] font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                            <CheckCircle2 className="h-3 w-3" />
                            Done
                          </span>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
