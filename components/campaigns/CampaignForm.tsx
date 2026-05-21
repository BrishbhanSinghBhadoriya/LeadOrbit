"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { X, Loader2, Megaphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TeamMember {
  _id: string;
  name: string;
  role: string;
}

interface Props {
  teamMembers: TeamMember[];
  onClose: () => void;
}

const SOURCE_OPTIONS = [
  { value: "facebook",   label: "Facebook" },
  { value: "google_ads", label: "Google Ads" },
  { value: "website",    label: "Website" },
  { value: "instagram",  label: "Instagram" },
  { value: "whatsapp",   label: "WhatsApp" },
  { value: "referral",   label: "Referral" },
  { value: "organic",    label: "Organic" },
  { value: "justdial",   label: "Justdial" },
  { value: "indiamart",  label: "IndiaMART" },
  { value: "other",      label: "Other" },
];

const STATUS_OPTIONS = [
  { value: "draft",     label: "Draft" },
  { value: "active",    label: "Active" },
  { value: "paused",    label: "Paused" },
  { value: "completed", label: "Completed" },
];

export function CampaignForm({ teamMembers, onClose }: Props) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  function toggleUser(id: string) {
    setSelectedUsers((prev) =>
      prev.includes(id) ? prev.filter((u) => u !== id) : [...prev, id]
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const fd = new FormData(e.currentTarget);
    const body = {
      name:          fd.get("name") as string,
      source:        fd.get("source") as string,
      status:        fd.get("status") as string,
      description:   fd.get("description") as string || undefined,
      startDate:     fd.get("startDate") as string || undefined,
      endDate:       fd.get("endDate") as string || undefined,
      assignedUsers: selectedUsers,
    };

    try {
      const res = await fetch("/api/campaigns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error || "Failed to create campaign");
      }
      router.refresh();
      onClose();
    } catch (err: any) {
      setError(err.message ?? "Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 bg-slate-50/60">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <Megaphone className="h-4 w-4 text-primary" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900">New Campaign</h2>
              <p className="text-[10px] text-slate-400">Fill in the details to create a campaign</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-slate-200 transition-colors"
          >
            <X className="h-4 w-4 text-slate-500" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[80vh] overflow-y-auto">
          {error && (
            <div className="text-xs text-red-600 bg-red-50 border border-red-100 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          {/* Row 1: Name + Source */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                Campaign Name <span className="text-red-500">*</span>
              </label>
              <Input
                name="name"
                required
                placeholder="e.g. Summer Intake 2025"
                className="h-9 rounded-lg border-slate-200 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Source</label>
              <select
                name="source"
                defaultValue="other"
                className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
              >
                {SOURCE_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Row 2: Status + Dates */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Status</label>
              <select
                name="status"
                defaultValue="draft"
                className="flex h-9 w-full rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all appearance-none"
              >
                {STATUS_OPTIONS.map((o) => (
                  <option key={o.value} value={o.value}>{o.label}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Start Date</label>
              <Input
                name="startDate"
                type="date"
                className="h-9 rounded-lg border-slate-200 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">End Date</label>
              <Input
                name="endDate"
                type="date"
                className="h-9 rounded-lg border-slate-200 text-sm"
              />
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">Description</label>
            <textarea
              name="description"
              rows={3}
              placeholder="Brief description of this campaign..."
              className="flex w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary/20 transition-all resize-none placeholder:text-slate-400"
            />
          </div>

          {/* Assign Counsellors */}
          {teamMembers.length > 0 && (
            <div className="space-y-1.5">
              <label className="text-[10px] font-bold text-slate-600 uppercase tracking-wider">
                Assign Counsellors
                {selectedUsers.length > 0 && (
                  <span className="ml-1.5 text-primary font-bold">({selectedUsers.length} selected)</span>
                )}
              </label>
              <div className="border border-slate-200 rounded-lg p-2 max-h-40 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 gap-1">
                {teamMembers.map((m) => {
                  const checked = selectedUsers.includes(m._id);
                  return (
                    <button
                      key={m._id}
                      type="button"
                      onClick={() => toggleUser(m._id)}
                      className={`flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-left transition-all text-xs font-medium ${
                        checked
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "hover:bg-slate-50 text-slate-700 border border-transparent"
                      }`}
                    >
                      <div className={`h-5 w-5 rounded-full flex items-center justify-center text-[9px] font-bold shrink-0 ${
                        checked ? "bg-primary text-white" : "bg-slate-200 text-slate-500"
                      }`}>
                        {m.name.charAt(0).toUpperCase()}
                      </div>
                      <span className="truncate">{m.name}</span>
                      <span className="ml-auto text-[9px] text-slate-400 capitalize shrink-0">{m.role.replace("_", " ")}</span>
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="h-8 rounded-lg text-xs font-semibold text-slate-500"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="h-8 rounded-lg text-xs font-semibold"
            >
              {loading ? (
                <><Loader2 className="h-3.5 w-3.5 animate-spin mr-1.5" />Creating…</>
              ) : (
                "Create Campaign"
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
