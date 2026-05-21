import { requireUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Lead } from "@/models/Lead";
import { getLeadScope } from "@/lib/dashboard-stats";
import { FollowupsClient } from "@/components/followups/FollowupsClient";
import { startOfDay, endOfDay, addDays } from "date-fns";

export const dynamic = "force-dynamic";

export default async function FollowUpsPage() {
  const user = await requireUser();
  await connectDB();

  const scope = await getLeadScope(user.sub, user.role);
  const now   = new Date();
  const todayStart = startOfDay(now);
  const todayEnd   = endOfDay(now);
  const tomorrowEnd = endOfDay(addDays(now, 1));

  // Fetch follow_up + callback leads — both followUpAt and nextFollowUpAt
  const [followUpLeads, callbackLeads, missedLeads, upcomingLeads] = await Promise.all([
    // Today's follow-ups (status = follow_up)
    Lead.find({
      ...scope,
      status: "follow_up",
      $or: [
        { followUpAt:     { $gte: todayStart, $lte: todayEnd } },
        { nextFollowUpAt: { $gte: todayStart, $lte: todayEnd } },
      ],
    })
      .sort({ followUpAt: 1, nextFollowUpAt: 1 })
      .populate("assignedTo", "name")
      .populate("courseId", "name")
      .populate("universityId", "name")
      .select("name phone email status followUpAt nextFollowUpAt assignedTo courseId universityId source temperature priority disposition")
      .lean(),

    // Today's callbacks (status = callback)
    Lead.find({
      ...scope,
      status: "callback",
      $or: [
        { followUpAt:     { $gte: todayStart, $lte: todayEnd } },
        { nextFollowUpAt: { $gte: todayStart, $lte: todayEnd } },
      ],
    })
      .sort({ followUpAt: 1, nextFollowUpAt: 1 })
      .populate("assignedTo", "name")
      .populate("courseId", "name")
      .populate("universityId", "name")
      .select("name phone email status followUpAt nextFollowUpAt assignedTo courseId universityId source temperature priority disposition")
      .lean(),

    // Missed (followUpAt in past, not converted/done)
    Lead.find({
      ...scope,
      status: { $in: ["follow_up", "callback"] },
      $or: [
        { followUpAt:     { $lt: todayStart } },
        { nextFollowUpAt: { $lt: todayStart } },
      ],
    })
      .sort({ followUpAt: -1 })
      .limit(50)
      .populate("assignedTo", "name")
      .populate("courseId", "name")
      .populate("universityId", "name")
      .select("name phone email status followUpAt nextFollowUpAt assignedTo courseId universityId source temperature priority disposition")
      .lean(),

    // Upcoming (tomorrow onwards, next 7 days)
    Lead.find({
      ...scope,
      status: { $in: ["follow_up", "callback"] },
      $or: [
        { followUpAt:     { $gt: todayEnd, $lte: endOfDay(addDays(now, 7)) } },
        { nextFollowUpAt: { $gt: todayEnd, $lte: endOfDay(addDays(now, 7)) } },
      ],
    })
      .sort({ followUpAt: 1, nextFollowUpAt: 1 })
      .limit(50)
      .populate("assignedTo", "name")
      .populate("courseId", "name")
      .populate("universityId", "name")
      .select("name phone email status followUpAt nextFollowUpAt assignedTo courseId universityId source temperature priority disposition")
      .lean(),
  ]);

  return (
    <FollowupsClient
      followUpLeads={JSON.parse(JSON.stringify(followUpLeads))}
      callbackLeads={JSON.parse(JSON.stringify(callbackLeads))}
      missedLeads={JSON.parse(JSON.stringify(missedLeads))}
      upcomingLeads={JSON.parse(JSON.stringify(upcomingLeads))}
    />
  );
}
