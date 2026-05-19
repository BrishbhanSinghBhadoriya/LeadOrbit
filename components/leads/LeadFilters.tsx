"use client";

import { useState, useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { 
  Search, Filter, X, ChevronDown, Save, 
  Calendar, MapPin, User as UserIcon, 
  GraduationCap, Building2, Flame, 
  CreditCard, PhoneCall, MessageSquare, 
  Mail, Settings2, Trash2, Check
} from "lucide-react";
import { saveFilter, deleteFilter } from "@/actions/leads";

interface FilterOption {
  id: string;
  name: string;
}

interface LeadFiltersProps {
  initialFilters: any;
  teamMembers: FilterOption[];
  pipelines: FilterOption[];
  courses: FilterOption[];
  universities: FilterOption[];
  savedFilters: any[];
}

const STATUS_OPTIONS = [
  { id: "new", name: "New Lead" },
  { id: "attempted_contact", name: "Attempted Contact" },
  { id: "connected", name: "Connected / Contacted" },
  { id: "interested", name: "Interested" },
  { id: "follow_up", name: "Follow-Up" },
  { id: "qualified", name: "Qualified Lead" },
  { id: "application_started", name: "Application Started" },
  { id: "documents_pending", name: "Documents Pending" },
  { id: "payment_pending", name: "Payment Pending" },
  { id: "converted", name: "Admission Done / Converted" },
  { id: "not_interested", name: "Closed Lost / Not Interested" },
  { id: "hot", name: "Hot Lead" },
  { id: "warm", name: "Warm Lead" },
  { id: "cold", name: "Cold Lead" },
  { id: "callback", name: "Callback Requested" },
  { id: "counseling_scheduled", name: "Counseling Scheduled" },
  { id: "duplicate", name: "Duplicate Lead" },
  { id: "spam", name: "Spam Lead" },
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
  { id: "hot", name: "Hot Lead 🔥" },
  { id: "warm", name: "Warm Lead 🙂" },
  { id: "cold", name: "Cold Lead ❄️" },
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

const EMAIL_STATUS_OPTIONS = [
  { id: "opened", name: "Opened" },
  { id: "not_opened", name: "Not Opened" },
  { id: "clicked", name: "Clicked" },
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

export function LeadFilters({
  initialFilters,
  teamMembers,
  pipelines,
  courses,
  universities,
  savedFilters,
}: LeadFiltersProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [filters, setFilters] = useState<any>(initialFilters || {});
  const [isExpanded, setIsExpanded] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveName, setSaveName] = useState("");
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [showSavedFilters, setShowSavedFilters] = useState(false);

  // Sync with URL on mount
  useEffect(() => {
    setFilters(initialFilters);
  }, [initialFilters]);

  const applyFilters = (newFilters: any) => {
    const params = new URLSearchParams();
    Object.entries(newFilters).forEach(([key, value]) => {
      if (value) params.set(key, value as string);
    });
    router.push(`${pathname}?${params.toString()}`);
  };

  const updateFilter = (key: string, value: string | null) => {
    const newFilters = { ...filters };
    if (value === null || value === "") {
      delete newFilters[key];
    } else {
      newFilters[key] = value;
    }
    setFilters(newFilters);
  };

  const toggleMultiSelect = (key: string, id: string) => {
    const current = filters[key] ? filters[key].split(",") : [];
    let updated;
    if (current.includes(id)) {
      updated = current.filter((item: string) => item !== id);
    } else {
      updated = [...current, id];
    }
    const finalValue = updated.length > 0 ? updated.join(",") : null;
    updateFilter(key, finalValue);
    
    // Auto-apply filters on change (Instant Filtering)
    const newFilters = { ...filters };
    if (finalValue === null) {
      delete newFilters[key];
    } else {
      newFilters[key] = finalValue;
    }
    applyFilters(newFilters);
  };

  const handleReset = () => {
    setFilters({});
    router.push(pathname);
  };

  const handleSave = async () => {
    if (!saveName) return;
    setIsSaving(true);
    try {
      await saveFilter(saveName, "lead", filters);
      setShowSaveDialog(false);
      setSaveName("");
      // Ideally show a toast here
    } catch (error) {
      console.error("Failed to save filter", error);
    } finally {
      setIsSaving(false);
    }
  };

  const MultiSelect = ({ label, icon: Icon, options, filterKey }: any) => {
    const selected = filters[filterKey] ? filters[filterKey].split(",") : [];
    const [isOpen, setIsOpen] = useState(false);

    return (
      <div className="relative group">
        <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mb-1.5 block px-1">
          {label}
        </label>
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className={`flex items-center justify-between w-full h-11 px-3 py-2 text-sm bg-white border rounded-lg transition-all ${
            selected.length > 0 ? "border-primary ring-2 ring-primary/5" : "border-slate-200"
          }`}
        >
          <div className="flex items-center gap-2 overflow-hidden">
            <Icon className={`h-4 w-4 ${selected.length > 0 ? "text-primary" : "text-slate-400"}`} />
            <span className={`truncate ${selected.length > 0 ? "text-slate-900 font-medium" : "text-slate-500"}`}>
              {selected.length === 0 
                ? `All ${label}` 
                : selected.length === 1 
                  ? options.find((o: any) => o.id === selected[0])?.name 
                  : `${selected.length} Selected`}
            </span>
          </div>
          <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${isOpen ? "rotate-180" : ""}`} />
        </button>

        {isOpen && (
          <>
            <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
            <div className="absolute left-0 right-0 mt-2 z-20 bg-white border border-slate-200 rounded-xl shadow-2xl p-2 max-h-60 overflow-y-auto animate-in fade-in zoom-in duration-200">
              {selected.length > 0 && (
                <button
                  type="button"
                  onClick={() => updateFilter(filterKey, null)}
                  className="flex items-center gap-2 w-full px-3 py-2 text-xs font-bold text-red-500 hover:bg-red-50 rounded-lg transition-colors border-b border-slate-50 mb-1"
                >
                  <X className="h-3 w-3" />
                  Clear Selection (Show All)
                </button>
              )}
              {options.map((opt: any) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => toggleMultiSelect(filterKey, opt.id)}
                  className="flex items-center justify-between w-full px-3 py-2 text-sm rounded-lg hover:bg-slate-50 transition-colors group/item"
                >
                  <span className={`${selected.includes(opt.id) ? "text-primary font-bold" : "text-slate-600"}`}>
                    {opt.name}
                  </span>
                  {selected.includes(opt.id) && <Check className="h-4 w-4 text-primary" />}
                </button>
              ))}
            </div>
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <Card className="border-none shadow-2xl shadow-slate-200/50 bg-white overflow-visible">
        <CardContent className="p-6">
          <div className="flex flex-col gap-6">
            {/* Quick Search & Main Actions */}
            <div className="flex flex-col lg:flex-row gap-4 items-center">
              <div className="relative flex-1 w-full group">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400 group-focus-within:text-primary transition-colors" />
                <Input 
                  value={filters.q || ""} 
                  onChange={(e) => updateFilter("q", e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      applyFilters(filters);
                    }
                  }}
                  placeholder="Search by Name, Phone, Email, University, Course, or ID... (Press Enter)" 
                  className="pl-12 h-14 bg-slate-50/50 border-slate-100 rounded-2xl focus:ring-4 focus:ring-primary/10 transition-all text-lg" 
                />
              </div>
              <div className="flex gap-2 w-full lg:w-auto">
                <Button 
                  onClick={() => applyFilters(filters)}
                  className="h-14 px-8 rounded-2xl shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all font-bold text-base flex-1 lg:flex-none"
                >
                  <Filter className="h-5 w-5 mr-2" />
                  Apply All Filters
                </Button>
                <Button 
                  variant="outline" 
                  onClick={() => setIsExpanded(!isExpanded)}
                  className={`h-14 w-14 rounded-2xl border-slate-200 transition-all ${isExpanded ? "bg-slate-900 text-white border-slate-900" : ""}`}
                >
                  <Settings2 className="h-5 w-5" />
                </Button>
                
                {/* Saved Filters Dropdown */}
                <div className="relative">
                  <Button 
                    variant="outline"
                    onClick={() => setShowSavedFilters(!showSavedFilters)}
                    className={`h-14 px-4 rounded-2xl border-slate-200 transition-all ${savedFilters.length > 0 ? "border-primary/30 text-primary" : ""}`}
                  >
                    <Save className="h-5 w-5 mr-2" />
                    <span className="hidden xl:inline">Saved</span>
                  </Button>

                  {showSavedFilters && (
                    <>
                      <div className="fixed inset-0 z-10" onClick={() => setShowSavedFilters(false)} />
                      <div className="absolute right-0 mt-2 z-20 w-64 bg-white border border-slate-200 rounded-2xl shadow-2xl p-2 animate-in fade-in zoom-in duration-200">
                        <div className="px-3 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-50 mb-1">
                          Your Saved Filters
                        </div>
                        {savedFilters.length === 0 ? (
                          <div className="px-3 py-4 text-sm text-slate-400 text-center italic">
                            No saved filters yet
                          </div>
                        ) : (
                          <div className="space-y-1 max-h-60 overflow-y-auto">
                            {savedFilters.map((f) => (
                              <div key={f.id} className="flex items-center gap-1 group/filter">
                                <button
                                  onClick={() => {
                                    applyFilters(f.filters);
                                    setShowSavedFilters(false);
                                  }}
                                  className="flex-1 text-left px-3 py-2 text-sm rounded-xl hover:bg-primary/5 hover:text-primary transition-colors font-medium truncate"
                                >
                                  {f.name}
                                </button>
                                <button 
                                  onClick={async () => {
                                    if(confirm("Delete this filter?")) await deleteFilter(f.id);
                                  }}
                                  className="p-2 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover/filter:opacity-100"
                                >
                                  <Trash2 className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>

                {Object.keys(filters).length > 0 && (
                  <Button 
                    variant="ghost" 
                    onClick={handleReset}
                    className="h-14 px-4 rounded-2xl text-red-500 hover:bg-red-50 font-bold border border-transparent hover:border-red-100"
                  >
                    <Trash2 className="h-5 w-5 mr-2" />
                    Clear All
                  </Button>
                )}
              </div>
            </div>

            {/* Main Filters Row */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              <MultiSelect label="Lead Status" icon={Filter} options={STATUS_OPTIONS} filterKey="status" />
              <MultiSelect label="Lead Source" icon={Search} options={SOURCE_OPTIONS} filterKey="source" />
              <MultiSelect label="Assigned Counsellor" icon={UserIcon} options={teamMembers} filterKey="assignedTo" />
              <MultiSelect label="Course" icon={GraduationCap} options={courses} filterKey="course" />
              <MultiSelect label="University" icon={Building2} options={universities} filterKey="university" />
            </div>

            {/* Advanced Filters (Expandable) */}
            {isExpanded && (
              <div className="pt-6 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 xl:grid-cols-5 gap-6 animate-in slide-in-from-top-4 duration-300">
                <MultiSelect label="Lead Temperature" icon={Flame} options={TEMPERATURE_OPTIONS} filterKey="temperature" />
                <MultiSelect label="Payment Status" icon={CreditCard} options={PAYMENT_OPTIONS} filterKey="paymentStatus" />
                <MultiSelect label="Call Status" icon={PhoneCall} options={CALL_STATUS_OPTIONS} filterKey="callStatus" />
                <MultiSelect label="WhatsApp Status" icon={MessageSquare} options={WHATSAPP_STATUS_OPTIONS} filterKey="whatsappStatus" />
                <MultiSelect label="Admission Stage" icon={Check} options={ADMISSION_STAGE_OPTIONS} filterKey="admissionStage" />
                
                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-1">Location</label>
                  <div className="flex gap-2">
                    <Input 
                      placeholder="City" 
                      value={filters.city || ""} 
                      onChange={(e) => updateFilter("city", e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && applyFilters(filters)}
                      className="h-11 bg-white border-slate-200 rounded-lg text-sm" 
                    />
                    <Input 
                      placeholder="State" 
                      value={filters.state || ""} 
                      onChange={(e) => updateFilter("state", e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && applyFilters(filters)}
                      className="h-11 bg-white border-slate-200 rounded-lg text-sm" 
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-1">Date Created</label>
                  <select 
                    className="w-full h-11 px-3 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                    value={filters.dateRange || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateFilter("dateRange", val);
                      const newFilters = { ...filters, dateRange: val };
                      if (!val) delete newFilters.dateRange;
                      applyFilters(newFilters);
                    }}
                  >
                    <option value="">All Time</option>
                    <option value="today">Today</option>
                    <option value="yesterday">Yesterday</option>
                    <option value="this_week">This Week</option>
                    <option value="this_month">This Month</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block px-1">Follow-up</label>
                  <select 
                    className="w-full h-11 px-3 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:ring-2 focus:ring-primary/10 transition-all"
                    value={filters.followUpDate || ""}
                    onChange={(e) => {
                      const val = e.target.value;
                      updateFilter("followUpDate", val);
                      const newFilters = { ...filters, followUpDate: val };
                      if (!val) delete newFilters.followUpDate;
                      applyFilters(newFilters);
                    }}
                  >
                    <option value="">Any Date</option>
                    <option value="today">Today Follow-up</option>
                    <option value="missed">Missed Follow-up</option>
                    <option value="upcoming">Upcoming Follow-up</option>
                  </select>
                </div>

                <MultiSelect label="Smart Filters" icon={Settings2} options={SMART_FILTERS} filterKey="smart" />

                <div className="flex items-end pb-1">
                  <Button 
                    variant="outline" 
                    className="w-full h-11 border-dashed border-primary/30 text-primary hover:bg-primary/5 rounded-lg font-bold"
                    onClick={() => setShowSaveDialog(true)}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    Save This Filter
                  </Button>
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Save Filter Dialog */}
      {showSaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
          <Card className="w-full max-w-md border-none shadow-2xl rounded-3xl overflow-hidden">
            <CardContent className="p-8">
              <h3 className="text-2xl font-black text-slate-900 mb-2">Save Filter</h3>
              <p className="text-slate-500 mb-6 font-medium">Give your current filter configuration a name to use it later.</p>
              
              <div className="space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">Filter Name</label>
                  <Input 
                    value={saveName}
                    onChange={(e) => setSaveName(e.target.value)}
                    placeholder="e.g., High Priority MBA Leads" 
                    className="h-14 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-primary transition-all text-lg"
                  />
                </div>
                
                <div className="flex gap-3">
                  <Button 
                    variant="ghost" 
                    onClick={() => setShowSaveDialog(false)}
                    className="h-14 flex-1 rounded-2xl font-bold text-slate-500"
                  >
                    Cancel
                  </Button>
                  <Button 
                    onClick={handleSave}
                    disabled={!saveName || isSaving}
                    className="h-14 flex-1 rounded-2xl font-bold shadow-lg shadow-primary/20"
                  >
                    {isSaving ? "Saving..." : "Save Filter"}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
