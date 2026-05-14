import { requireUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Pipeline, Lead, User } from "@/models";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { revalidatePath } from "next/cache";
import { LeadImport } from "@/components/leads/LeadImport";
import { BarChart, Trash2, Users, ArrowRight, TrendingUp, Plus, Layers, Target, Activity, Upload, ExternalLink } from "lucide-react";
import Link from "next/link";

export default async function PipelinePage() {
  const user = await requireUser();
  await connectDB();
  
  const pipelines = await Pipeline.find({ active: true }).sort({ createdAt: -1 });

  // For each pipeline, fetch lead counts and analytics
  const pipelinesWithCounts = await Promise.all(pipelines.map(async (p) => {
    const counts = await Lead.aggregate([
      { $match: { pipelineId: p._id } },
      { $group: { _id: "$stage", count: { $sum: 1 } } }
    ]);
    
    const totalLeads = counts.reduce((acc, curr) => acc + curr.count, 0);
    
    return { 
      ...p.toObject(), 
      counts: Object.fromEntries(counts.map(c => [c._id, c.count])),
      totalLeads 
    };
  }));

  const teamCount = await User.countDocuments();
  const totalLeadsAll = pipelinesWithCounts.reduce((acc, p) => acc + p.totalLeads, 0);

  async function createPipeline(formData: FormData) {
    "use server";
    const user = await requireUser();
    const name = formData.get("name") as string;
    const description = formData.get("description") as string;

    await connectDB();
    await Pipeline.create({
      name,
      description,
      createdBy: user.sub,
      stages: [
        { name: "New", color: "#3b82f6" },
        { name: "Contacted", color: "#8b5cf6" },
        { name: "Qualified", color: "#10b981" },
        { name: "Proposal", color: "#f59e0b" },
        { name: "Negotiation", color: "#f43f5e" },
        { name: "Closed", color: "#6b7280" },
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

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Pipeline Management</h1>
          <p className="text-slate-500 mt-1">Visualize and optimize your sales journey.</p>
        </div>
      </div>

      <div className="grid gap-8 md:grid-cols-4">
        {/* Left Column: Actions & Stats */}
        <div className="md:col-span-1 space-y-6">
          <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm overflow-hidden">
            <CardHeader className="bg-primary/5 pb-4">
              <CardTitle className="text-sm font-bold uppercase tracking-wider text-primary flex items-center gap-2">
                <Plus className="h-4 w-4" /> Create Pipeline
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <form action={createPipeline} className="space-y-4">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Pipeline Name</label>
                  <Input name="name" required placeholder="e.g. Overseas Education" className="h-10 text-sm border-slate-200" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Short Description</label>
                  <Input name="description" placeholder="Optional details..." className="h-10 text-sm border-slate-200" />
                </div>
                <Button type="submit" className="w-full h-10 shadow-lg shadow-primary/20">Create Now</Button>
              </form>
            </CardContent>
          </Card>

          <Card className="border-none shadow-xl bg-slate-900 text-white overflow-hidden">
            <CardHeader className="pb-2">
              <CardTitle className="text-xs uppercase text-slate-400 font-bold tracking-widest">Global Analytics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6 pt-4">
              <div className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                    <Layers className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Total Pipelines</p>
                    <p className="text-lg font-bold">{pipelines.length}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-white transition-colors" />
              </div>
              
              <div className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center text-orange-400 group-hover:scale-110 transition-transform">
                    <Target className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Total Leads</p>
                    <p className="text-lg font-bold">{totalLeadsAll}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-white transition-colors" />
              </div>

              <div className="flex items-center justify-between group cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-white/10 flex items-center justify-center text-green-400 group-hover:scale-110 transition-transform">
                    <Users className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Active Team</p>
                    <p className="text-lg font-bold">{teamCount}</p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-slate-600 group-hover:text-white transition-colors" />
              </div>
            </CardContent>
            <CardFooter className="bg-white/5 border-t border-white/5 py-3">
              <div className="flex items-center gap-2 text-[10px] text-green-400 font-bold uppercase tracking-widest">
                <Activity className="h-3 w-3" />
                <span>Real-time tracking active</span>
              </div>
            </CardFooter>
          </Card>
        </div>

        {/* Right Column: Existing Pipelines */}
        <div className="md:col-span-3 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
              Active Campaigns
              <span className="bg-primary/10 text-primary text-xs px-3 py-1 rounded-full font-bold">{pipelines.length}</span>
            </h2>
          </div>
          
          <div className="grid gap-8">
            {pipelinesWithCounts.map((p) => (
              <Card key={p._id.toString()} className="border-none shadow-xl bg-white/50 backdrop-blur-sm overflow-hidden group hover:shadow-2xl transition-all duration-300">
                <CardHeader className="flex flex-row items-center justify-between bg-slate-50/50 p-6 border-b border-slate-100">
                  <div className="flex items-center gap-4">
                    <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <BarChart className="h-6 w-6" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors">{p.name}</CardTitle>
                      <CardDescription className="font-medium">{p.description || "Campaign overview and lead distribution"}</CardDescription>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right border-r border-slate-200 pr-4">
                      <div className="text-2xl font-black text-primary leading-none">{p.totalLeads}</div>
                      <div className="text-[10px] uppercase text-slate-400 font-bold tracking-widest mt-1">Leads</div>
                    </div>
                    <form action={async () => {
                      "use server";
                      await deletePipeline(p._id.toString());
                    }}>
                      <Button variant="ghost" size="icon" className="h-10 w-10 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50 transition-all">
                        <Trash2 className="h-5 w-5" />
                      </Button>
                    </form>
                  </div>
                </CardHeader>
                <CardContent className="p-8 space-y-8">
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-6">
                    {p.stages.map((s: any, idx: number) => (
                      <Link 
                        key={idx} 
                        href={`/leads?pipeline=${p._id.toString()}&status=${s.name.toLowerCase().replace(' ', '_')}`}
                        className="flex flex-col items-center p-4 rounded-2xl hover:bg-slate-50 transition-all group/stage cursor-pointer border border-transparent hover:border-slate-100 active:scale-95"
                      >
                        <div 
                          className="w-full h-1.5 rounded-full mb-4 shadow-sm group-hover/stage:scale-x-110 transition-transform" 
                          style={{ backgroundColor: s.color }}
                        />
                        <span className="text-[10px] font-bold uppercase text-slate-400 mb-1 group-hover/stage:text-primary transition-colors">{s.name}</span>
                        <span className="text-2xl font-black text-slate-900">{p.counts[s.name] || 0}</span>
                      </Link>
                    ))}
                  </div>

                  <div className="p-6 bg-slate-50 rounded-2xl border border-dashed border-slate-200 group-hover:border-primary/30 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <h4 className="text-xs font-bold uppercase text-slate-500 tracking-widest flex items-center gap-2">
                        <Upload className="h-4 w-4" /> Quick Import
                      </h4>
                      <Link href={`/leads?pipeline=${p._id.toString()}`} className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                        View All Leads <ExternalLink className="h-3 w-3" />
                      </Link>
                    </div>
                    <LeadImport pipelineId={p._id.toString()} />
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {pipelinesWithCounts.length === 0 && (
              <div className="p-16 border-2 border-dashed border-slate-200 rounded-3xl text-center space-y-6 bg-white/30 backdrop-blur-sm">
                <div className="bg-primary/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto rotate-12 group-hover:rotate-0 transition-transform">
                  <BarChart className="h-10 w-10 text-primary" />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-slate-900">No Pipelines Found</h3>
                  <p className="text-slate-500 max-w-xs mx-auto">Create your first sales pipeline to start tracking and converting leads into customers.</p>
                </div>
                <Button size="lg" className="rounded-full px-8">Create Your First Pipeline</Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
