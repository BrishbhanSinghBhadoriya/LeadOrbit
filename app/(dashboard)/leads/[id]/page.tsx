import { connectDB } from "@/lib/db";
import { Lead } from "@/models/Lead";
import { notFound } from "next/navigation";
import { CallDisposition } from "@/components/leads/CallDisposition";
import {
  Phone, Mail, MapPin, Building2, GraduationCap,
  User as UserIcon, Calendar, Clock, History,
  MessageSquare, ArrowLeft, ExternalLink, Globe,
  ShieldCheck, CreditCard, Sparkles,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";

// Disable full-page caching so data is always fresh
export const dynamic = "force-dynamic";

export default async function LeadDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  await connectDB();

  // Use lean() for faster deserialization — only populate what we need
  const lead = await Lead.findById(id)
    .populate("assignedTo", "name")
    .populate("courseId", "name")
    .populate("universityId", "name")
    .populate("activities.by", "name")
    .populate("callLogs.by", "name")
    .lean() as any;

  if (!lead) notFound();

  // Limit activities shown to last 50 (reverse on server, not client)
  const activities = (lead.activities ?? []).slice(-50).reverse();
  const callLogs   = (lead.callLogs   ?? []).slice(-20).reverse();

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* ── Sticky Header ── */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-100 px-4 sm:px-6 py-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-3 min-w-0">
          <Link href="/leads">
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-50 shrink-0 h-8 w-8">
              <ArrowLeft className="h-4 w-4 text-slate-500" />
            </Button>
          </Link>
          <div className="flex items-center gap-3 min-w-0">
            <div className="h-9 w-9 rounded-xl bg-primary flex items-center justify-center text-white text-base font-bold shadow-sm shadow-primary/20 shrink-0">
              {lead.name.charAt(0)}
            </div>
            <div className="min-w-0">
              <h1 className="text-base font-bold text-slate-900 leading-tight truncate">{lead.name}</h1>
              <p className="text-[10px] text-slate-400 uppercase tracking-widest">{lead.leadId}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Badge variant="outline" className="h-7 px-2.5 rounded-lg border-slate-200 text-[10px] font-semibold text-slate-500 hidden sm:flex">
            {lead.source}
          </Badge>
          <Badge className={`h-7 px-2.5 rounded-lg text-[10px] font-bold border-none ${
            lead.temperature === "hot"  ? "bg-red-500 text-white" :
            lead.temperature === "warm" ? "bg-orange-500 text-white" :
                                          "bg-blue-500 text-white"
          }`}>
            {lead.temperature}
          </Badge>
        </div>
      </div>

      {/* ── Body ── */}
      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">

        {/* ── Left: Basic Info ── */}
        <div className="lg:col-span-3 space-y-4 lg:sticky lg:top-20">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 space-y-5">
            {/* Contact */}
            <div>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                <ShieldCheck className="h-3 w-3 text-primary" /> Basic Information
              </p>
              <div className="space-y-2">
                {[
                  { label: "Phone",    icon: Phone,    value: lead.phone || "N/A" },
                  { label: "Email",    icon: Mail,     value: lead.email || "N/A" },
                  { label: "Location", icon: MapPin,   value: [lead.city, lead.state].filter(Boolean).join(", ") || "N/A" },
                ].map((f) => (
                  <div key={f.label} className="flex flex-col gap-0.5 p-2.5 bg-slate-50 rounded-xl">
                    <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">{f.label}</span>
                    <span className="text-xs text-slate-900 flex items-center gap-1.5 font-medium">
                      <f.icon className="h-3 w-3 text-primary shrink-0" />
                      <span className="break-all">{f.value}</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Academic */}
            <div className="pt-4 border-t border-slate-100">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-3">
                <Building2 className="h-3 w-3 text-primary" /> Academic Interest
              </p>
              <div className="space-y-2">
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold mb-0.5">University</p>
                  <p className="text-xs text-slate-900 flex items-center gap-1.5 font-medium">
                    <Building2 className="h-3 w-3 text-slate-400 shrink-0" />
                    {lead.universityId?.name || "N/A"}
                  </p>
                </div>
                <div className="p-2.5 bg-slate-50 rounded-xl">
                  <p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold mb-0.5">Course</p>
                  <p className="text-xs text-primary flex items-center gap-1.5 font-bold">
                    <GraduationCap className="h-3 w-3 shrink-0" />
                    {lead.courseId?.name || "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Assigned */}
            <div className="pt-4 border-t border-slate-100">
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-2">
                <UserIcon className="h-3 w-3 text-primary" /> Assigned To
              </p>
              <div className="flex items-center gap-2 p-2.5 bg-slate-50 rounded-xl">
                <div className="h-7 w-7 rounded-full bg-primary/10 flex items-center justify-center text-xs font-bold text-primary shrink-0">
                  {(lead.assignedTo?.name ?? "U").charAt(0)}
                </div>
                <span className="text-xs font-semibold text-slate-900">{lead.assignedTo?.name ?? "Unassigned"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* ── Middle: Call Disposition + Call History ── */}
        <div className="lg:col-span-5 space-y-4">
          <CallDisposition leadId={id} />

          {/* Call History */}
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-4">
              <History className="h-3.5 w-3.5 text-primary" /> Call History
            </h3>
            <div className="space-y-3">
              {callLogs.length > 0 ? callLogs.map((log: any, idx: number) => (
                <div key={idx} className="p-3 rounded-xl bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-sm transition-all">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <Badge className={`border-none text-[9px] uppercase font-semibold ${
                      log.type === "connected" ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700"
                    }`}>
                      {log.type?.replace("_", " ")}
                    </Badge>
                    <span className="text-[10px] text-slate-400">{format(new Date(log.at), "dd MMM, HH:mm")}</span>
                  </div>
                  <p className="text-xs font-semibold text-slate-900">{log.disposition}</p>
                  {log.subDisposition && <p className="text-[11px] text-primary mt-0.5">{log.subDisposition}</p>}
                  {log.note && (
                    <p className="mt-2 p-2.5 bg-white rounded-lg text-xs text-slate-600 border border-slate-100 italic">
                      &ldquo;{log.note}&rdquo;
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-1.5">
                    <div className="h-4 w-4 rounded-full bg-primary/10 flex items-center justify-center text-[9px] text-primary font-bold">
                      {(log.by?.name ?? "S").charAt(0)}
                    </div>
                    <span className="text-[10px] text-slate-400">By {log.by?.name ?? "System"}</span>
                  </div>
                </div>
              )) : (
                <div className="text-center py-8 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                  <p className="text-xs text-slate-400 italic">No call logs recorded yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Right: Activity Timeline ── */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 lg:sticky lg:top-20 max-h-none lg:max-h-[calc(100vh-6rem)] flex flex-col">
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-4 shrink-0">
              <Sparkles className="h-3.5 w-3.5 text-amber-500" /> Activity Timeline
            </h3>
            <div className="overflow-y-auto custom-scrollbar space-y-4 relative before:absolute before:left-[15px] before:top-2 before:bottom-0 before:w-px before:bg-slate-100 pr-1">
              {activities.length > 0 ? activities.map((activity: any, idx: number) => {
                const type = activity.type;
                const colorMap: Record<string, string> = {
                  note:          "bg-blue-500 text-white",
                  status_change: "bg-emerald-500 text-white",
                  call:          "bg-orange-500 text-white",
                  assignment:    "bg-purple-500 text-white",
                  create:        "bg-slate-900 text-white",
                };
                const bgMap: Record<string, string> = {
                  note:          "bg-blue-50/40 border-blue-100",
                  status_change: "bg-emerald-50/40 border-emerald-100",
                  call:          "bg-orange-50/40 border-orange-100",
                  assignment:    "bg-purple-50/40 border-purple-100",
                };
                const iconMap: Record<string, React.ReactNode> = {
                  note:          <MessageSquare className="h-3 w-3" />,
                  call:          <Phone className="h-3 w-3" />,
                  status_change: <Sparkles className="h-3 w-3" />,
                  assignment:    <UserIcon className="h-3 w-3" />,
                  create:        <Globe className="h-3 w-3" />,
                };
                return (
                  <div key={idx} className="flex gap-3 relative">
                    <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 z-10 ${colorMap[type] ?? "bg-slate-200 text-slate-600"}`}>
                      {iconMap[type] ?? <Clock className="h-3 w-3" />}
                    </div>
                    <div className={`flex-1 p-3 rounded-xl border text-xs ${bgMap[type] ?? "bg-slate-50/40 border-slate-100"}`}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-slate-900">{activity.by?.name ?? "System"}</span>
                        <span className="text-[10px] text-slate-400">{format(new Date(activity.at), "dd MMM, HH:mm")}</span>
                      </div>
                      <p className="text-slate-700 leading-relaxed">{activity.message}</p>
                    </div>
                  </div>
                );
              }) : (
                <div className="text-center py-8">
                  <p className="text-xs text-slate-400 italic">No activity recorded yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
