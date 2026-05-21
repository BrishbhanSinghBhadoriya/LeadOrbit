import { connectDB } from "@/lib/db";
import { AttendanceLog, User } from "@/models";
import { requireUser } from "@/lib/auth";
import { AttendanceClient } from "@/components/attendance/AttendanceClient";
import {
  startOfDay, endOfDay, subDays, startOfMonth, endOfMonth,
  startOfWeek, endOfWeek,
} from "date-fns";

export const dynamic = "force-dynamic";

const ADMIN_ROLES = ["super_admin", "admin", "general_manager", "hr"];

function getDateRange(range: string, from?: string, to?: string) {
  const now = new Date();
  switch (range) {
    case "today":     return { start: startOfDay(now),          end: endOfDay(now) };
    case "yesterday": return { start: startOfDay(subDays(now,1)), end: endOfDay(subDays(now,1)) };
    case "7days":     return { start: startOfDay(subDays(now,6)), end: endOfDay(now) };
    case "15days":    return { start: startOfDay(subDays(now,14)),end: endOfDay(now) };
    case "month":     return { start: startOfMonth(now),         end: endOfMonth(now) };
    case "custom":
      if (from && to) return { start: startOfDay(new Date(from)), end: endOfDay(new Date(to)) };
      return null;
    default:          return { start: startOfDay(now),           end: endOfDay(now) };
  }
}

export default async function AttendancePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | undefined }>;
}) {
  const user = await requireUser();
  await connectDB();

  const sp        = await searchParams;
  const range     = sp.range     ?? "today";
  const fromParam = sp.from;
  const toParam   = sp.to;
  const userFilter= sp.userId;   // admin only

  const isAdmin = ADMIN_ROLES.includes(user.role);
  const dateRange = getDateRange(range, fromParam, toParam);

  // ── Build query ──────────────────────────────────────────────────────────
  const query: any = {};
  if (dateRange) {
    query.loginAt = { $gte: dateRange.start, $lte: dateRange.end };
  }

  if (!isAdmin) {
    // Counsellor / team_leader / manager — only own logs
    query.userId = user.sub;
  } else if (userFilter) {
    query.userId = userFilter;
  }

  const [logs, teamMembers] = await Promise.all([
    AttendanceLog.find(query)
      .populate("userId", "name role email")
      .sort({ loginAt: -1 })
      .limit(500)
      .lean(),
    isAdmin
      ? User.find({ active: true })
          .select("_id name role")
          .sort({ name: 1 })
          .lean()
      : Promise.resolve([]),
  ]);

  // ── Compute per-user summary (admin view) ────────────────────────────────
  const userSummaryMap: Record<string, {
    userId: string; name: string; role: string;
    totalSessions: number; totalMinutes: number;
    firstLogin: Date | null; lastLogout: Date | null;
  }> = {};

  for (const log of logs as any[]) {
    if (!log.userId) continue;
    const uid  = String(log.userId._id);
    const mins = log.logoutAt
      ? Math.max(0, Math.round((new Date(log.logoutAt).getTime() - new Date(log.loginAt).getTime()) / 60000))
      : (log.workingMinutes ?? 0);

    if (!userSummaryMap[uid]) {
      userSummaryMap[uid] = {
        userId: uid,
        name: log.userId.name,
        role: log.userId.role,
        totalSessions: 0,
        totalMinutes: 0,
        firstLogin: null,
        lastLogout: null,
      };
    }
    const s = userSummaryMap[uid];
    s.totalSessions++;
    s.totalMinutes += mins;
    if (!s.firstLogin || new Date(log.loginAt) < s.firstLogin) s.firstLogin = new Date(log.loginAt);
    if (log.logoutAt && (!s.lastLogout || new Date(log.logoutAt) > s.lastLogout)) s.lastLogout = new Date(log.logoutAt);
  }

  const userSummaries = Object.values(userSummaryMap).sort((a, b) => b.totalMinutes - a.totalMinutes);

  // ── Serialize ────────────────────────────────────────────────────────────
  const serializedLogs = (logs as any[]).map((l) => ({
    _id:          String(l._id),
    userId:       l.userId ? { _id: String(l.userId._id), name: l.userId.name, role: l.userId.role } : null,
    loginAt:      l.loginAt?.toISOString() ?? null,
    logoutAt:     l.logoutAt?.toISOString() ?? null,
    lastActiveAt: l.lastActiveAt?.toISOString() ?? null,
    workingMinutes: l.workingMinutes ?? 0,
    ip:           l.ip ?? null,
    device:       l.device ?? null,
  }));

  const serializedSummaries = userSummaries.map((s) => ({
    ...s,
    firstLogin:  s.firstLogin?.toISOString()  ?? null,
    lastLogout:  s.lastLogout?.toISOString()  ?? null,
  }));

  const serializedTeam = (teamMembers as any[]).map((m) => ({
    _id: String(m._id), name: m.name, role: m.role,
  }));

  return (
    <AttendanceClient
      logs={serializedLogs}
      userSummaries={serializedSummaries}
      teamMembers={serializedTeam}
      isAdmin={isAdmin}
      currentUserId={user.sub}
      currentUserName={user.name ?? user.email}
      activeRange={range}
      activeFrom={fromParam ?? ""}
      activeTo={toParam ?? ""}
      activeUserId={userFilter ?? ""}
    />
  );
}
