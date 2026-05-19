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

export function RecentLeadsList({
  leads,
  teamMembers,
  pipelines,
  courses,
  universities,
}: RecentLeadsListProps) {
  const [selectedLead, setSelectedLead] = useState<any>(null);

  return (
    <>
      <div className="space-y-4">
        {leads.length > 0 ? (
          leads.map((lead: any, index: number) => (
            <div 
              key={lead._id} 
              className="flex items-center justify-between p-3 rounded-xl hover:bg-slate-50 transition-colors border border-transparent hover:border-slate-100 cursor-pointer group"
              onClick={() => setSelectedLead(lead)}
            >
              <div className="flex items-center gap-3">
                <div className="w-8 font-bold text-slate-400 text-sm group-hover:text-primary transition-colors">
                  #{index + 1}
                </div>
                <div>
                  <p className="font-semibold text-slate-900 group-hover:text-primary transition-colors">{lead.name}</p>
                  <p className="text-xs text-slate-500">{lead.email}</p>
                </div>
              </div>
              <Badge variant="secondary" className="capitalize bg-slate-100 text-slate-700 hover:bg-slate-200">
                {lead.status}
              </Badge>
            </div>
          ))
        ) : (
          <div className="text-center py-8 text-slate-500">No recent leads found.</div>
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
