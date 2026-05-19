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
import { bulkAssignLeads, addLeadRemark, updateLead } from "@/actions/leads";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { format } from "date-fns";

const STATUS_OPTIONS = [
  { id: "new", name: "New Lead" },
  { id: "interested", name: "Interested" },
  { id: "not_interested", name: "Not Interested" },
  { id: "follow_up", name: "Follow-up" },
  { id: "callback", name: "Callback" },
  { id: "converted", name: "Converted" },
  { id: "closed", name: "Closed" },
  { id: "admission_done", name: "Admission Done" },
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
  const router = useRouter();
  const [selectedLead, setSelectedLead] = useState<any>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [bulkAssignId, setBulkAssignId] = useState("");
  const [isBulkLoading, setIsBulkLoading] = useState(false);
  
  const [popoverLead, setPopoverLead] = useState<any>(null);
  const [popoverPos, setPopoverPos] = useState({ x: 0, y: 0 });
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

  const handleNameClick = (e: React.MouseEvent, lead: any) => {
    e.stopPropagation();
    setPopoverLead(lead);
    setPopoverPos({ x: e.clientX, y: e.clientY });
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

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-100 bg-slate-50/50 text-left font-bold text-slate-500 uppercase tracking-tighter">
              <th className="px-6 py-4 w-12">
                <button onClick={toggleSelectAll} className="text-slate-400 hover:text-primary transition-colors">
                  {selectedIds.length === leads.length && leads.length > 0 ? <CheckSquare className="h-5 w-5 text-primary" /> : <Square className="h-5 w-5" />}
                </button>
              </th>
              <th className="px-6 py-4 w-12">#</th>
              <th className="px-6 py-4">Lead Info</th>
              <th className="px-6 py-4">Contact Details</th>
              <th className="px-6 py-4">Status & Score</th>
              <th className="px-6 py-4">Assigned To</th>
              <th className="px-6 py-4 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {leads.map((l, index) => (
              <tr 
                key={l._id.toString()} 
                className={`hover:bg-slate-50/80 transition-colors group cursor-pointer ${selectedIds.includes(l._id.toString()) ? 'bg-primary/5' : ''}`}
                onClick={(e) => handleNameClick(e, l)}
              >
                <td className="px-6 py-4" onClick={(e) => { e.stopPropagation(); toggleSelect(l._id.toString()); }}>
                  <button className="text-slate-300 hover:text-primary transition-colors">
                    {selectedIds.includes(l._id.toString()) ? <CheckSquare className="h-5 w-5 text-primary" /> : <Square className="h-5 w-5" />}
                  </button>
                </td>
                <td className="px-6 py-4 font-bold text-slate-400">
                  {index + 1}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div>
                      <div 
                        className="font-bold text-slate-900 group-hover:text-primary transition-colors flex items-center gap-2 cursor-pointer"
                        onClick={(e) => handleNameClick(e, l)}
                      >
                        {l.name}
                        <Eye className="h-3 w-3 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                      </div>
                      <div className="flex flex-col gap-1 mt-1">
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{l.source}</span>
                          {l.temperature && (
                            <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                              l.temperature === 'hot' ? 'bg-red-100 text-red-600' :
                              l.temperature === 'warm' ? 'bg-orange-100 text-orange-600' :
                              'bg-blue-100 text-blue-600'
                            }`}>
                              {l.temperature}
                            </span>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {l.universityId && (
                            <span className="text-[9px] font-bold bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded flex items-center gap-1">
                              <Building2 className="h-2.5 w-2.5" /> {l.universityId.name}
                            </span>
                          )}
                          {l.courseId && (
                            <span className="text-[9px] font-bold bg-primary/5 text-primary px-1.5 py-0.5 rounded flex items-center gap-1">
                              <GraduationCap className="h-2.5 w-2.5" /> {l.courseId.name}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 text-slate-600 font-medium">
                      <Phone className="h-3.5 w-3.5" /> {l.phone}
                    </div>
                    <div className="flex items-center gap-2 text-slate-400 text-xs">
                      <Mail className="h-3.5 w-3.5" /> {l.email || "No email"}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <div className="space-y-2">
                    <Badge variant="secondary" className={`capitalize font-bold ${
                      l.temperature === 'hot' ? 'bg-red-50 text-red-600 border-red-100' :
                      l.status === 'converted' ? 'bg-green-50 text-green-600 border-green-100' :
                      l.status === 'interested' ? 'bg-blue-50 text-blue-600 border-blue-100' :
                      'bg-slate-50 text-slate-600 border-slate-100'
                    }`}>
                      {l.status.replace('_', ' ')}
                    </Badge>
                    <div className="w-full bg-slate-100 h-1 rounded-full overflow-hidden">
                      <div className={`h-full ${l.score > 70 ? 'bg-green-500' : l.score > 40 ? 'bg-orange-500' : 'bg-red-500'}`} style={{ width: `${l.score}%` }} />
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4">
                  {l.assignedTo ? (
                    <div className="flex items-center gap-2">
                      <div className="h-6 w-6 rounded-full bg-primary/10 flex items-center justify-center text-[10px] font-bold text-primary">
                        {l.assignedTo.name.charAt(0)}
                      </div>
                      <span className="font-medium text-slate-700">{l.assignedTo.name}</span>
                    </div>
                  ) : (
                    <span className="text-slate-400 italic text-xs">Not Assigned</span>
                  )}
                </td>
                <td className="px-6 py-4" onClick={(e) => e.stopPropagation()}>
                  <div className="flex items-center justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild className="h-9 w-9 rounded-full text-slate-400 hover:text-primary hover:bg-primary/5">
                      <a href={`tel:${l.phone}`} title="Call Lead">
                        <Phone className="h-4 w-4" />
                      </a>
                    </Button>
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
                <td colSpan={6} className="px-6 py-12 text-center text-slate-400">
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
          onClose={() => setSelectedLead(null)}
        />
      )}

      <AnimatePresence>
        {popoverLead && (
          <motion.div
            ref={popoverRef}
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            style={{ 
              position: 'fixed', 
              top: typeof window !== 'undefined' ? Math.min(popoverPos.y + 10, window.innerHeight - 520) : popoverPos.y + 10, 
              left: typeof window !== 'undefined' ? Math.min(popoverPos.x + 10, window.innerWidth - 420) : popoverPos.x + 10,
              zIndex: 150 
            }}
            className="bg-white rounded-[2rem] shadow-2xl border border-slate-100 w-[400px] max-h-[500px] flex flex-col overflow-hidden"
          >
            {/* Popover Header */}
            <div className="p-5 border-b border-slate-50 bg-slate-50/50 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold">
                  {popoverLead.name.charAt(0)}
                </div>
                <div>
                  <h4 className="font-bold text-slate-900 text-sm">{popoverLead.name}</h4>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{popoverLead.leadId}</p>
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
                      <p className="text-xs font-bold text-slate-700 flex items-center gap-1.5">
                        <Phone className="h-3 w-3 text-slate-300" /> {popoverLead.phone}
                      </p>
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
