"use client";

import { useState } from "react";
import { assignLead } from "@/actions/leads";
import { Loader2 } from "lucide-react";

interface LeadAssignProps {
  leadId: string;
  teamMembers: { id: string; name: string }[];
  currentAssigneeId?: string;
}

export function LeadAssign({ leadId, teamMembers, currentAssigneeId }: LeadAssignProps) {
  const [loading, setLoading] = useState(false);

  const handleChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const userId = e.target.value;
    if (!userId) return;

    setLoading(true);
    try {
      await assignLead(leadId, userId);
    } catch (err) {
      console.error("Failed to assign lead", err);
      alert("Failed to assign lead. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/50 z-10 rounded">
          <Loader2 className="h-3 w-3 animate-spin text-primary" />
        </div>
      )}
      <select
        className="text-xs p-1 rounded border border-input bg-background w-24 disabled:opacity-50"
        onChange={handleChange}
        defaultValue={currentAssigneeId || ""}
        disabled={loading}
      >
        <option value="" disabled>Assign...</option>
        {teamMembers.map((m) => (
          <option key={m.id} value={m.id}>
            {m.name}
          </option>
        ))}
      </select>
    </div>
  );
}
