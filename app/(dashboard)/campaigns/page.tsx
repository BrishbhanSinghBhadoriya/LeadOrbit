import { connectDB } from "@/lib/db";
import { Campaign, Lead, User } from "@/models";
import { requireUser } from "@/lib/auth";
import { can } from "@/config/rbac";
import { redirect } from "next/navigation";
import { CampaignsClient } from "@/components/campaigns/CampaignsClient";
import type { Role } from "@/types";

export const dynamic = "force-dynamic";

export default async function CampaignsPage() {
  const user = await requireUser();

  if (!can(user.role as Role, "leads.view.all") && !can(user.role as Role, "leads.view.team")) {
    redirect("/dashboard");
  }

  await connectDB();

  // Fetch campaigns + team members in parallel
  const [rawCampaigns, rawTeamMembers] = await Promise.all([
    Campaign.find()
      .sort({ createdAt: -1 })
      .populate("assignedUsers", "name _id")
      .lean(),
    User.find({
      role: { $in: ["counselor", "team_leader", "manager"] },
      active: true,
    })
      .select("_id name role")
      .sort({ name: 1 })
      .lean(),
  ]);

  // Attach lead counts
  const campaigns = await Promise.all(
    rawCampaigns.map(async (c: any) => {
      const leadCount = await Lead.countDocuments({ campaignId: c._id });
      return {
        _id:           String(c._id),
        name:          c.name,
        code:          c.code ?? null,
        source:        c.source ?? "other",
        status:        c.status ?? "draft",
        description:   c.description ?? null,
        startDate:     c.startDate ? c.startDate.toISOString() : null,
        endDate:       c.endDate   ? c.endDate.toISOString()   : null,
        assignedUsers: (c.assignedUsers ?? []).map((u: any) => ({
          _id:  String(u._id),
          name: u.name,
        })),
        leadCount,
      };
    })
  );

  const teamMembers = rawTeamMembers.map((m: any) => ({
    _id:  String(m._id),
    name: m.name,
    role: m.role,
  }));

  const canCreate = can(user.role as Role, "leads.view.all");

  return (
    <CampaignsClient
      campaigns={campaigns}
      teamMembers={teamMembers}
      canCreate={canCreate}
    />
  );
}
