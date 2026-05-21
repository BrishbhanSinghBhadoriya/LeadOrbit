"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Search, Filter, X, ChevronDown, Save,
  User as UserIcon, GraduationCap, Building2,
  Flame, CreditCard, PhoneCall, MessageSquare,
  Settings2, Trash2, Check,
} from "lucide-react";
import { saveFilter, deleteFilter } from "@/actions/leads";

interface FilterOption { id: string; name: string; }

interface LeadFiltersProps {
  initialFilters: any;
  teamMembers: FilterOption[];
  pipelines: FilterOption[];
  courses: FilterOption[];
  universities: FilterOption[];
  savedFilters: any[];
  embedded?: boolean;
}

const STATUS_OPTIONS = [
  { id: "new", name: "New Lead" },
  { id: "attempted_contact", name: "Attempted Contact" },
  { id: "connected", name: "Connected" },
  { id: "interested", name: "Interested" },
  { id: "follow_up", name: "Follow-Up" },
  { id: "qualified", name: "Qualified" },
  { id: "application_started", name: "Application Started" },
  { id: "documents_pending", name: "Documents Pending" },
  { id: "payment_pending", name: "Payment Pending" },
  { id: "converted", name: "Converted" },
  { id: "not_interested", name: "Not Interested" },
  { id: "hot", name: "Hot Lead" },
  { id: "warm", name: "Warm Lead" },
  { id: "cold", name: "Cold Lead" },
  { id: "callback", name: "Callback" },
  { id: "counseling_scheduled", name: "Counseling Scheduled" },
  { id: "duplicate", name: "Duplicate" },
  { id: "spam", name: "Spam" },
  { id: "rejected", name: "Rejected" },
];

const SOURCE_OPTIONS = [
  { id: "facebook", name: "Facebook" },
  { id: "google_ads", name: "Google Ads" },
  { id: "website", name: "Website" },
  { id: "instagram", name: "Instagram" },
  { id: "whatsapp", name: "WhatsApp" },
  { id: "referral", name: "Referral" },
  { id: "organic", name: "Organic" },
  { id: "justdial", name: "Justdial" },
  { id: "indiamart", name: "IndiaMART" },
];

const TEMPERATURE_OPTIONS = [
  { id: "hot", name: "Hot 🔥" },
  { id: "warm", name: "Warm 🙂" },
  { id: "cold", name: "Cold ❄️" },
];

const PAYMENT_OPTIONS = [
  { id: "paid", name: "Paid" },
  { id: "partial_paid", name: "Partial Paid" },
  { id: "pending", name: "Pending" },
];

const CALL_STATUS_OPTIONS = [
  { id: "connected", name: "Connected" },
  { id: "not_connected", name: "Not Connected" },
  { id: "switched_off", name: "Switched Off" },
  { id: "busy", name: "Busy" },
  { id: "wrong_number", name: "Wrong Number" },
];

const WHATSAPP_STATUS_OPTIONS = [
  { id: "replied", name: "Replied" },
  { id: "not_replied", name: "Not Replied" },
  { id: "sent", name: "Sent" },
];

const ADMISSION_STAGE_OPTIONS = [
  { id: "documents_pending", name: "Documents Pending" },
  { id: "verification", name: "Verification" },
  { id: "payment_pending", name: "Payment Pending" },
  { id: "admission_complete", name: "Admission Complete" },
];

const SMART_FILTERS = [
  { id: "duplicates", name: "Duplicate Leads" },
  { id: "high_priority", name: "High Priority" },
  { id: "inactive", name: "Inactive (7+ days)" },
];

const QUALITY_BAND_OPTIONS = [
  { id: "very_good", name: "Very Good (+6 to +10)" },
  { id: "good", name: "Good (+1 to +5)" },
  { id: "neutral", name: "Neutral (0)" },
  { id: "poor", name: "Poor (-1 to -5)" },
  { id: "very_poor", name: "Very Poor (-6 to -10)" },
];

