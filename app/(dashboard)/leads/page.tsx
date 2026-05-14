import { requireUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Lead, User, Pipeline } from "@/models";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload, FileSpreadsheet, Plus, Filter, Search, UserPlus, Phone, Mail, MoreVertical, ExternalLink } from "lucide-react";
import { LeadImport } from "@/components/leads/LeadImport";
import { LeadForm } from "@/components/leads/LeadForm";
import { LeadAssign } from "@/components/leads/LeadAssign";
import { assignLead } from "@/actions/leads";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await requireUser();
  await connectDB();
  
  const sp = await searchParams;
  const statusFilter = sp.status as string | undefined;
  const sourceFilter = sp.source as string | undefined;
  const pipelineFilter = sp.pipeline as string | undefined;
  const dateFilter = sp.date as string | undefined;
  const cityFilter = sp.city as string | undefined;
  const stateFilter = sp.state as string | undefined;
  const searchFilter = sp.q as string | undefined;

  // Build query
  let query: any = {};
  if (statusFilter) query.status = statusFilter;
  if (sourceFilter) query.source = sourceFilter;
  if (pipelineFilter) query.pipelineId = pipelineFilter;
  if (cityFilter) query.city = { $regex: cityFilter, $options: "i" };
  if (stateFilter) query.state = { $regex: stateFilter, $options: "i" };
  
  if (dateFilter) {
    const now = new Date();
    if (dateFilter === "today") {
      const start = new Date(); start.setHours(0,0,0,0);
      query.createdAt = { $gte: start };
    } else if (dateFilter === "yesterday") {
      const start = new Date(); start.setDate(start.getDate() - 1); start.setHours(0,0,0,0);
      const end = new Date(); end.setHours(0,0,0,0);
      query.createdAt = { $gte: start, $lt: end };
    } else if (dateFilter === "last7") {
      const start = new Date(); start.setDate(start.getDate() - 7);
      query.createdAt = { $gte: start };
    } else if (dateFilter === "last15") {
      const start = new Date(); start.setDate(start.getDate() - 15);
      query.createdAt = { $gte: start };
    } else if (dateFilter === "last30") {
      const start = new Date(); start.setDate(start.getDate() - 30);
      query.createdAt = { $gte: start };
    }
  }

  if (searchFilter) {
    query.$or = [
      { name: { $regex: searchFilter, $options: "i" } },
      { phone: { $regex: searchFilter, $options: "i" } },
      { email: { $regex: searchFilter, $options: "i" } },
    ];
  }

  // Role based access
  if (!["super_admin", "admin", "general_manager", "hr"].includes(user.role)) {
    if (user.role === "team_leader" || user.role === "manager") {
      const members = await User.find({ managerId: user.sub }).select("_id");
      const memberIds = members.map(m => m._id);
      query.assignedTo = { $in: [user.sub, ...memberIds] };
    } else {
      query.assignedTo = user.sub;
    }
  }

  const leads = await Lead.find(query)
    .sort({ createdAt: -1 })
    .populate("assignedTo", "name")
    .limit(50);

  const teamMembers = await User.find({ 
    role: { $in: ["counselor", "team_leader", "manager"] } 
  }).select("name role");

  const pipelines = await Pipeline.find({ active: true }).select("name");

  const isGM = ["super_admin", "general_manager", "admin"].includes(user.role);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Leads Management</h1>
          <p className="text-slate-500 mt-1">Track and engage with your potential customers.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <LeadForm pipelines={pipelines.map(p => ({ id: p._id.toString(), name: p.name }))} />
        </div>
      </div>

      <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-bold">Advanced Filters</CardTitle>
          <CardDescription>Narrow down your lead list using various criteria.</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <form className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-6 gap-4">
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
              <Input name="q" placeholder="Search name, phone, email..." className="pl-9 h-11 bg-white border-slate-200" defaultValue={searchFilter} />
            </div>
            <select name="status" className="h-11 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none" defaultValue={statusFilter}>
              <option value="">All Status</option>
              <option value="new">New</option>
              <option value="interested">Interested</option>
              <option value="follow_up">Follow Up</option>
              <option value="hot">Hot</option>
              <option value="converted">Converted</option>
            </select>
            <select name="source" className="h-11 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none" defaultValue={sourceFilter}>
              <option value="">All Sources</option>
              <option value="website">Website</option>
              <option value="facebook">Facebook</option>
              <option value="google_ads">Google Ads</option>
              <option value="instagram">Instagram</option>
              <option value="referral">Referral</option>
            </select>
            <select name="pipeline" className="h-11 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none" defaultValue={pipelineFilter}>
              <option value="">All Pipelines</option>
              {pipelines.map(p => (
                <option key={p._id.toString()} value={p._id.toString()}>{p.name}</option>
              ))}
            </select>
            <select name="date" className="h-11 rounded-md border border-slate-200 bg-white px-3 py-2 text-sm focus:ring-2 focus:ring-primary/20 outline-none" defaultValue={dateFilter}>
              <option value="">All Time</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="last7">Last 7 Days</option>
              <option value="last15">Last 15 Days</option>
              <option value="last30">Last 30 Days</option>
            </select>
            <Input name="city" placeholder="City" className="h-11 bg-white border-slate-200" defaultValue={cityFilter} />
            <Input name="state" placeholder="State" className="h-11 bg-white border-slate-200" defaultValue={stateFilter} />
            <div className="flex gap-2 lg:col-span-2">
              <Button type="submit" className="h-11 px-6 shadow-md shadow-primary/10">
                <Filter className="h-4 w-4 mr-2" />
                Apply Filters
              </Button>
              {(statusFilter || sourceFilter || pipelineFilter || dateFilter || cityFilter || stateFilter || searchFilter) && (
                <Button type="button" variant="ghost" asChild className="h-11">
                  <Link href="/leads">Clear All</Link>
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>

      <div className="grid gap-8 lg:grid-cols-4">
        <Card className="lg:col-span-1 border-none shadow-xl bg-white/50 backdrop-blur-sm h-fit">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Upload className="h-5 w-5 text-primary" />
              Import Leads
            </CardTitle>
            <CardDescription>Upload CSV or Excel files.</CardDescription>
          </CardHeader>
          <CardContent>
            <LeadImport />
          </CardContent>
        </Card>

        <Card className="lg:col-span-3 border-none shadow-xl bg-white/50 backdrop-blur-sm overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-xl font-bold">Leads List</CardTitle>
              <CardDescription>Showing {leads.length} most recent leads.</CardDescription>
            </div>
            <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">
              <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
              <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{leads.length} Total</span>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50/50 text-left font-bold text-slate-500 uppercase tracking-tighter">
                    <th className="px-6 py-4">Lead Info</th>
                    <th className="px-6 py-4">Contact Details</th>
                    <th className="px-6 py-4">Status</th>
                    <th className="px-6 py-4">Assigned To</th>
                    <th className="px-6 py-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {leads.map((l) => (
                    <tr key={l._id.toString()} className="hover:bg-slate-50/80 transition-colors group">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-10 w-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                            {l.name.charAt(0)}
                          </div>
                          <div>
                            <div className="font-bold text-slate-900 group-hover:text-primary transition-colors">{l.name}</div>
                            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{l.source}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <a href={`tel:${l.phone}`} className="flex items-center gap-2 text-slate-600 hover:text-primary transition-colors font-medium">
                            <Phone className="h-3.5 w-3.5" /> {l.phone}
                          </a>
                          <div className="flex items-center gap-2 text-slate-400 text-xs">
                            <Mail className="h-3.5 w-3.5" /> {l.email || "No email"}
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant="secondary" className={`capitalize font-bold ${
                          l.status === 'hot' ? 'bg-red-50 text-red-600 border-red-100' :
                          l.status === 'converted' ? 'bg-green-50 text-green-600 border-green-100' :
                          l.status === 'interested' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                          'bg-slate-50 text-slate-600 border-slate-100'
                        }`}>
                          {l.status}
                        </Badge>
                      </td>
                      <td className="px-6 py-4">
                        {l.assignedTo ? (
                          <div className="flex items-center gap-2">
                            <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                              {(l.assignedTo as any).name.charAt(0)}
                            </div>
                            <span className="font-medium text-slate-700">{(l.assignedTo as any).name}</span>
                          </div>
                        ) : (
                          <span className="text-slate-400 italic text-xs">Not Assigned</span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild className="h-9 w-9 rounded-full text-slate-400 hover:text-primary hover:bg-primary/5">
                            <a href={`tel:${l.phone}`} title="Call Lead">
                              <Phone className="h-4 w-4" />
                            </a>
                          </Button>
                          {isGM && (
                            <LeadAssign 
                              leadId={l._id.toString()} 
                              teamMembers={teamMembers.map(m => ({ id: m._id.toString(), name: m.name }))}
                              currentAssigneeId={l.assignedTo?.toString()}
                            />
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                  {leads.length === 0 && (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400">
                        <div className="flex flex-col items-center gap-2">
                          <Search className="h-10 w-10 opacity-20" />
                          <p>No leads found. Try adjusting your filters or import some data.</p>
                        </div>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
