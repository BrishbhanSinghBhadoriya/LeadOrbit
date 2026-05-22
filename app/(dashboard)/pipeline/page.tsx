import { requireUser } from "@/lib/auth";
import { can } from "@/config/rbac";
import { redirect } from "next/navigation";
import { connectDB } from "@/lib/db";
import { Pipeline, Lead, User, Campaign } from "@/models";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { revalidatePath } from "next/cache";
import { LeadImport } from "@/components/leads/LeadImport";
import {
  Trash2, Users, Plus, Layers,
  Target, Activity, Upload, ExternalLink,
  Kanban, BarChart3, Megaphone,
} from "lucide-react";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import type { Role } from "@/types";

export const dynamic = "force-dynamic";

export default async function PipelinePage() {
  const user = await requireUser();

  // Only roles with leads.view.all or leads.view.team can access pipeline
  if (!can(user.role as Role, "leads.view.all") && !can(user.role as Role, "leads.view.team")) {
    redirect("/dashboard");
  }
  await connectDB();

  const pipelines = await Pipeline.find({ active: true }).sort({ createdAt: -1 });

  const pipelinesWithData = await Promise.all(
    pipelines.map(async (p) => {
      // Stage-wise lead counts
      const stageCounts = await Lead.aggregate([
        { $match: { pipelineId: p._id } },
        { $group: { _id: "$stage", count: { $sum: 1 } } },
      ]);
      const totalLeads = stageCounts.reduce((acc, c) => acc + c.count, 0);

      // Campaigns linked to this pipeline (via leads)
      const campaignAgg = await Lead.aggregate([
        { $match: { pipelineId: p._id, campaignId: { $exists: true, $ne: null } } },
        { $group: { _id: "$campaignId", count: { $sum: 1 } } },
      ]);

      // Populate campaign names
      const campaignIds = campaignAgg.map((c) => c._id);
      const campaigns = campaignIds.length > 0
        ? await Campaign.find({ _id: { $in: campaignIds } }).select("name status source").lean()
        : [];

      const campaignsWithCount = campaigns.map((c: any) => ({
        _id:    String(c._id),
        name:   c.name,
        status: c.status,
        source: c.source,
        count:  campaignAgg.find((a) => String(a._id) === String(c._id))?.count ?? 0,
      }));

      return {
        ...p.toObject(),
        counts: Object.fromEntries(stageCounts.map((c) => [c._id, c.count])),
        totalLeads,
        campaigns: campaignsWithCount,
      };
    })
  );

  const teamCount     = await User.countDocuments({ active: true });
  const totalLeadsAll = pipelinesWithData.reduce((acc, p) => acc + p.totalLeads, 0);

  async function createPipeline(formData: FormData) {
    "use server";
    const u           = await requireUser();
    const name        = formData.get("name") as string;
    const description = formData.get("description") as string;
    await connectDB();
    await Pipeline.create({
      name,
      description,
      createdBy: u.sub,
      stages: [
        { name: "New",         color: "#3b82f6" },
        { name: "Contacted",   color: "#8b5cf6" },
        { name: "Qualified",   color: "#10b981" },
        { name: "Proposal",    color: "#f59e0b" },
        { name: "Negotiation", color: "#f43f5e" },
        { name: "Closed",      color: "#6b7280" },
      ],
    });
    revalidatePath("/pipeline");
  }

  async function deletePipeline(id: string) {
    "use server";
    await requireUser();
    await connectDB();
    await Pipeline.findByIdAndUpdate(id, { active: false });
    revalidatePath("/pipeline");
  }

  const STATUS_COLOR: Record<string, string> = {
    active:    "bg-emerald-50 text-emerald-700 border-emerald-200",
    draft:     "bg-slate-100 text-slate-500 border-slate-200",
    paused:    "bg-amber-50 text-amber-700 border-amber-200",
    completed: "bg-blue-50 text-blue-700 border-blue-200",
  };

  return (
    <div className="flex flex-col gap-5 pb-6 pl-10 md:pl-0">

      {/* ── Header ── */}
      <div>
        <h1 className="text-lg font-bold text-slate-900 leading-tight">Pipeline Management</h1>
        <p className="text-xs text-slate-400 mt-0.5">Visualize and manage your sales pipelines</p>
      </div>

      {/* ── Summary tiles ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {[
          { label: "Total Pipelines", value: pipelines.length, icon: Layers, color: "bg-primary/10 text-primary" },
          { label: "Total Leads",     value: totalLeadsAll,    icon: Target, color: "bg-blue-50 text-blue-600" },
          { label: "Active Team",     value: teamCount,        icon: Users,  color: "bg-emerald-50 text-emerald-600" },
        ].map((t) => (
          <div key={t.label} className="rounded-xl border border-slate-100 bg-white p-3 flex items-center gap-3 shadow-sm">
            <div className={`h-9 w-9 rounded-xl flex items-center justify-center shrink-0 ${t.color}`}>
              <t.icon className="h-4 w-4" />
            </div>
            <div>
              <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide leading-tight">{t.label}</p>
              <p className="text-xl font-bold text-slate-900 leading-tight">{t.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-5 items-start">

        {/* ── Left: Create Pipeline ── */}
        <div className="lg:col-span-1 space-y-4">
          <div className="rounded-xl border border-slate-100 bg-white shadow-sm p-4">
            <div className="flex items-center gap-2 mb-3">
              <div className="h-7 w-7 rounded-lg bg-primary/10 flex items-center justify-center">
                <Plus className="h-3.5 w-3.5 text-primary" />
              </div>
              <h2 className="text-sm font-bold text-slate-900">Create Pipeline</h2>
            </div>
            <form action={createPipeline} className="flex flex-col gap-3">
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">
                  Pipeline Name <span className="text-red-500">*</span>
                </label>
                <Input name="name" required placeholder="e.g. Overseas Education" className="h-8 text-xs border-slate-200 rounded-lg" />
              </div>
              <div>
                <label className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-1 block">Description</label>
                <Input name="description" placeholder="Optional details…" className="h-8 text-xs border-slate-200 rounded-lg" />
              </div>
              <Button type="submit" size="sm" className="h-8 rounded-lg text-xs font-semibold w-full mt-1">
                Create Pipeline
              </Button>
            </form>
          </div>

          <div className="rounded-xl border border-slate-100 bg-slate-900 text-white p-3 flex items-center gap-2">
            <Activity className="h-3.5 w-3.5 text-emerald-400 shrink-0" />
            <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">Real-time tracking active</span>
          </div>
        </div>

        {/* ── Right: Pipeline list ── */}
        <div className="lg:col-span-3 flex flex-col gap-4">
          <div className="flex items-center gap-2">
            <Kanban className="h-4 w-4 text-slate-400" />
            <h2 className="text-sm font-bold text-slate-900">Active Pipelines</h2>
            <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">
              {pipelines.length}
            </span>
          </div>

          {pipelinesWithData.length === 0 ? (
            <div className="border border-dashed border-slate-200 rounded-xl py-16 text-center bg-white">
              <Kanban className="h-8 w-8 text-slate-300 mx-auto mb-3" />
              <p className="text-sm font-semibold text-slate-500">No pipelines yet</p>
              <p className="text-xs text-slate-400 mt-1">Create your first pipeline to start tracking leads.</p>
            </div>
          ) : (
            pipelinesWithData.map((p) => (
              <div key={p._id.toString()} className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">

                {/* Pipeline header */}
                <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/60">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                      <BarChart3 className="h-4 w-4 text-primary" />
                    </div>
                    <div className="min-w-0">
                      <h3 className="text-sm font-bold text-slate-900 truncate">{p.name}</h3>
                      {p.description && (
                        <p className="text-[11px] text-slate-400 truncate">{p.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3 shrink-0 ml-3">
                    <div className="text-right">
                      <p className="text-lg font-bold text-primary leading-none">{p.totalLeads}</p>
                      <p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Leads</p>
                    </div>
                    <form action={async () => { "use server"; await deletePipeline(p._id.toString()); }}>
                      <Button variant="ghost" size="icon" className="h-7 w-7 rounded-lg text-slate-300 hover:text-red-500 hover:bg-red-50" title="Delete pipeline">
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </form>
                  </div>
                </div>

                <div className="p-4 flex flex-col gap-4">

                  {/* ── Stages grid ── */}
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                    {p.stages.map((s: any, idx: number) => (
                      <Link
                        key={idx}
                        href={`/leads?pipeline=${p._id.toString()}&status=${s.name.toLowerCase().replace(" ", "_")}`}
                        className="flex flex-col items-center p-2.5 rounded-xl hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100 active:scale-95 group/stage"
                      >
                        <div className="w-full h-1 rounded-full mb-2" style={{ backgroundColor: s.color }} />
                        <span className="text-[9px] font-bold uppercase text-slate-400 mb-0.5 group-hover/stage:text-primary transition-colors text-center leading-tight">
                          {s.name}
                        </span>
                        <span className="text-base font-bold text-slate-900">{p.counts[s.name] || 0}</span>
                      </Link>
                    ))}
                  </div>

                  {/* ── Campaigns linked to this pipeline ── */}
                  {p.campaigns.length > 0 && (
                    <div className="border border-slate-100 rounded-xl overflow-hidden">
                      <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border-b border-slate-100">
                        <Megaphone className="h-3.5 w-3.5 text-primary shrink-0" />
                        <span className="text-[10px] font-bold text-slate-600 uppercase tracking-widest">
                          Campaigns
                        </span>
                        <span className="ml-auto text-[10px] font-bold text-slate-400">{p.campaigns.length}</span>
                      </div>
                      <div className="divide-y divide-slate-50">
                        {p.campaigns.map((c) => (
                          <div key={c._id} className="flex items-center justify-between px-3 py-2 hover:bg-slate-50 transition-colors">
                            <div className="flex items-center gap-2 min-w-0">
                              <div className="h-6 w-6 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                                <Megaphone className="h-3 w-3 text-primary" />
                              </div>
                              <div className="min-w-0">
                                <p className="text-xs font-semibold text-slate-900 truncate">{c.name}</p>
                                <p className="text-[10px] text-slate-400 capitalize">{c.source?.replace("_", " ")}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 shrink-0 ml-2">
                              <span className="text-[10px] font-bold text-slate-500">
                                {c.count} lead{c.count !== 1 ? "s" : ""}
                              </span>
                              <span className={`text-[9px] font-semibold px-1.5 py-0.5 rounded-full border capitalize ${STATUS_COLOR[c.status] ?? "bg-slate-100 text-slate-500 border-slate-200"}`}>
                                {c.status}
                              </span>
                              <Link
                                href={`/reports/campaigns?id=${c._id}`}
                                className="text-[10px] font-bold text-primary hover:underline flex items-center gap-0.5"
                              >
                                Analytics <ExternalLink className="h-2.5 w-2.5" />
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ── Quick import ── */}
                  <div className="p-3 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                        <Upload className="h-3 w-3" /> Quick Import
                      </span>
                      <Link href={`/leads?pipeline=${p._id.toString()}`} className="text-[10px] font-bold text-primary hover:underline flex items-center gap-1">
                        View All Leads <ExternalLink className="h-2.5 w-2.5" />
                      </Link>
                    </div>
                    <LeadImport pipelineId={p._id.toString()} />
                  </div>

                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
