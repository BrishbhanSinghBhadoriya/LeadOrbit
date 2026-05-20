"use client";

import { useState, useRef, useEffect } from "react";
import { 
  Phone, Mail, Building2, GraduationCap, Search, Eye, 
  CheckSquare, Square, UserPlus, X, Send, History, 
  User as UserIcon, Clock, MessageSquare, Save, 
  ChevronRight, CheckCircle2, AlertCircle, MapPin, 
  CreditCard, Flame, Globe
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { LeadAssign } from "@/components/leads/LeadAssign";
import { LeadDetailsModal } from "@/components/leads/LeadDetailsModal";
import { bulkAssignLeads, addLeadRemark } from "@/actions/leads";
import { phoneToTelHref } from "@/lib/phone";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

const getQualityMeta = (score?: number) => {
  const value = Math.max(-10, Math.min(10, score ?? 0));
  if (value >= 6) return { label: "Very Good", cls: "bg-emerald-50 text-emerald-700" };
  if (value >= 1) return { label: "Good", cls: "bg-green-50 text-green-700" };
  if (value === 0) return { label: "Neutral", cls: "bg-slate-100 text-slate-600" };
  if (value >= -5) return { label: "Poor", cls: "bg-amber-50 text-amber-700" };
  return { label: "Very Poor", cls: "bg-red-50 text-red-700" };
};

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

interface LeadListTableProps {
  leads: any[];
  teamMembers: any[];
  pipelines: any[];
  courses: any[];
  universities: any[];
  isGM: boolean;
}

export function LeadListTable({
  leads,
  teamMembers,
  pipelines,
  courses,
  universities,
  isGM,
}: LeadListTableProps) {
  const POPOVER_WIDTH = 400;
  const POPOVER_HEIGHT = 500;
  const DROPDOWN_GAP = 8;
  const VIEWPORT_PADDING = 12;
  const router = useRouter();
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAssignId, setBulkAssignId] = useState("");
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  
  const [popoverLead, setPopoverLead] = useState<any>(null);
  const [popoverPos, setPopoverPos] = useState({ x: 0, y: 0 });
  const [modalPos, setModalPos] = useState<{ x: number; y: number } | undefined>(undefined);
  const [popoverTab, setPopoverTab] = useState<"details" | "history">("details");
  const [remark, setRemark] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setPopoverLead(null);
      }
    };
    if (popoverLead) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [popoverLead]);

  const handleRowClick = (e: React.MouseEvent<HTMLElement>, lead: any) => {
    e.stopPropagation();
    const rect = e.currentTarget.getBoundingClientRect();
    const vw = typeof window === "undefined" ? 1920 : window.innerWidth;
    const vh = typeof window === "undefined" ? 1080 : window.innerHeight;
    const left = Math.max(
      VIEWPORT_PADDING,
      Math.min(rect.left, vw - POPOVER_WIDTH - VIEWPORT_PADDING)
    );
    const belowTop = rect.bottom + DROPDOWN_GAP;
    const top =
      belowTop + POPOVER_HEIGHT <= vh - VIEWPORT_PADDING
        ? belowTop
        : Math.max(VIEWPORT_PADDING, rect.top - POPOVER_HEIGHT - DROPDOWN_GAP);
    const pos = { x: left, y: top };
     setPopoverLead(lead);
    setPopoverPos(pos);
    setModalPos({
      x: left,
      y: top + POPOVER_HEIGHT + DROPDOWN_GAP,
    });
    setPopoverTab("details");
    setRemark("");
  };

  const handleAddRemark = async () => {
    if (!remark.trim() || !popoverLead) return;
    setIsSaving(true);
    try {
      await addLeadRemark(popoverLead._id, remark, popoverLead.status);
      setRemark("");
      router.refresh();
      // Update local popover lead to show new history
      const updatedLeads = leads.find(l => l._id === popoverLead._id);
      if (updatedLeads) setPopoverLead(updatedLeads);
      setPopoverTab("history");
    } catch (error) {
      console.error("Failed to add remark", error);
    } finally {
      setIsSaving(false);
    }
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === leads.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(leads.map(l => l._id.toString()));
    }
  };

  const toggleSelect = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(i => i !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkAssign = async () => {
    if (!bulkAssignId || selectedIds.length === 0) return;
    setIsBulkLoading(true);
    try {
      await bulkAssignLeads(selectedIds, bulkAssignId);
      setSelectedIds([]);
      setBulkAssignId("");
      router.refresh();
    } catch (error) {
      console.error("Bulk assign failed", error);
    } finally {
      setIsBulkLoading(false);
    }
  };

  return (
    <>
      {/* Bulk Actions Bar */}
      {selectedIds.length > 0 && isGM && (
        <div className="bg-primary/5 border-y border-primary/10 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <div className="h-8 w-8 rounded-full bg-primary text-white flex items-center justify-center font-bold text-sm">
              {selectedIds.length}
            </div>
            <p className="text-sm font-bold text-primary uppercase tracking-wider">Leads Selected</p>
          </div>
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <select 
              value={bulkAssignId}
              onChange={(e) => setBulkAssignId(e.target.value)}
              className="h-11 px-4 bg-white border border-primary/20 rounded-xl outline-none focus:ring-2 focus:ring-primary/10 transition-all text-xs font-bold uppercase tracking-wider text-slate-600 flex-1 sm:w-48"
            >
              <option value="">Assign to...</option>
              {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
            <Button 
              onClick={handleBulkAssign}
              disabled={!bulkAssignId || isBulkLoading}
              className="h-11 px-6 rounded-xl font-bold shadow-lg shadow-primary/20 whitespace-nowrap"
            >
              {isBulkLoading ? "Assigning..." : "Assign Leads"}
            </Button>
            <Button 
              variant="ghost" 
              onClick={() => setSelectedIds([])}
              className="h-11 w-11 rounded-xl text-slate-400 hover:text-red-500 hover:bg-red-50"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>
        </div>
      )}

      <div className="w-full overflow-x-auto custom-scrollbar">
        <table className="w-full text-[10px] table-auto border-collapse min-w-[1280px]">
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50 text-left font-black text-slate-950 uppercase tracking-tighter">
              <th className="px-2 py-3 w-8">
                <button onClick={toggleSelectAll} className="text-slate-500 hover:text-primary transition-colors">
                  {selectedIds.length === leads.length && leads.length > 0 ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4" />}
                </button>
              </th>
              <th className="px-2 py-3 w-8 text-center">NO</th>
              <th className="px-3 py-3 min-w-[120px]">Name</th>
              <th className="px-3 py-3 min-w-[120px]">Email</th>
              <th className="px-3 py-3 min-w-[110px]">Mobile</th>
              <th className="px-3 py-3 w-20">Source</th>
              <th className="px-3 py-3 min-w-[120px]">University</th>
              <th className="px-3 py-3 min-w-[120px]">Course</th>
              <th className="px-3 py-3 w-28">Quality</th>
              <th className="px-3 py-3 w-24">Created Date</th>
              
              <th className="px-3 py-3 min-w-[150px]">Last Activity</th>
              <th className="px-3 py-3 w-24">Disposition</th>
              <th className="px-3 py-3 w-32">Sub Disposition</th>
              <th className="px-3 py-3 text-right w-16">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map((l, index) => (
              <tr 
                key={l._id.toString()} 
                className={`hover:bg-slate-50/80 transition-colors group cursor-pointer ${selectedIds.includes(l._id.toString()) ? 'bg-primary/5' : ''}`}
                onClick={(e) => handleRowClick(e, l)}
              >
                <td className="px-2 py-3" onClick={(e) => { e.stopPropagation(); toggleSelect(l._id.toString()); }}>
                  <button className="text-black hover:text-primary transition-colors">
                    {selectedIds.includes(l._id.toString()) ? <CheckSquare className="h-4 w-4 text-primary" /> : <Square className="h-4 w-4" />}
                  </button>
                </td>
                <td className="px-2 py-3 text-center font-bold text-slate-900">
                  {index + 1}
                </td>
                <td className="px-3 py-3">
                  <div 
                    className="font-bold text-slate-900 group-hover:text-primary transition-colors flex items-center gap-1 leading-tight cursor-pointer hover:underline"
                    onClick={(e) => {
                      e.stopPropagation();
                      window.open(`/leads/${l._id}`, '_blank');
                    }}
                  >
                    {l.name}
                    <Eye className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1 text-slate-600 font-medium truncate max-w-[120px]">
                    <Mail className="h-3 w-3 shrink-0" /> {l.email || "N/A"}
                  </div>
                </td>
                <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                  {phoneToTelHref(l.phone) ? (
                    <a
                      href={phoneToTelHref(l.phone)!}
                      className="inline-flex items-center gap-1 text-primary font-bold hover:underline truncate max-w-[120px]"
                      title="Call on this device"
                    >
                      <Phone className="h-3 w-3 shrink-0" />
                      <span className="truncate">{l.phone}</span>
                    </a>
                  ) : (
                    <span className="text-slate-400 font-medium">N/A</span>
                  )}
                </td>
                <td className="px-3 py-3">
                  <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest bg-slate-100 px-1.5 py-0.5 rounded">{l.source}</span>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1 text-slate-700 font-medium truncate max-w-[120px]">
                    <Building2 className="h-3 w-3 text-slate-400 shrink-0" /> {l.universityId?.name || "N/A"}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1 text-primary font-bold truncate max-w-[120px]">
                    <GraduationCap className="h-3 w-3 shrink-0" /> {l.courseId?.name || "N/A"}
                  </div>
                </td>
                <td className="px-3 py-3">
                  <Badge
                    variant="outline"
                    className={`text-[9px] font-bold uppercase border-none px-1.5 py-0 ${getQualityMeta(l.qualityScore).cls}`}
                  >
                    {getQualityMeta(l.qualityScore).label} ({Math.max(-10, Math.min(10, l.qualityScore ?? 0))})
                  </Badge>
                </td>
                <td className="px-3 py-3 text-slate-500 font-bold whitespace-nowrap">
                  {format(new Date(l.createdAt), "dd MMM yyyy")}
                </td>
                <td className="px-3 py-3">
                  {l.assignedTo ? (
                    <div className="flex items-center gap-1.5">
                      <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center text-[8px] font-bold text-primary shrink-0">
                        {l.assignedTo.name.charAt(0)}
                      </div>
                      <span className="font-bold text-slate-700 truncate max-w-[80px]">{l.assignedTo.name}</span>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic">Unassigned</span>
                  )}
                </td>
                <td className="px-3 py-3">
                  <div className="flex items-center gap-1.5 text-slate-600 max-w-[180px]">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />
                    <span className="truncate">{l.activities && l.activities.length > 0 ? l.activities[l.activities.length - 1].message : "Lead Created"}</span>
                  </div>
                </td>
                <td className="px-3 py-3">
                  <Badge variant="outline" className={`text-[9px] font-bold uppercase border-none px-1.5 py-0 ${l.disposition ? 'bg-blue-50 text-blue-700' : 'bg-slate-100 text-slate-500'}`}>
                    {l.disposition || "N/A"}
                  </Badge>
                </td>
                <td className="px-3 py-3">
                  <span className="text-[9px] font-medium text-slate-600 truncate max-w-[120px] block">
                    {l.subDisposition || "N/A"}
                  </span>
                </td>
                <td className="px-3 py-3 text-right" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-1">
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      className="h-7 w-7 rounded-lg text-slate-400 hover:text-primary hover:bg-primary/5"
                      onClick={() => window.open(`/leads/${l._id}`, '_blank')}
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </Button>
                    {phoneToTelHref(l.phone) ? (
                      <Button variant="ghost" size="icon" asChild className="h-7 w-7 rounded-full text-slate-400 hover:text-primary hover:bg-primary/5">
                        <a href={phoneToTelHref(l.phone)!} title="Call Lead">
                          <Phone className="h-3.5 w-3.5" />
                        </a>
                      </Button>
                    ) : (
                      <Button variant="ghost" size="icon" disabled className="h-7 w-7 rounded-full text-slate-300" title="No phone">
                        <Phone className="h-3.5 w-3.5" />
                      </Button>
                    )}
                    {isGM && (
                      <LeadAssign 
                        leadId={l._id.toString()} 
                        teamMembers={teamMembers}
                        currentAssigneeId={l.assignedTo?._id?.toString() || l.assignedTo?.toString()}
                      />
                    )}
                  </div>
                </td>
              </tr>
            ))}
            {leads.length === 0 && (
              <tr>
                <td colSpan={15} className="px-6 py-12 text-center text-slate-400">
                  <div className="flex flex-col items-center gap-2">
                    <Search className="h-10 w-10 opacity-20" />
                    <p>No leads found. Try adjusting your filters or import some data.</p>
                  </div>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {selectedLead && (
        <LeadDetailsModal 
          lead={selectedLead}
          teamMembers={teamMembers}
          pipelines={pipelines}
          courses={courses}
          universities={universities}
          onClose={() => {
            setSelectedLead(null);
            setModalPos(undefined);
          }}
          clickPos={modalPos}
        />
      )}

      <AnimatePresence>
        {popoverLead && (
          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.96 }}
            style={{ 
              position: 'fixed', 
              left: popoverPos.x,
              top: popoverPos.y,
              zIndex: 150,
            }}
            className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 w-[400px] max-h-[500px] flex flex-col overflow-hidden"
          >
            {/* Popover Header */}
            <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary text-white flex items-center justify-center font-black">
                  {popoverLead.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-black text-slate-950 text-sm">{popoverLead.name}</h4>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{popoverLead.leadId}</p>
                </div>
              </div>
              <button 
                onClick={() => setPopoverLead(null)}
                className="p-2 rounded-lg hover:bg-slate-100 text-slate-400 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Popover Tabs */}
            <div className="flex border-b border-slate-50 p-1">
              <button 
                onClick={() => setPopoverTab("details")}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${popoverTab === 'details' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Details
              </button>
              <button 
                onClick={() => setPopoverTab("history")}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${popoverTab === 'history' ? 'bg-white text-primary shadow-sm' : 'text-slate-400 hover:text-slate-600'}`}
              >
                History
              </button>
            </div>

            {/* Popover Content */}
            <div className="flex-1 overflow-y-auto p-5 custom-scrollbar">
              {popoverTab === "details" ? (
                <div className="space-y-5 animate-in fade-in duration-300">
                  {/* Status & Temp & Source */}
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-primary/5 text-primary border-none text-[10px] font-bold uppercase py-1">
                      {popoverLead.status.replace('_', ' ')}
                    </Badge>
                    <Badge variant="outline" className={`text-[10px] font-bold uppercase py-1 border-none ${
                      popoverLead.temperature === 'hot' ? 'bg-red-50 text-red-600' :
                      popoverLead.temperature === 'warm' ? 'bg-orange-50 text-orange-600' :
                      'bg-blue-50 text-blue-600'
                    }`}>
                      {popoverLead.temperature}
                    </Badge>
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-bold uppercase py-1 border-none ${getQualityMeta(popoverLead.qualityScore).cls}`}
                    >
                      Quality: {Math.max(-10, Math.min(10, popoverLead.qualityScore ?? 0))}
                    </Badge>
                    <Badge variant="outline" className="text-[10px] font-bold uppercase py-1 border-none bg-slate-100 text-slate-500">
                      {popoverLead.source}
                    </Badge>
                    {popoverLead.paymentStatus && (
                      <Badge variant="outline" className={`text-[10px] font-bold uppercase py-1 border-none ${
                        popoverLead.paymentStatus === 'paid' ? 'bg-green-50 text-green-600' : 'bg-yellow-50 text-yellow-600'
                      }`}>
                        <CreditCard className="h-2.5 w-2.5 mr-1" /> {popoverLead.paymentStatus.replace('_', ' ')}
                      </Badge>
                    )}
                  </div>

                  {/* Contact Grid */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Phone</p>
                      {phoneToTelHref(popoverLead.phone) ? (
                        <a
                          href={phoneToTelHref(popoverLead.phone)!}
                          className="text-xs font-bold text-primary flex items-center gap-1.5 hover:underline"
                        >
                          <Phone className="h-3 w-3 text-primary" /> {popoverLead.phone}
                        </a>
                      ) : (
                        <p className="text-xs font-bold text-slate-500 flex items-center gap-1.5">
                          <Phone className="h-3 w-3 text-slate-300" /> {popoverLead.phone || "N/A"}
                        </p>
                      )}
                    </div>
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Email</p>
                      <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5 truncate">
                        <Mail className="h-3 w-3 text-slate-300" /> {popoverLead.email || "N/A"}
                      </p>
                    </div>
                    {popoverLead.city && (
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Location</p>
                        <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <MapPin className="h-3 w-3 text-slate-300" /> {popoverLead.city}{popoverLead.state ? `, ${popoverLead.state}` : ""}
                        </p>
                      </div>
                    )}
                    <div className="space-y-1">
                      <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Assigned To</p>
                      <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <UserIcon className="h-3 w-3 text-slate-300" /> {popoverLead.assignedTo?.name || "Unassigned"}
                      </p>
                    </div>
                    {popoverLead.universityId && (
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">University</p>
                        <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <Building2 className="h-3 w-3 text-slate-300" /> {popoverLead.universityId.name}
                        </p>
                      </div>
                    )}
                    {popoverLead.courseId && (
                      <div className="space-y-1">
                        <p className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Course</p>
                        <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                          <GraduationCap className="h-3 w-3 text-slate-300" /> {popoverLead.courseId.name}
                        </p>
                      </div>
                    )}
                  </div>

                  {/* Remark Section */}
                  <div className="pt-4 border-t border-slate-50 space-y-3">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                      <MessageSquare className="h-3 w-3" /> Add Remark
                    </p>
                    <textarea 
                      value={remark}
                      onChange={(e) => setRemark(e.target.value)}
                      placeholder="Type your remark here..."
                      className="w-full h-20 p-3 bg-slate-50 rounded-xl text-xs outline-none focus:ring-2 focus:ring-primary/10 transition-all resize-none"
                    />
                    <Button 
                      onClick={handleAddRemark}
                      disabled={isSaving || !remark.trim()}
                      className="w-full h-10 rounded-xl text-xs font-bold shadow-lg shadow-primary/10"
                    >
                      {isSaving ? "Saving..." : "Submit Remark"}
                      <Send className="ml-2 h-3 w-3" />
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4 animate-in fade-in duration-300">
                  {popoverLead.activities?.slice().reverse().map((activity: any, idx: number) => (
                    <div key={idx} className="flex gap-3 relative before:absolute before:left-[11px] before:top-6 before:bottom-0 before:w-[2px] before:bg-slate-100 last:before:hidden">
                      <div className={`h-6 w-6 rounded-full flex items-center justify-center shrink-0 z-10 ${
                        activity.type === 'note' ? 'bg-primary text-white' : 
                        activity.type === 'status_change' ? 'bg-green-500 text-white' :
                        'bg-slate-200 text-slate-500'
                      }`}>
                        {activity.type === 'note' ? <MessageSquare className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      </div>
                      <div className="space-y-1 pb-4">
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-bold text-slate-900">{activity.by?.name || "System"}</span>
                          <span className="text-[9px] text-slate-400">{format(new Date(activity.at), "MMM d, HH:mm")}</span>
                        </div>
                        <p className="text-[11px] text-slate-600 leading-relaxed font-medium">{activity.message}</p>
                      </div>
                    </div>
                  ))}
                  {(!popoverLead.activities || popoverLead.activities.length === 0) && (
                    <div className="text-center py-10 text-slate-400 italic text-xs">No activity found.</div>
                  )}
                </div>
              )}
            </div>

            {/* View Full Button */}
            <div className="p-3 bg-slate-50 border-t border-slate-100">
              <Button 
                variant="ghost" 
                className="w-full h-10 rounded-xl text-[10px] font-black uppercase tracking-widest text-primary hover:bg-primary/5"
                onClick={() => {
                  setModalPos({
                    x: popoverPos.x,
                    y: popoverPos.y + POPOVER_HEIGHT + DROPDOWN_GAP,
                  });
                  setSelectedLead(popoverLead);
                  setPopoverLead(null);
                }}
              >
                View Full Details <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
