"use client";

import { useState } from "react";
import { 
  X, Save, Phone, Mail, MapPin, 
  Calendar, User as UserIcon, GraduationCap, 
  Building2, Flame, CreditCard, PhoneCall, 
  MessageSquare, CheckCircle2, AlertCircle, 
  Clock, History, Edit3, Send, UserCheck
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { updateLead, addLeadRemark } from "@/actions/leads";
import { useRouter } from "next/navigation";
import { format } from "date-fns";

interface LeadDetailsModalProps {
  lead: any;
  teamMembers: { id: string; name: string }[];
  pipelines: { id: string; name: string }[];
  courses: { id: string; name: string }[];
  universities: { id: string; name: string }[];
  onClose: () => void;
  clickPos?: { x: number; y: number };
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
  { id: "other", name: "Other" },
];

const TEMPERATURE_OPTIONS = [
  { id: "hot", name: "Hot Lead" },
  { id: "warm", name: "Warm Lead" },
  { id: "cold", name: "Cold Lead" },
];

const PAYMENT_OPTIONS = [
  { id: "paid", name: "Paid" },
  { id: "partial_paid", name: "Partial Paid" },
  { id: "pending", name: "Pending" },
];

export function LeadDetailsModal({
  lead,
  teamMembers,
  pipelines,
  courses,
  universities,
  onClose,
  clickPos,
}: LeadDetailsModalProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"details" | "history">("details");
  const [remark, setRemark] = useState("");
  const [remarkStatus, setRemarkStatus] = useState(lead.status);
  
  const [formData, setFormData] = useState({
    name: lead.name,
    phone: lead.phone,
    email: lead.email || "",
    status: lead.status,
    source: lead.source,
    temperature: lead.temperature || "warm",
    paymentStatus: lead.paymentStatus || "pending",
    assignedTo: lead.assignedTo?._id || lead.assignedTo || "",
    courseId: lead.courseId?._id || lead.courseId || "",
    universityId: lead.universityId?._id || lead.universityId || "",
    city: lead.city || "",
    state: lead.state || "",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async () => {
    setLoading(true);
    try {
      await updateLead(lead._id, formData);
      router.refresh();
      onClose();
    } catch (error) {
      console.error("Failed to update lead", error);
      alert("Failed to update lead. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleAddRemark = async () => {
    if (!remark.trim()) return;
    setLoading(true);
    try {
      await addLeadRemark(lead._id, remark, remarkStatus);
      setRemark("");
      router.refresh();
      // Optionally stay on history tab to see the new remark
      setActiveTab("history");
    } catch (error) {
      console.error("Failed to add remark", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6 bg-slate-900/40 backdrop-blur-sm animate-in fade-in duration-300">
      <div 
        className="fixed inset-0" 
        onClick={onClose} 
      />
      <div 
        style={clickPos ? {
          position: 'fixed',
          top: typeof window !== 'undefined' ? Math.max(20, Math.min(clickPos.y - 200, window.innerHeight - 700)) : '50%',
          left: typeof window !== 'undefined' ? Math.max(20, Math.min(clickPos.x - 450, window.innerWidth - 900)) : '50%',
          transform: clickPos ? 'none' : 'translate(-50%, -50%)',
          margin: 0
        } : {}}
        className={`relative w-full max-w-4xl max-h-[90vh] bg-slate-50 shadow-2xl rounded-[2.5rem] overflow-hidden flex flex-col animate-in zoom-in-95 ${clickPos ? 'fade-in duration-300' : 'slide-in-from-top-10 duration-500'} border border-white/20`}
      >
        {/* Header */}
        <div className="bg-white/80 backdrop-blur-xl border-b border-slate-100 p-6 sm:p-8 flex items-center justify-between">
          <div className="flex items-center gap-4 sm:gap-6">
            <div className="h-14 w-14 sm:h-16 sm:w-16 rounded-[1.5rem] bg-primary/10 flex items-center justify-center text-primary font-black text-2xl shadow-inner">
              {formData.name.charAt(0)}
            </div>
            <div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 leading-tight tracking-tight">{formData.name}</h2>
              <div className="flex items-center gap-2 sm:gap-3 mt-1">
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">{lead.leadId || "NO ID"}</span>
                <div className="h-1 w-1 rounded-full bg-slate-300" />
                <span className="text-[10px] sm:text-xs font-bold text-slate-400 uppercase tracking-widest">{formData.source}</span>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex bg-slate-100 p-1.5 rounded-2xl">
              <button 
                onClick={() => setActiveTab("details")}
                className={`px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'details' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                Details
              </button>
              <button 
                onClick={() => setActiveTab("history")}
                className={`px-6 py-2.5 text-xs font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'history' ? 'bg-white text-primary shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
              >
                History
              </button>
            </div>
            <button 
              onClick={onClose}
              className="p-3 rounded-2xl hover:bg-slate-100 text-slate-400 transition-all hover:rotate-90 active:scale-90"
            >
              <X className="h-6 w-6 sm:h-7 sm:w-7" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar">
          {/* Mobile Tabs */}
          <div className="sm:hidden flex bg-white border-b border-slate-100 p-2">
            <button 
              onClick={() => setActiveTab("details")}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'details' ? 'bg-primary/5 text-primary' : 'text-slate-500'}`}
            >
              Details
            </button>
            <button 
              onClick={() => setActiveTab("history")}
              className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-xl transition-all ${activeTab === 'history' ? 'bg-primary/5 text-primary' : 'text-slate-500'}`}
            >
              History
            </button>
          </div>
          {activeTab === "details" ? (
            <div className="p-8 space-y-10 animate-in fade-in slide-in-from-bottom-2 duration-300">
              {/* Quick Stats/Badges */}
              <div className="flex flex-wrap gap-3">
                <Badge className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                  formData.status === 'converted' ? 'bg-green-500 text-white' : 'bg-primary/10 text-primary border-none'
                }`}>
                  {formData.status.replace('_', ' ')}
                </Badge>
                <Badge variant="outline" className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border-none ${
                  formData.temperature === 'hot' ? 'bg-red-50 text-red-600' :
                  formData.temperature === 'warm' ? 'bg-orange-50 text-orange-600' :
                  'bg-blue-50 text-blue-600'
                }`}>
                  {formData.temperature === 'hot' ? '🔥 ' : formData.temperature === 'warm' ? '🙂 ' : '❄️ '}
                  {formData.temperature}
                </Badge>
                <Badge variant="outline" className="px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider border-none bg-slate-100 text-slate-600">
                  <CreditCard className="h-3 w-3 mr-1.5" />
                  {formData.paymentStatus.replace('_', ' ')}
                </Badge>
              </div>

              {/* Remark Section (Professional Disposition) */}
              <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm space-y-4">
                <h3 className="text-xs font-black uppercase tracking-widest text-primary flex items-center gap-2">
                  <MessageSquare className="h-4 w-4" /> Add Remark / Dispose Lead
                </h3>
                <div className="space-y-4">
                  <textarea 
                    value={remark}
                    onChange={(e) => setRemark(e.target.value)}
                    placeholder="Enter counsellor remark here..."
                    className="w-full min-h-[100px] p-4 bg-slate-50 border-transparent rounded-2xl focus:bg-white focus:border-primary/20 transition-all text-sm outline-none resize-none"
                  />
                  <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                      <select 
                        value={remarkStatus}
                        onChange={(e) => setRemarkStatus(e.target.value)}
                        className="w-full h-11 px-4 bg-slate-50 border-transparent rounded-xl outline-none focus:ring-2 focus:ring-primary/10 transition-all text-xs font-bold uppercase tracking-wider text-slate-600"
                      >
                        {STATUS_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                      </select>
                    </div>
                    <Button 
                      onClick={handleAddRemark}
                      disabled={loading || !remark.trim()}
                      className="h-11 px-6 rounded-xl font-bold shadow-lg shadow-primary/10"
                    >
                      <Send className="h-4 w-4 mr-2" />
                      Submit Remark
                    </Button>
                  </div>
                </div>
              </div>

              {/* Form Sections */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Contact Information */}
                <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                    <Phone className="h-4 w-4" /> Contact Details
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-tighter ml-1">Full Name</label>
                      <Input name="name" value={formData.name} onChange={handleChange} className="h-12 bg-white border-slate-100 rounded-xl focus:ring-4 focus:ring-primary/5 transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-tighter ml-1">Phone Number</label>
                      <Input name="phone" value={formData.phone} onChange={handleChange} className="h-12 bg-white border-slate-100 rounded-xl focus:ring-4 focus:ring-primary/5 transition-all" />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-tighter ml-1">Email Address</label>
                      <Input name="email" value={formData.email} onChange={handleChange} className="h-12 bg-white border-slate-100 rounded-xl focus:ring-4 focus:ring-primary/5 transition-all" />
                    </div>
                  </div>
                </div>

                {/* Lead Status & Assignment */}
                <div className="space-y-6">
                  <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                    <UserCheck className="h-4 w-4" /> Assignment
                  </h3>
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-tighter ml-1">Lead Temperature</label>
                      <select 
                        name="temperature" 
                        value={formData.temperature} 
                        onChange={handleChange}
                        className="w-full h-12 px-4 bg-white border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold text-slate-700"
                      >
                        {TEMPERATURE_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-tighter ml-1">Assigned To</label>
                      <select 
                        name="assignedTo" 
                        value={formData.assignedTo} 
                        onChange={handleChange}
                        className="w-full h-12 px-4 bg-white border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold text-slate-700"
                      >
                        <option value="">Unassigned</option>
                        {teamMembers.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[10px] font-black text-slate-500 uppercase tracking-tighter ml-1">Lead Source</label>
                      <select 
                        name="source" 
                        value={formData.source} 
                        onChange={handleChange}
                        className="w-full h-12 px-4 bg-white border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold text-slate-700"
                      >
                        {SOURCE_OPTIONS.map(opt => <option key={opt.id} value={opt.id}>{opt.name}</option>)}
                      </select>
                    </div>
                  </div>
                </div>
              </div>

              {/* Academic Details */}
              <div className="space-y-6 pt-6 border-t border-slate-200">
                <h3 className="text-xs font-black uppercase tracking-widest text-slate-400 flex items-center gap-2 px-1">
                  <GraduationCap className="h-4 w-4" /> Course Interest
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-tighter ml-1">University</label>
                    <select 
                      name="universityId" 
                      value={formData.universityId} 
                      onChange={handleChange}
                      className="w-full h-12 px-4 bg-white border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold text-slate-700"
                    >
                      <option value="">No University Selected</option>
                      {universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-tighter ml-1">Course</label>
                    <select 
                      name="courseId" 
                      value={formData.courseId} 
                      onChange={handleChange}
                      className="w-full h-12 px-4 bg-white border border-slate-100 rounded-xl outline-none focus:ring-4 focus:ring-primary/5 transition-all text-sm font-bold text-slate-700"
                    >
                      <option value="">No Course Selected</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="p-8 space-y-8 animate-in fade-in slide-in-from-bottom-2 duration-300">
              <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <History className="h-5 w-5" /> Activity Timeline
              </h3>
              
              <div className="relative space-y-6 before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-primary/20 before:via-slate-200 before:to-transparent">
                {lead.activities?.slice().reverse().map((activity: any, idx: number) => (
                  <div key={idx} className="relative flex items-start gap-6 group">
                    <div className={`absolute left-0 h-10 w-10 rounded-full border-4 border-slate-50 flex items-center justify-center z-10 transition-transform group-hover:scale-110 ${
                      activity.type === 'note' ? 'bg-primary text-white' : 
                      activity.type === 'status_change' ? 'bg-green-500 text-white' :
                      'bg-slate-200 text-slate-500'
                    }`}>
                      {activity.type === 'note' ? <MessageSquare className="h-4 w-4" /> : 
                       activity.type === 'status_change' ? <CheckCircle2 className="h-4 w-4" /> :
                       <History className="h-4 w-4" />}
                    </div>
                    
                    <div className="ml-12 flex-1 bg-white p-5 rounded-2xl shadow-sm border border-slate-100 group-hover:border-primary/10 transition-colors">
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-2">
                        <span className="text-xs font-black text-slate-900 uppercase tracking-tight flex items-center gap-2">
                          <UserIcon className="h-3 w-3 text-primary" />
                          {activity.by?.name || "System"}
                          {activity.type === 'note' && (
                            <Badge variant="outline" className="text-[9px] py-0 px-2 bg-primary/5 text-primary border-none font-black uppercase">Remark</Badge>
                          )}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1.5">
                          <Clock className="h-3 w-3" />
                          {format(new Date(activity.at), "MMM d, yyyy • hh:mm a")}
                        </span>
                      </div>
                      <p className="text-sm text-slate-600 font-medium leading-relaxed">
                        {activity.message}
                      </p>
                    </div>
                  </div>
                ))}

                {(!lead.activities || lead.activities.length === 0) && (
                  <div className="flex flex-col items-center justify-center py-20 text-slate-400 italic">
                    <AlertCircle className="h-10 w-10 mb-2 opacity-20" />
                    <p>No activity history found for this lead.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-white border-t border-slate-100 p-6 flex gap-4 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)]">
          <Button 
            variant="outline" 
            onClick={onClose}
            className="flex-1 h-14 rounded-2xl font-bold text-slate-500 border-slate-200 hover:bg-slate-50"
          >
            Cancel
          </Button>
          <Button 
            onClick={handleUpdate}
            disabled={loading}
            className="flex-[2] h-14 rounded-2xl font-bold shadow-xl shadow-primary/20 transition-all hover:scale-[1.02] active:scale-95"
          >
            {loading ? <Clock className="h-5 w-5 animate-spin mr-2" /> : <Save className="h-5 w-5 mr-2" />}
            Save All Changes
          </Button>
        </div>
      </div>
    </div>
  );
}
