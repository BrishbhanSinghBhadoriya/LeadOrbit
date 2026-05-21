import { connectDB } from "@/lib/db";
import { Lead, User, FollowUp, AttendanceLog } from "@/models";
import { startOfDay, endOfDay } from "date-fns";

export async function getLeadScope(userId: string, role: string) {
  if (role === "counselor") return { assignedTo: userId };
  if (role === "team_leader" || role === "manager") {
    const members = await User.find({ managerId: userId }).select("_id").lean();
    return { assignedTo: { $in: [userId, ...members.map((m: any) => m._id)] } };
  }
  return {};
}

export async function getCallOverviewStats(scope: Record<string, unknown>) {
  await connectDB();
  const today = startOfDay(new Date());
  const tomorrow = endOfDay(new Date());

  // Single aggregation to get all counts at once — much faster than 7 separate queries
  const [agg, callsToday] = await Promise.all([
    Lead.aggregate([
      { $match: scope },
      {
        $group: {
          _id: null,
          total: { $sum: 1 },
          attempted: {
            $sum: {
              $cond: [
                {
                  $or: [
                    { $eq: ["$status", "attempted_contact"] },
                    { $gt: [{ $size: { $ifNull: ["$callLogs", []] } }, 0] },
                  ],
                },
                1, 0,
              ],
            },
          },
          connected: {
            $sum: {
              $cond: [{ $eq: ["$status", "connected"] }, 1, 0],
            },
          },
          notConnected: {
            $sum: {
              $cond: [
                { $in: ["$callStatus", ["not_connected", "busy", "switched_off", "wrong_number"]] },
                1, 0,
              ],
            },
          },
          followUp: {
            $sum: { $cond: [{ $eq: ["$status", "follow_up"] }, 1, 0] },
          },
          converted: {
            $sum: { $cond: [{ $eq: ["$status", "converted"] }, 1, 0] },
          },
        },
      },
    ]),
    Lead.aggregate([
      { $match: scope },
      { $unwind: { path: "$callLogs", preserveNullAndEmptyArrays: false } },
      { $match: { "callLogs.at": { $gte: today, $lte: tomorrow } } },
      { $count: "n" },
    ]),
  ]);

  const s = agg[0] ?? { total: 0, attempted: 0, connected: 0, notConnected: 0, followUp: 0, converted: 0 };
  const totalCallsToday = callsToday[0]?.n ?? 0;
  const attemptRate = s.total ? Math.round((s.attempted / s.total) * 100) : 0;
  const connectRate = s.attempted ? Math.round((s.connected / s.attempted) * 100) : 0;
  const conversionRate = s.total ? Math.round((s.converted / s.total) * 100) : 0;

  return {
    totalLeads: s.total,
    attemptedCalls: s.attempted,
    connectedCalls: s.connected,
    notConnectedCalls: s.notConnected,
    followUps: s.followUp,
    conversionCount: s.converted,
    totalCallsToday,
    attemptRate,
    connectRate,
    conversionRate,
  };
}

export async function getAgentActivityStats() {
  await connectDB();
  const today = startOfDay(new Date());
  const tomorrow = endOfDay(new Date());

  const [totalUsers, activeUsers, loggedInToday, attendanceToday, callsAgg, followUpsToday] =
    await Promise.all([
      User.countDocuments({ active: true }),
      User.countDocuments({ active: true, lastLoginAt: { $gte: today } }),
      AttendanceLog.countDocuments({ loginAt: { $gte: today, $lte: tomorrow } }),
      AttendanceLog.find({ loginAt: { $gte: today, $lte: tomorrow } })
        .populate("userId", "name role")
        .sort({ loginAt: -1 })
        .limit(20)
        .lean(),
      Lead.aggregate([
        { $unwind: { path: "$callLogs", preserveNullAndEmptyArrays: false } },
        { $match: { "callLogs.at": { $gte: today, $lte: tomorrow } } },
        { $count: "n" },
      ]),
      FollowUp.countDocuments({
        scheduledAt: { $gte: today, $lte: tomorrow },
        status: { $in: ["pending", "rescheduled"] },
      }),
    ]);

  return {
    totalUsers,
    activeUsersToday: activeUsers,
    loggedInUsers: loggedInToday,
    idleUsers: Math.max(0, totalUsers - activeUsers),
    totalCallsToday: callsAgg[0]?.n ?? 0,
    totalFollowUpsToday: followUpsToday,
    recentLogins: (attendanceToday as any[]).map((a) => ({
      id: a._id.toString(),
      name: a.userId?.name ?? "User",
      role: a.userId?.role ?? "",
      loginAt: a.loginAt,
      lastActiveAt: a.lastActiveAt,
      online: !a.logoutAt,
    })),
  };
}

const STAGE_STATUSES: Record<string, string[]> = {
  attempted:    ["attempted_contact"],
  connected:    ["connected"],
  interested:   ["interested", "hot", "warm"],
  registration: ["application_started", "qualified"],
  payment:      ["payment_pending", "documents_pending"],
  converted:    ["converted"],
  closed_lost:  ["not_interested", "rejected"],
  not_interested: ["not_interested", "spam", "cold"],
  follow_up:    ["follow_up", "callback"],
};

const STAGE_LABELS: Record<string, string> = {
  attempted:      "Attempted",
  connected:      "Connected",
  interested:     "Interested",
  registration:   "Registration Done",
  payment:        "Payment Status",
  converted:      "Converted",
  closed_lost:    "Closed Lost",
  not_interested: "Not Interested",
  follow_up:      "Follow-up Pending",
};

export async function getLeadsByStageStats(
  scope: Record<string, unknown>,
  filters?: { campaignId?: string; from?: Date; to?: Date; counselorId?: string }
) {
  await connectDB();
  const query: Record<string, unknown> = { ...scope };
  if (filters?.campaignId) query.campaignId = filters.campaignId;
  if (filters?.counselorId) query.assignedTo = filters.counselorId;
  if (filters?.from || filters?.to) {
    query.createdAt = {};
    if (filters.from) (query.createdAt as any).$gte = filters.from;
    if (filters.to) (query.createdAt as any).$lte = filters.to;
  }

  // Single aggregation — group by status to get all counts in one DB round-trip
  const [total, statusCounts] = await Promise.all([
    Lead.countDocuments(query),
    Lead.aggregate([
      { $match: query },
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]),
  ]);

  // Build a map of status → count
  const countMap: Record<string, number> = {};
  for (const row of statusCounts) {
    if (row._id) countMap[row._id] = (countMap[row._id] ?? 0) + row.count;
  }

  const stages = Object.entries(STAGE_STATUSES).map(([key, statuses]) => {
    const count = statuses.reduce((sum, s) => sum + (countMap[s] ?? 0), 0);
    return {
      key,
      label: STAGE_LABELS[key] ?? key,
      count,
      percent: total ? Math.round((count / total) * 100) : 0,
    };
  });

  return {
    total,
    stages: [{ key: "total", label: "Total Leads", count: total, percent: 100 }, ...stages],
  };
}
