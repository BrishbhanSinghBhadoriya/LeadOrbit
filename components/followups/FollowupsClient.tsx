"use client";

import { useState } from "react";
import Link from "next/link";
import {
  CalendarClock, Phone, PhoneCall, AlertCircle,
  Clock, ChevronRight, Calendar, User as UserIcon,
  GraduationCap, Flame, ArrowRight, RefreshCw,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { format, isToday, isTomorrow } from "date-fns";
import { phoneToTelHref } from "@/lib/phone";

interface Lead {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  status: string;
  followUpAt?: string;
  nextFollowUpAt?: string;
  assignedTo?: { name: string };
  courseId?: { name: string };
  universityId?: { name: string };
  source?: string;
  temperature?: string;
  priority?: string;
  disposition?: string;
}

interface Props {
  followUpLeads: Lead[];
  callbackLeads: Lead[];
  missedLeads: Lead[];
  upcomingLeads: Lead[];
}

type Tab = "today" | "missed" | "upcoming";

const TEMP_COLOR: Record<string, string> = {
  hot:  "bg-red-50 text-red-600 border-red-100",
  warm: "bg-orange-50 text-orange-600 border-orange-100",
  cold: "bg-blue-50 text-blue-600 border-blue-100",
};

const PRIORITY_COLOR: Record<string, string> = {
  urgent: "bg-red-500 text-white",
  high:   "bg-orange-500 text-white",
  medium: "bg-blue-500 text-white",
  low:    "bg-slate-400 text-white",
};

function getScheduledTime(lead: Lead): Date | null {
  const d = lead.nextFollowUpAt || lead.followUpAt;
  return d ? new Date(d) : null;
}

function LeadCard({ lead, type }: { lead: Lead; type: "followup" | "callback" }) {
  const scheduledAt = getScheduledTime(lead);
  const telHref = phoneToTelHref(lead.phone);

  return (
    <div className="flex items-start gap-3 p-3 rounded-xl border border-slate-100 bg-white hover:border-primary/20 hover:shadow-sm transition-all group">
      {/* Avatar */}
      <div className={`h-9 w-9 rounded-xl flex items-center justify-center text-sm font-bold shrink-0 ${
        type === "callback" ? "bg-amber-100 text-amber-700" : "bg-primary/10 text-primary"
      }`}>
        {lead.name.charAt(0).toUpperCase()}
      </div>

      {/* Info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <Link
            href={`/leads/${lead._id}`}
            className="text-sm font-bold text-slate-900 hover:text-primary transition-colors truncate"
          >
            {lead.name}
          </Link>
          {lead.temperature && (
            <Badge variant="outline" className={`text-[9px] h-4 px-1.5 font-semibold border ${TEMP_COLOR[lead.temperature] ?? ""}`}>
              {lead.temperature}
            </Badge>
          )}
          {lead.priority && lead.priority !== "medium" && (
            <Badge className={`text-[9px] h-4 px-1.5 font-semibold border-none ${PRIORITY_COLOR[lead.priority] ?? ""}`}>
              {lead.priority}
            </Badge>
          )}
        </div>

        <div className="flex items-center gap-3 mt-1 flex-wrap">
          {telHref ? (
            <a href={telHref} className="flex items-center gap-1 text-[11px] text-primary font-semibold hover:underline" onClick={(e) => e.stopPropagation()}>
              <Phone className="h-3 w-3" />{lead.phone}
            </a>
          ) : (
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <Phone className="h-3 w-3" />{lead.phone}
            </span>
          )}
          {lead.courseId?.name && (
            <span className="flex items-center gap-1 text-[11px] text-slate-500 truncate max-w-[120px]">
              <GraduationCap className="h-3 w-3 shrink-0" />{lead.courseId.name}
            </span>
          )}
          {lead.assignedTo?.name && (
            <span className="flex items-center gap-1 text-[11px] text-slate-400">
              <UserIcon className="h-3 w-3" />{lead.assignedTo.name}
            </span>
          )}
        </div>

        {lead.disposition && (
          <p className="text-[10px] text-slate-400 mt-0.5 truncate">Last: {lead.disposition}</p>
        )}
      </div>

      {/* Time + action */}
      <div className="shrink-0 text-right flex flex-col items-end gap-1.5">
        {scheduledAt && (
          <div className="flex items-center gap-1 text-[10px] font-semibold text-slate-500">
            <Clock className="h-3 w-3" />
            {format(scheduledAt, "hh:mm a")}
          </div>
        )}
        <Link href={`/leads/${lead._id}`}>
          <Button size="sm" variant="outline" className="h-6 px-2 text-[10px] rounded-lg font-semibold hover:border-primary/30 hover:text-primary">
            Open <ChevronRight className="h-3 w-3 ml-0.5" />
          </Button>
        </Link>
      </div>
    </div>
  );
}

function Section({
  title, icon: Icon, leads, type, color, emptyMsg,
}: {
  title: string;
  icon: any;
  leads: Lead[];
  type: "followup" | "callback";
  color: string;
  emptyMsg: string;
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className={`flex items-center gap-2 px-1`}>
        <div className={`h-6 w-6 rounded-lg flex items-center justify-center ${color}`}>
          <Icon className="h-3.5 w-3.5" />
        </div>
        <h2 className="text-sm font-bold text-slate-900">{title}</h2>
        <span className="ml-auto text-xs font-bold text-slate-400">{leads.length}</span>
      </div>
      {leads.length === 0 ? (
        <div className="text-center py-6 rounded-xl border border-dashed border-slate-200 bg-slate-50">
          <p className="text-xs text-slate-400 italic">{emptyMsg}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-2">
          {leads.map((l) => <LeadCard key={l._id} lead={l} type={type} />)}
        </div>
      )}
    </div>
  );
}

export function FollowupsClient({ followUpLeads, callbackLeads, missedLeads, upcomingLeads }: Props) {
  const [tab, setTab] = useState<Tab>("today");

  const tabs: { id: Tab; label: string; count: number; icon: any }[] = [
    { id: "today",    label: "Today",    count: followUpLeads.length + callbackLeads.length, icon: CalendarClock },
    { id: "missed",   label: "Missed",   count: missedLeads.length,                          icon: AlertCircle },
    { id: "upcoming", label: "Upcoming", count: upcomingLeads.length,                        icon: Calendar },
  ];

  return (
    <div className="flex flex-col gap-4 pb-6 pl-10 md:pl-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-lg font-bold text-slate-900 leading-tight">Follow-ups</h1>
          <p className="text-xs text-slate-400 mt-0.5">Manage your follow-ups and callbacks</p>
        </div>
        <Button asChild size="sm" variant="outline" className="h-8 rounded-lg text-xs font-semibold bg-white self-start sm:self-auto">
          <Link href="/leads?status=follow_up,callback" className="flex items-center gap-1.5">
            View All Leads <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </Button>
      </div>

      {/* Summary tiles */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: "Follow-ups Today", value: followUpLeads.length,  color: "bg-primary/10 text-primary",     icon: CalendarClock },
          { label: "Callbacks Today",  value: callbackLeads.length,  color: "bg-amber-50 text-amber-600",     icon: PhoneCall },
          { label: "Missed",           value: missedLeads.length,    color: "bg-red-50 text-red-600",         icon: AlertCircle },
          { label: "Upcoming (7d)",    value: upcomingLeads.length,  color: "bg-emerald-50 text-emerald-600", icon: Calendar },
        ].map((t) => (
          <div key={t.label} className="rounded-xl border border-slate-100 bg-white p-3 flex items-center gap-3">
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

      {/* Tabs */}
      <div className="flex gap-1 bg-slate-100 p-1 rounded-xl w-fit">
        {tabs.map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              tab === t.id
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-700"
            }`}
          >
            <t.icon className="h-3.5 w-3.5" />
            {t.label}
            {t.count > 0 && (
              <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-full ${
                tab === t.id ? "bg-primary/10 text-primary" : "bg-slate-200 text-slate-500"
              }`}>
                {t.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      {tab === "today" && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <Section
            title="Follow-ups"
            icon={CalendarClock}
            leads={followUpLeads}
            type="followup"
            color="bg-primary/10 text-primary"
            emptyMsg="No follow-ups scheduled for today"
          />
          <Section
            title="Callbacks"
            icon={PhoneCall}
            leads={callbackLeads}
            type="callback"
            color="bg-amber-50 text-amber-600"
            emptyMsg="No callbacks scheduled for today"
          />
        </div>
      )}

      {tab === "missed" && (
        <div className="flex flex-col gap-2">
          {missedLeads.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-dashed border-slate-200 bg-slate-50">
              <p className="text-sm text-slate-400 italic">No missed follow-ups 🎉</p>
            </div>
          ) : (
            <>
              <p className="text-xs text-red-500 font-semibold px-1">
                {missedLeads.length} overdue follow-up{missedLeads.length > 1 ? "s" : ""} — please reschedule
              </p>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
                {missedLeads.map((l) => (
                  <LeadCard key={l._id} lead={l} type={l.status === "callback" ? "callback" : "followup"} />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {tab === "upcoming" && (
        <div className="flex flex-col gap-2">
          {upcomingLeads.length === 0 ? (
            <div className="text-center py-12 rounded-xl border border-dashed border-slate-200 bg-slate-50">
              <p className="text-sm text-slate-400 italic">No upcoming follow-ups in next 7 days</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-2">
              {upcomingLeads.map((l) => {
                const d = getScheduledTime(l);
                const label = d ? (isToday(d) ? "Today" : isTomorrow(d) ? "Tomorrow" : format(d, "EEE, dd MMM")) : "";
                return (
                  <div key={l._id} className="relative">
                    {label && (
                      <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1 px-1">{label}</p>
                    )}
                    <LeadCard lead={l} type={l.status === "callback" ? "callback" : "followup"} />
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
