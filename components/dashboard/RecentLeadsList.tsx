"use client";

import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { LeadDetailsModal } from "@/components/leads/LeadDetailsModal";

interface RecentLeadsListProps {
  leads: any[];
  teamMembers: any[];
  pipelines: any[];
  courses: any[];
  universities: any[];
}

const STATUS_COLORS: Record<string, string> = {
  new:            "bg-blue-50 text-blue-700 border-blue-100",
  contacted:      "bg-indigo-50 text-indigo-700 border-indigo-100",
  interested:     "bg-emerald-50 text-emerald-700 border-emerald-100",
  converted:      "bg-green-50 text-green-700 border-green-100",
  not_interested: "bg-red-50 text-red-700 border-red-100",
  follow_up:      "bg-amber-50 text-amber-700 border-amber-100",
};

export function RecentLeadsList({ leads, teamMembers, pipelines, courses, universities }: RecentLeadsListProps) {
  const [selectedLead, setSelectedLead] = useState<any>(null);

  return (
    <>
      <div className="divide-y divide-slate-50">
        {leads.length > 0 ? (
          leads.map((lead, index) => (
            <button
              key={lead._id}
              className="w-full flex items-center justify-between px-4 py-3 hover:bg-slate-50 active:bg-slate-100 transition-colors cursor-pointer group text-left"
              onClick={() => setSelectedLead(lead)}
            >
              <div className="flex items-center gap-3 min-w-0">
                <span className="text-xs font-bold text-slate-300 group-hover:text-primary transition-colors w-5 shrink-0 text-center">
                  {index + 1}
                </span>
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-900 group-hover:text-primary transition-colors truncate leading-tight">
                    {lead.name}
                  </p>
                  <p className="text-[11px] text-slate-400 truncate">{lead.email || lead.phone}</p>
                </div>
              </div>
              <Badge
                variant="outline"
                className={`capitalize text-[10px] h-5 px-2 font-semibold shrink-0 ml-2 ${
                  STATUS_COLORS[lead.status] || "bg-slate-50 text-slate-600 border-slate-200"
                }`}
              >
                {lead.status?.replace("_", " ")}
              </Badge>
            </button>
          ))
        ) : (
          <div className="text-center py-10 text-slate-400 text-sm italic">No recent leads found.</div>
        )}
      </div>

      {selectedLead && (
        <LeadDetailsModal
          lead={selectedLead}
          teamMembers={teamMembers}
          pipelines={pipelines}
          courses={courses}
          universities={universities}
          onClose={() => setSelectedLead(null)}
        />
      )}
    </>
  );
}
