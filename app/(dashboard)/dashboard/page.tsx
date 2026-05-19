import { connectDB } from "@/lib/db";
import { Lead, User, FollowUp, Pipeline, Course, University } from "@/models";
import { requireUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { DashboardCharts } from "@/components/dashboard/DashboardCharts";
import { RecentLeadsList } from "@/components/dashboard/RecentLeadsList";
import { Users, TrendingUp, UserCheck, Flame, Calendar, Plus, Clock, ArrowRight, CheckCircle2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";

async function getStats(userId: string, role: string) {
  await connectDB();
  const today = new Date(); 
  today.setHours(0,0,0,0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  
  let scope: any = {};
  
  if (role === "counselor") {
    scope = { assignedTo: userId };
  } else if (role === "team_leader" || role === "manager") {
    const members = await User.find({ managerId: userId }).select("_id");
    const memberIds = members.map(m => m._id);
    scope = { assignedTo: { $in: [userId, ...memberIds] } };
  } else if (role === "super_admin" || role === "admin" || role === "general_manager" || role === "hr") {
    scope = {}; // All access
  }

  const [total, todayCount, converted, hot, recentLeads, todayFollowUps] = await Promise.all([
    Lead.countDocuments(scope),
    Lead.countDocuments({ ...scope, createdAt: { $gte: today } }),
    Lead.countDocuments({ ...scope, status: "converted" }),
    Lead.countDocuments({ ...scope, status: "hot" }),
    Lead.find(scope).sort({ createdAt: -1 }).limit(5).populate("assignedTo courseId universityId"),
    Lead.find({ ...scope, followUpAt: { $gte: today, $lt: tomorrow } })
      .sort({ followUpAt: 1 })
      .limit(10)
  ]);

  const [revenueAgg, statusData, sourceData] = await Promise.all([
    Lead.aggregate([
      { $match: { ...scope, status: "converted" } },
      { $group: { _id: null, sum: { $sum: "$revenue" } } },
    ]),
    Lead.aggregate([
      { $match: scope },
      { $group: { _id: "$status", value: { $sum: 1 } } }
    ]),
    Lead.aggregate([
      { $match: scope },
      { $group: { _id: "$source", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ])
  ]);

  const revenue = revenueAgg[0]?.sum ?? 0;

  // Data for Charts - Fetching in parallel
  const chartPromises = [];
  for (let i = 6; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    const end = new Date(d);
    end.setHours(23, 59, 59, 999);
    
    chartPromises.push(
      Lead.countDocuments({ ...scope, createdAt: { $gte: d, $lte: end } }).then(count => ({
        day: d.toLocaleDateString("en-US", { weekday: "short" }),
        count
      }))
    );
  }
  const last7Days = await Promise.all(chartPromises);

  const leadsByStatus = statusData.map(s => ({ name: s._id, value: s.value }));
  const leadsBySource = sourceData.map(s => ({ name: s._id, count: s.count }));

  return { 
    total, todayCount, converted, hot, revenue,
    last7Days, leadsByStatus, leadsBySource,
    recentLeads, todayFollowUps
  };
}

export default async function DashboardPage() {
  const user = await requireUser();
  const stats = await getStats(user.sub, user.role);

  const teamMembers = await User.find({ 
    role: { $in: ["counselor", "team_leader", "manager", "admin"] } 
  }).select("name role");
  const pipelines = await Pipeline.find({ active: true }).select("name");
  const courses = await Course.find().select("name");
  const universities = await University.find().select("name");

  const statCards = [
    { 
      title: "Total Leads", 
      value: stats.total, 
      icon: Users, 
      color: "text-blue-600", 
      bg: "bg-blue-50",
      gradient: "from-blue-50 to-white",
      borderColor: "border-blue-100",
      href: "/leads"
    },
    { 
      title: "Today's Leads", 
      value: stats.todayCount, 
      icon: Calendar, 
      color: "text-orange-600", 
      bg: "bg-orange-50",
      gradient: "from-orange-50 to-white",
      borderColor: "border-orange-100",
      href: "/leads?date=today"
    },
    { 
      title: "Converted", 
      value: stats.converted, 
      icon: UserCheck, 
      color: "text-green-600", 
      bg: "bg-green-50",
      gradient: "from-green-50 to-white",
      borderColor: "border-green-100",
      href: "/leads?status=converted"
    },
    { 
      title: "Hot Leads", 
      value: stats.hot, 
      icon: Flame, 
      color: "text-red-600", 
      bg: "bg-red-50",
      gradient: "from-red-50 to-white",
      borderColor: "border-red-100",
      href: "/leads?status=hot"
    },
    { 
      title: "Revenue", 
      value: `₹${stats.revenue.toLocaleString("en-IN")}`, 
      icon: TrendingUp, 
      color: "text-emerald-600", 
      bg: "bg-emerald-50",
      gradient: "from-emerald-50 to-white",
      borderColor: "border-emerald-100",
      href: "/analytics"
    },
  ];

  return (
    <div className="space-y-8 pb-10 max-w-[1600px] mx-auto">
      {/* Header with Quick Actions */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Dashboard</h1>
          <p className="text-slate-500 mt-1">Welcome back, <span className="text-primary font-semibold">{user.name}</span>. Let's close some deals today!</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <Button asChild className="rounded-full shadow-lg shadow-primary/20 hover:shadow-xl transition-all">
            <Link href="/leads?action=new">
              <Plus className="mr-2 h-4 w-4" /> Add New Lead
            </Link>
          </Button>
          <Button variant="outline" asChild className="rounded-full bg-white">
            <Link href="/followups">
              <Clock className="mr-2 h-4 w-4" /> View Follow-ups
            </Link>
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-5">
        {statCards.map((card) => (
          <Link key={card.title} href={card.href}>
            <Card className={`border ${card.borderColor} shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden group bg-gradient-to-br ${card.gradient} h-full cursor-pointer active:scale-95`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-1">{card.title}</p>
                    <h3 className="text-3xl font-bold tracking-tight text-slate-900">{card.value}</h3>
                  </div>
                  <div className={`${card.bg} p-4 rounded-2xl group-hover:scale-110 transition-transform duration-300 shadow-sm`}>
                    <card.icon className={`h-7 w-7 ${card.color}`} />
                  </div>
                </div>
              </CardContent>
              <div className={`h-1.5 w-full ${card.color.replace('text', 'bg')} opacity-60`} />
            </Card>
          </Link>
        ))}
      </div>

      {/* Charts Section */}
      <div className="grid gap-8 lg:grid-cols-1">
        <DashboardCharts 
          leadsByDay={stats.last7Days}
          leadsByStatus={stats.leadsByStatus}
          leadsBySource={stats.leadsBySource}
        />
      </div>

      {/* Bottom Grid: Recent Leads & Follow-ups */}
      <div className="grid gap-8 md:grid-cols-2">
        {/* Recent Leads */}
        <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl font-bold">Recent Leads</CardTitle>
              <CardDescription>Latest potential customers added</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary/80">
              <Link href="/leads" className="flex items-center">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <RecentLeadsList 
              leads={JSON.parse(JSON.stringify(stats.recentLeads))}
              teamMembers={teamMembers.map(m => ({ id: m._id.toString(), name: m.name }))}
              pipelines={pipelines.map(p => ({ id: p._id.toString(), name: p.name }))}
              courses={courses.map(c => ({ id: c._id.toString(), name: c.name }))}
              universities={universities.map(u => ({ id: u._id.toString(), name: u.name }))}
            />
          </CardContent>
        </Card>

        {/* Today's Follow-ups */}
        <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm">
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div>
              <CardTitle className="text-xl font-bold">Today's Follow-ups</CardTitle>
              <CardDescription>Scheduled meetings and calls</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild className="text-primary hover:text-primary/80">
              <Link href="/leads?followUpDate=today" className="flex items-center">
                View All <ArrowRight className="ml-1 h-4 w-4" />
              </Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {stats.todayFollowUps.length > 0 ? (
                stats.todayFollowUps.map((lead: any) => (
                  <div key={lead._id} className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-orange-50 flex items-center justify-center text-orange-600">
                        <Clock className="h-5 w-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-slate-900">{lead.name}</p>
                        <p className="text-xs text-slate-500">
                          {lead.phone} • {lead.followUpAt ? new Date(lead.followUpAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Time not set'}
                        </p>
                      </div>
                    </div>
                    <Badge variant="outline" className="capitalize bg-white text-orange-600 border-orange-100">
                      {lead.status}
                    </Badge>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-slate-400 italic flex flex-col items-center gap-2">
                  <CheckCircle2 className="h-10 w-10 opacity-20" />
                  <p>No follow-ups scheduled for today.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
