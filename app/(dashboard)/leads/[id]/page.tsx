import { connectDB } from "@/lib/db";
import { Lead } from "@/models/Lead";
import { notFound } from "next/navigation";
import { CallDisposition } from "@/components/leads/CallDisposition";
import { 
  Phone, Mail, MapPin, Building2, GraduationCap, 
  User as UserIcon, Calendar, Clock, History, 
  MessageSquare, ArrowLeft, ExternalLink, Globe,
  ShieldCheck, CreditCard, Sparkles
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { format } from "date-fns";

export default async function LeadDetailPage({ params }: { params: { id: string } }) {
  await connectDB();
  const lead = (await Lead.findById(params.id)
    .populate("assignedTo", "name")
    .populate("courseId", "name")
    .populate("universityId", "name")
    .populate("activities.by", "name")
    .populate("callLogs.by", "name")) as any;

  if (!lead) notFound();

  return (
    <div className="min-h-screen bg-slate-50/50 pb-20">
      {/* Header */}
      <div className="sticky top-0 z-30 bg-white border-b border-slate-100 px-8 py-4 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/leads">
            <Button variant="ghost" size="icon" className="rounded-xl hover:bg-slate-50">
              <ArrowLeft className="h-5 w-5 text-slate-500" />
            </Button>
          </Link>
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary flex items-center justify-center text-white text-xl font-black shadow-lg shadow-primary/20">
              {lead.name.charAt(0)}
            </div>
            <div>
              <h1 className="text-xl font-black text-slate-900 leading-none">{lead.name}</h1>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mt-1.5">{lead.leadId}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant="outline" className="h-10 px-4 rounded-xl border-slate-100 bg-white text-xs font-black uppercase text-slate-500">
            Source: {lead.source}
          </Badge>
          <Badge className={`h-10 px-4 rounded-xl text-xs font-black uppercase border-none ${
            lead.temperature === 'hot' ? 'bg-red-500 text-white' : 
            lead.temperature === 'warm' ? 'bg-orange-500 text-white' : 
            'bg-blue-500 text-white'
          }`}>
            {lead.temperature}
          </Badge>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto p-4 sm:p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-8 items-start">
        {/* Left Column: Basic Information */}
        <div className="lg:col-span-3 space-y-6 lg:sticky lg:top-24">
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-5 lg:p-6 space-y-6">
            <div className="space-y-4">
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                <ShieldCheck className="h-3.5 w-3.5 text-primary" /> Basic Information
              </h3>
              <div className="space-y-3">
                <div className="flex flex-col gap-0.5 p-3 bg-slate-50 rounded-xl">
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Phone</span>
                  <span className="text-sm text-slate-900 flex items-center gap-2 font-medium">
                    <Phone className="h-3.5 w-3.5 text-primary shrink-0" /> {lead.phone}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 p-3 bg-slate-50 rounded-xl">
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Email</span>
                  <span className="text-sm text-slate-900 flex items-center gap-2 font-medium overflow-hidden break-all">
                    <Mail className="h-3.5 w-3.5 text-primary shrink-0" /> {lead.email || "N/A"}
                  </span>
                </div>
                <div className="flex flex-col gap-0.5 p-3 bg-slate-50 rounded-xl">
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider font-bold">Location</span>
                  <span className="text-sm text-slate-900 flex items-center gap-2 font-medium">
                    <MapPin className="h-3.5 w-3.5 text-primary shrink-0" /> {lead.city || "N/A"}{lead.state ? `, ${lead.state}` : ""}
                  </span>
                </div>
              </div>
            </div>

            <div className="space-y-4 pt-6 border-t border-slate-100">
              <h3 className="text-[10px] font-black text-slate-900 uppercase tracking-[0.2em] flex items-center gap-2">
                <Building2 className="h-3.5 w-3.5 text-primary" /> Academic Interest
              </h3>
              <div className="space-y-3">
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold mb-0.5">University</p>
                  <p className="text-xs text-slate-900 flex items-center gap-2 leading-snug font-medium">
                    <Building2 className="h-3.5 w-3.5 text-slate-400 shrink-0" /> {lead.universityId?.name || "N/A"}
                  </p>
                </div>
                <div className="p-3 bg-slate-50 rounded-xl">
                  <p className="text-[9px] text-slate-400 uppercase tracking-wider font-bold mb-0.5">Course</p>
                  <p className="text-xs text-primary flex items-center gap-2 leading-snug font-bold">
                    <GraduationCap className="h-3.5 w-3.5 shrink-0" /> {lead.courseId?.name || "N/A"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Middle Column: Call Disposition */}
        <div className="lg:col-span-5 space-y-6">
          <div className="w-full">
            <CallDisposition leadId={params.id} />
          </div>
          
          {/* Recent Call Logs */}
          <div className="bg-white rounded-[2rem] border border-slate-200 shadow-sm p-6 lg:p-8">
            <h3 className="text-sm font-normal text-black uppercase tracking-widest flex items-center gap-2 mb-8">
              <History className="h-4 w-4 text-primary" /> Call History
            </h3>
            <div className="space-y-6">
              {lead.callLogs?.slice().reverse().map((log: any, idx: number) => (
                <div key={idx} className="p-5 rounded-2xl bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-md">
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <Badge className={`border-none text-[10px] uppercase font-medium ${log.type === 'connected' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                      {log.type.replace('_', ' ')}
                    </Badge>
                    <span className="text-[10px] text-black opacity-40 font-medium">{format(new Date(log.at), "MMM d, HH:mm")}</span>
                  </div>
                  <h4 className="text-sm text-black mb-1 font-medium">{log.disposition}</h4>
                  <p className="text-xs text-primary mb-3">{log.subDisposition}</p>
                  {log.note && (
                    <div className="p-4 bg-white rounded-xl text-sm text-black border border-slate-100 leading-relaxed italic">
                      "{log.note}"
                    </div>
                  )}
                  <div className="mt-3 flex items-center gap-2">
                    <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[10px] text-primary">
                      {log.by?.name?.charAt(0) || "S"}
                    </div>
                    <span className="text-[10px] text-black opacity-60 font-medium uppercase tracking-wider">By {log.by?.name || "System"}</span>
                  </div>
                </div>
              ))}
              {(!lead.callLogs || lead.callLogs.length === 0) && (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-sm text-black opacity-40 italic">No call logs recorded yet.</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Activity Timeline */}
        <div className="lg:col-span-4">
          <div className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm p-6 lg:p-8 flex flex-col lg:sticky lg:top-24 max-h-none lg:max-h-[calc(100vh-8rem)]">
            <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest flex items-center gap-2 mb-8 shrink-0">
              <Sparkles className="h-4 w-4 text-amber-500" /> Activity Timeline
            </h3>
            <div className="overflow-y-visible lg:overflow-y-auto pr-0 lg:pr-2 custom-scrollbar space-y-8 relative before:absolute before:left-[19px] before:top-2 before:bottom-0 before:w-[1px] before:bg-slate-100">
              {lead.activities?.slice().reverse().map((activity: any, idx: number) => {
                const isStatusChange = activity.type === 'status_change';
                const isCall = activity.type === 'call';
                const isNote = activity.type === 'note';
                const isAssignment = activity.type === 'assignment';
                const isCreate = activity.type === 'create';
                
                return (
                  <div key={idx} className="flex gap-4 relative group">
                    <div className={`h-10 w-10 rounded-full flex items-center justify-center shrink-0 z-10 shadow-sm transition-all duration-300 group-hover:scale-110 group-hover:shadow-md ${
                      isNote ? 'bg-blue-500 text-white' : 
                      isStatusChange ? 'bg-emerald-500 text-white' :
                      isCall ? 'bg-orange-500 text-white' :
                      isAssignment ? 'bg-purple-500 text-white' :
                      isCreate ? 'bg-slate-900 text-white' :
                      'bg-slate-200 text-slate-600'
                    }`}>
                      {isNote ? <MessageSquare className="h-4 w-4" /> : 
                       isCall ? <Phone className="h-4 w-4" /> :
                       isStatusChange ? <Sparkles className="h-4 w-4" /> :
                       isAssignment ? <UserIcon className="h-4 w-4" /> :
                       isCreate ? <Globe className="h-4 w-4" /> :
                       <Clock className="h-4 w-4" />}
                    </div>
                    <div className={`flex-1 p-4 rounded-2xl border transition-all duration-300 group-hover:translate-x-1 ${
                      isNote ? 'bg-blue-50/30 border-blue-100 hover:border-blue-200' :
                      isStatusChange ? 'bg-emerald-50/30 border-emerald-100 hover:border-emerald-200' :
                      isCall ? 'bg-orange-50/30 border-orange-100 hover:border-orange-200' :
                      isAssignment ? 'bg-purple-50/30 border-purple-100 hover:border-purple-200' :
                      'bg-slate-50/30 border-slate-100 hover:border-slate-200'
                    }`}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-[10px] text-slate-900 font-black uppercase tracking-wider">{activity.by?.name || "System"}</span>
                        <span className="text-[10px] text-slate-400 font-medium">{format(new Date(activity.at), "MMM d, HH:mm")}</span>
                      </div>
                      <p className={`text-xs sm:text-sm leading-relaxed font-medium ${
                        isStatusChange ? 'text-emerald-900' : 
                        isCall ? 'text-orange-900' :
                        isAssignment ? 'text-purple-900' :
                        'text-slate-900'
                      }`}>
                        {activity.message}
                      </p>
                    </div>
                  </div>
                );
              })}
              {(!lead.activities || lead.activities.length === 0) && (
                <div className="text-center py-10">
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