// ── Compact MultiSelect ──────────────────────────────────────────────────────
function MultiSelect({ label, icon: Icon, options, filterKey, filters, onToggle, onClear }: {
  label: string;
  icon: any;
  options: FilterOption[];
  filterKey: string;
  filters: any;
  onToggle: (key: string, id: string) => void;
  onClear: (key: string) => void;
}) {
  const selected: string[] = filters[filterKey] ? filters[filterKey].split(",") : [];
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className={`flex items-center justify-between w-full h-8 px-2.5 text-xs bg-white border rounded-lg transition-all ${
          selected.length > 0 ? "border-primary ring-1 ring-primary/20 text-slate-900" : "border-slate-200 text-slate-500"
        }`}
      >
        <div className="flex items-center gap-1.5 min-w-0 overflow-hidden">
          <Icon className={`h-3 w-3 shrink-0 ${selected.length > 0 ? "text-primary" : "text-slate-400"}`} />
          <span className="truncate text-[11px]">
            {selected.length === 0
              ? label
              : selected.length === 1
                ? options.find((o) => o.id === selected[0])?.name ?? label
                : `${selected.length} selected`}
          </span>
        </div>
        <ChevronDown className={`h-3 w-3 text-slate-400 shrink-0 ml-1 transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
          <div className="absolute left-0 right-0 mt-1 z-20 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5 max-h-52 overflow-y-auto custom-scrollbar">
            {selected.length > 0 && (
              <button
                type="button"
                onClick={() => { onClear(filterKey); setOpen(false); }}
                className="flex items-center gap-1.5 w-full px-2.5 py-1.5 text-[11px] font-semibold text-red-500 hover:bg-red-50 rounded-lg mb-1 border-b border-slate-50"
              >
                <X className="h-3 w-3" /> Clear
              </button>
            )}
            {options.map((opt) => (
              <button
                key={opt.id}
                type="button"
                onClick={() => onToggle(filterKey, opt.id)}
                className="flex items-center justify-between w-full px-2.5 py-1.5 text-[11px] rounded-lg hover:bg-slate-50 transition-colors"
              >
                <span className={selected.includes(opt.id) ? "text-primary font-semibold" : "text-slate-600"}>
                  {opt.name}
                </span>
                {selected.includes(opt.id) && <Check className="h-3 w-3 text-primary shrink-0" />}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

// ── Main Component ───────────────────────────────────────────────────────────
export function LeadFilters({
  initialFilters,
  teamMembers,
  pipelines,
  courses,
  universities,
  savedFilters,
  embedded = false,
}: LeadFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [filters, setFilters] = useState<any>(initialFilters || {});
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showSavedFilters, setShowSavedFilters] = useState(false);

  useEffect(() => { setFilters(initialFilters); }, [initialFilters]);

  const applyFilters = (f: any) => {
    const params = new URLSearchParams();
    Object.entries(f).forEach(([k, v]) => { if (v) params.set(k, v as string); });
    router.push(`${pathname}?${params.toString()}`);
  };

  const updateFilter = (key: string, value: string | null) => {
    const next = { ...filters };
    if (!value) delete next[key]; else next[key] = value;
    setFilters(next);
    return next;
  };

  const toggleMultiSelect = (key: string, id: string) => {
    const current: string[] = filters[key] ? filters[key].split(",") : [];
    const updated = current.includes(id) ? current.filter((i) => i !== id) : [...current, id];
    const val = updated.length > 0 ? updated.join(",") : null;
    const next = { ...filters };
    if (!val) delete next[key]; else next[key] = val;
    setFilters(next);
    applyFilters(next);
  };

  const clearFilter = (key: string) => {
    const next = { ...filters };
    delete next[key];
    setFilters(next);
    applyFilters(next);
  };

  const handleReset = () => { setFilters({}); router.push(pathname); };

  const handleSave = async () => {
    if (!saveName) return;
    setIsSaving(true);
    try { await saveFilter(saveName, "lead", filters); setShowSaveDialog(false); setSaveName(""); }
    catch (e) { console.error(e); }
    finally { setIsSaving(false); }
  };

  const activeCount = Object.keys(filters).filter((k) => filters[k]).length;

  const multiProps = { filters, onToggle: toggleMultiSelect, onClear: clearFilter };

  return (
    <div className="flex flex-col gap-3">
      {/* ── Row 1: Search + action buttons ── */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
          <Input
            value={filters.q || ""}
            onChange={(e) => updateFilter("q", e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") applyFilters(filters); }}
            placeholder="Search name, phone, email, course… (Enter)"
            className="pl-9 h-8 text-xs bg-slate-50 border-slate-200 rounded-lg"
          />
        </div>
        <div className="flex gap-1.5 shrink-0">
          <Button
            onClick={() => applyFilters(filters)}
            size="sm"
            className="h-8 px-3 text-xs font-semibold rounded-lg"
          >
            <Filter className="h-3.5 w-3.5 mr-1.5" />
            Apply
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className={`h-8 w-8 p-0 rounded-lg border-slate-200 ${isExpanded ? "bg-slate-900 text-white border-slate-900" : ""}`}
            title="Advanced filters"
          >
            <Settings2 className="h-3.5 w-3.5" />
          </Button>

          {/* Saved filters */}
          <div className="relative">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowSavedFilters(!showSavedFilters)}
              className={`h-8 px-2.5 rounded-lg border-slate-200 text-xs ${savedFilters.length > 0 ? "border-primary/30 text-primary" : ""}`}
            >
              <Save className="h-3.5 w-3.5 mr-1" />
              <span className="hidden sm:inline">Saved</span>
            </Button>
            {showSavedFilters && (
              <>
                <div className="fixed inset-0 z-10" onClick={() => setShowSavedFilters(false)} />
                <div className="absolute right-0 mt-1 z-20 w-56 bg-white border border-slate-200 rounded-xl shadow-xl p-1.5">
                  <p className="px-2.5 py-1.5 text-[9px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">
                    Saved Filters
                  </p>
                  {savedFilters.length === 0 ? (
                    <p className="px-2.5 py-3 text-xs text-slate-400 text-center italic">No saved filters</p>
                  ) : (
                    savedFilters.map((f) => (
                      <div key={f.id} className="flex items-center gap-1 group/f">
                        <button
                          onClick={() => { applyFilters(f.filters); setShowSavedFilters(false); }}
                          className="flex-1 text-left px-2.5 py-1.5 text-xs rounded-lg hover:bg-primary/5 hover:text-primary transition-colors truncate"
                        >
                          {f.name}
                        </button>
                        <button
                          onClick={async () => { if (confirm("Delete?")) await deleteFilter(f.id); }}
                          className="p-1.5 text-slate-300 hover:text-red-500 opacity-0 group-hover/f:opacity-100 transition-all"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </div>
                    ))
                  )}
                </div>
              </>
            )}
          </div>

          {activeCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleReset}
              className="h-8 px-2.5 rounded-lg text-red-500 hover:bg-red-50 text-xs font-semibold"
            >
              <Trash2 className="h-3.5 w-3.5 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* ── Row 2: Main filter dropdowns ── */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
        <MultiSelect label="Status" icon={Filter} options={STATUS_OPTIONS} filterKey="status" {...multiProps} />
        <MultiSelect label="Source" icon={Search} options={SOURCE_OPTIONS} filterKey="source" {...multiProps} />
        <MultiSelect label="Counsellor" icon={UserIcon} options={teamMembers} filterKey="assignedTo" {...multiProps} />
        <MultiSelect label="Course" icon={GraduationCap} options={courses} filterKey="course" {...multiProps} />
        <MultiSelect label="University" icon={Building2} options={universities} filterKey="university" {...multiProps} />
      </div>

      {/* ── Advanced filters (expandable) ── */}
      {isExpanded && (
        <div className="pt-3 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          <MultiSelect label="Temperature" icon={Flame} options={TEMPERATURE_OPTIONS} filterKey="temperature" {...multiProps} />
          <MultiSelect label="Quality" icon={Check} options={QUALITY_BAND_OPTIONS} filterKey="qualityBand" {...multiProps} />
          <MultiSelect label="Payment" icon={CreditCard} options={PAYMENT_OPTIONS} filterKey="paymentStatus" {...multiProps} />
          <MultiSelect label="Call Status" icon={PhoneCall} options={CALL_STATUS_OPTIONS} filterKey="callStatus" {...multiProps} />
          <MultiSelect label="WhatsApp" icon={MessageSquare} options={WHATSAPP_STATUS_OPTIONS} filterKey="whatsappStatus" {...multiProps} />
          <MultiSelect label="Admission Stage" icon={Check} options={ADMISSION_STAGE_OPTIONS} filterKey="admissionStage" {...multiProps} />
          <MultiSelect label="Smart Filter" icon={Settings2} options={SMART_FILTERS} filterKey="smart" {...multiProps} />

          {/* Date Created */}
          <div className="flex flex-col gap-1">
            <select
              className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-[11px] outline-none focus:ring-1 focus:ring-primary/20"
              value={filters.dateRange || ""}
              onChange={(e) => {
                const next = updateFilter("dateRange", e.target.value || null);
                applyFilters(next);
              }}
            >
              <option value="">Date Created</option>
              <option value="today">Today</option>
              <option value="yesterday">Yesterday</option>
              <option value="this_week">This Week</option>
              <option value="this_month">This Month</option>
            </select>
          </div>

          {/* Follow-up */}
          <div className="flex flex-col gap-1">
            <select
              className="w-full h-8 px-2.5 bg-white border border-slate-200 rounded-lg text-[11px] outline-none focus:ring-1 focus:ring-primary/20"
              value={filters.followUpDate || ""}
              onChange={(e) => {
                const next = updateFilter("followUpDate", e.target.value || null);
                applyFilters(next);
              }}
            >
              <option value="">Follow-up Date</option>
              <option value="today">Today</option>
              <option value="missed">Missed</option>
              <option value="upcoming">Upcoming</option>
            </select>
          </div>

          {/* Location */}
          <div className="flex gap-1.5">
            <Input
              placeholder="City"
              value={filters.city || ""}
              onChange={(e) => updateFilter("city", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters(filters)}
              className="h-8 text-[11px] bg-white border-slate-200 rounded-lg"
            />
            <Input
              placeholder="State"
              value={filters.state || ""}
              onChange={(e) => updateFilter("state", e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && applyFilters(filters)}
              className="h-8 text-[11px] bg-white border-slate-200 rounded-lg"
            />
          </div>

          {/* Save filter button */}
          <div className="flex items-center">
            <Button
              variant="outline"
              size="sm"
              className="w-full h-8 border-dashed border-primary/30 text-primary hover:bg-primary/5 rounded-lg text-xs font-semibold"
              onClick={() => setShowSaveDialog(true)}
            >
              <Save className="h-3.5 w-3.5 mr-1.5" />
              Save Filter
            </Button>
          </div>
        </div>
      )}

      {/* ── Save Filter Dialog ── */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6">
            <h3 className="text-base font-bold text-slate-900 mb-1">Save Filter</h3>
            <p className="text-xs text-slate-400 mb-4">Give your filter a name to reuse it later.</p>
            <Input
              value={saveName}
              onChange={(e) => setSaveName(e.target.value)}
              placeholder="e.g. High Priority MBA Leads"
              className="h-9 text-sm mb-4"
            />
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setShowSaveDialog(false)} className="flex-1 h-9 rounded-lg">
                Cancel
              </Button>
              <Button size="sm" onClick={handleSave} disabled={!saveName || isSaving} className="flex-1 h-9 rounded-lg font-semibold">
                {isSaving ? "Saving…" : "Save"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
