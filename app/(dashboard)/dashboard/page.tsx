import { connectDB } from "@/lib/db";
import { requireUser } from "@/lib/auth";
import { User, Pipeline, Course, University } from "@/models";
import { getLeadScope, getCallOverviewStats, getAgentActivityStats, getLeadsByStageStats } from "@/lib/dashboard-stats";
import { CallOverviewCard } from "@/components/dashboard/CallOverviewCard";
import { AgentActivityCard } from "@/components/dashboard/AgentActivityCard";
import { LeadsByStageCard } from "@/components/dashboard/LeadsByStageCard";
import { QuickAccessCard } from "@/components/dashboard/QuickAccessCard";
import { RecentLeadsList } from "@/components/dashboard/RecentLeadsList";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Plus, Clock, ArrowRight, LayoutDashboard } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Lead } from "@/models";
import { startOfDay, endOfDay, format } from "date-fns";

const ADMIN_ROLES = ["super_admin", "admin", "general_manager"];

export default async function DashboardPage() {
  const user = await requireUser();
  await connectDB();
  const scope = await getLeadScope(user.sub, user.role);

  const [callStats, agentStats, stageStats, recentLeads, todayFollowUps] = await Promise.all([
    getCallOverviewStats(scope),
    ADMIN_ROLES.includes(user.role) ? getAgentActivityStats() : null,
    getLeadsByStageStats(scope),
    Lead.find(scope).sort({ createdAt: -1 }).limit(5).populate("assignedTo courseId universityId").lean(),
    (async () => {
      const today = startOfDay(new Date());
      const tomorrow = endOfDay(new Date());
      return Lead.find({ ...scope, followUpAt: { $gte: today, $lt: tomorrow } })
        .sort({ followUpAt: 1 }).limit(8).lean();
    })(),
  ]);

  const [teamMembers, pipelines, courses, universities] = await Promise.all([
    User.find({ role: { $in: ["counselor", "team_leader", "manager", "admin"] } }).select("name role").lean(),
    Pipeline.find({ active: true }).select("name").lean(),
    Course.find().select("name").lean(),
    University.find().select("name").lean(),
  ]);

  return (
    <div className="flex flex-col gap-4 pb-6 w-full">

      {/* ── Header ── */}
      <div className="flex flex-col xs:flex-row xs:items-center justify-between gap-3 pt-1 pl-10 md:pl-0">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center shrink-0">
            <LayoutDashboard className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-900 leading-tight">CRM Dashboard</h1>
            <p className="text-[11px] text-slate-500">
              Welcome, <span className="font-semibold text-primary">{user.name}</span>
              <span className="hidden sm:inline"> · {format(new Date(), "EEE, dd MMM yyyy")}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button asChild size="sm" className="h-8 rounded-lg text-xs font-semibold shadow-sm shadow-primary/20">
            <Link href="/leads" className="flex items-center gap-1.5">
              <Plus className="h-3.5 w-3.5 shrink-0" />
              <span>Add Lead</span>
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild className="h-8 rounded-lg text-xs font-semibold bg-white">
            <Link href="/followups" className="flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5 shrink-0" />
              <span>Follow-ups</span>
            </Link>
          </Button>
        </div>
      </div>

      {/* ── Row 1: Call Overview + Agent Activity ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <CallOverviewCard stats={callStats} />
        {agentStats ? (
          <AgentActivityCard stats={agentStats} />
        ) : (
          <Card className="border border-slate-100 shadow-sm bg-slate-50 flex items-center justify-center min-h-[200px]">
            <p className="text-sm text-slate-400 px-8 text-center">
              Agent activity is visible to GM, Admin &amp; Super Admin only.
            </p>
          </Card>
        )}
      </div>

      {/* ── Row 2: Leads by Stage ── */}
      <LeadsByStageCard data={stageStats} />

      {/* ── Row 3: Quick Access ── */}
      <QuickAccessCard />

      {/* ── Row 4: Recent Leads + Follow-ups ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="border border-slate-100 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-slate-100">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900">Recent Leads</CardTitle>
              <CardDescription className="text-xs">Latest enquiries</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="h-7 text-xs px-2 text-primary">
              <Link href="/leads" className="flex items-center gap-1">View All <ArrowRight className="h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <RecentLeadsList
              leads={JSON.parse(JSON.stringify(recentLeads))}
              teamMembers={(teamMembers as any[]).map((m) => ({ id: m._id.toString(), name: m.name }))}
              pipelines={(pipelines as any[]).map((p) => ({ id: p._id.toString(), name: p.name }))}
              courses={(courses as any[]).map((c) => ({ id: c._id.toString(), name: c.name }))}
              universities={(universities as any[]).map((u) => ({ id: u._id.toString(), name: u.name }))}
            />
          </CardContent>
        </Card>

        <Card className="border border-slate-100 shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-slate-100">
            <div>
              <CardTitle className="text-sm font-bold text-slate-900">Today&apos;s Follow-ups</CardTitle>
              <CardDescription className="text-xs">Scheduled callbacks</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="h-7 text-xs px-2 text-primary">
              <Link href="/leads?followUpDate=today" className="flex items-center gap-1">View All <ArrowRight className="h-3 w-3" /></Link>
            </Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-slate-50">
              {(todayFollowUps as any[]).length > 0 ? (
                (todayFollowUps as any[]).map((lead) => (
                  <div key={lead._id} className="flex items-center justify-between px-4 py-2.5 hover:bg-slate-50 transition-colors">
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-slate-900 leading-tight truncate">{lead.name}</p>
                      <p className="text-xs text-slate-400">{lead.phone}</p>
                    </div>
                    <Badge variant="outline" className="capitalize text-[10px] h-5 px-2 font-semibold shrink-0 ml-2">
                      {lead.status?.replace("_", " ")}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-center py-10 text-slate-400 text-sm italic">No follow-ups today</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
