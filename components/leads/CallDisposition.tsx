"use client";

import { useState } from "react";
import { 
  CheckCircle2, XCircle, ChevronDown, ChevronRight, 
  Clock, Calendar, Flag, MessageSquare, Send, 
  Upload, MessageCircle, Mail, Save, Loader2, CheckSquare
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { saveDisposition } from "@/actions/leads";
import { useRouter } from "next/navigation";

const DISPOSITIONS = {
  connected: [
    {
      name: "Interested",
      subs: ["Wants Callback", "Need Course Details", "Need Fee Details", "Need Brochure", "Need Scholarship Info", "Ready for Admission", "Need EMI Details"]
    },
    {
      name: "Follow-Up",
      subs: ["Call Tomorrow", "Call Next Week", "Busy Right Now", "Parent Discussion Pending", "Need Time to Decide"]
    },
    {
      name: "Admission Process",
      subs: ["Application Started", "Documents Pending", "Payment Pending", "Admission Completed"]
    },
    {
      name: "Hot Lead",
      subs: ["Ready to Pay", "Immediate Admission", "Wants Counselor Support"]
    },
    {
      name: "Warm Lead",
      subs: ["Interested but Comparing", "Thinking About Admission"]
    },
    {
      name: "Cold Lead",
      subs: ["Low Interest", "Not Responding Properly"]
    }
  ],
  not_connected: [
    { name: "No Answer", subs: ["Normal No Answer"] },
    { name: "Switched Off", subs: ["Normal Switched Off"] },
    { name: "Busy", subs: ["Normal Busy"] },
    { name: "Invalid Number", subs: ["Normal Invalid Number"] },
    { name: "Call Disconnected", subs: ["Normal Disconnected"] },
    { name: "Wrong Number", subs: ["Normal Wrong Number"] },
    { name: "Out of Coverage", subs: ["Normal Out of Coverage"] },
    { name: "Number Not Reachable", subs: ["Normal Not Reachable"] },
    { name: "Call Back Later", subs: ["Normal Call Back Later"] },
    { name: "Spam Lead", subs: ["Normal Spam Lead"] },
    { name: "Duplicate Lead", subs: ["Normal Duplicate Lead"] }
  ]
};

const DISPOSITION_COLORS: Record<string, string> = {
  "Interested": "bg-emerald-500",
  "Follow-Up": "bg-blue-500",
  "Admission Process": "bg-purple-500",
  "Hot Lead": "bg-rose-500",
  "Warm Lead": "bg-orange-500",
  "Cold Lead": "bg-slate-500",
  "No Answer": "bg-slate-400",
  "Switched Off": "bg-slate-400",
  "Busy": "bg-amber-500",
  "Invalid Number": "bg-red-500",
  "Call Disconnected": "bg-rose-400",
  "Wrong Number": "bg-red-600",
  "Out of Coverage": "bg-slate-400",
  "Number Not Reachable": "bg-slate-400",
  "Call Back Later": "bg-indigo-500",
  "Spam Lead": "bg-red-900",
  "Duplicate Lead": "bg-slate-900",
};

export function CallDisposition({ leadId }: { leadId: string }) {
  const router = useRouter();
  const [callType, setCallType] = useState<"connected" | "not_connected" | null>(null);
  const [selectedDisp, setSelectedDisp] = useState<string | null>(null);
  const [selectedSubs, setSelectedSubs] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  const step = !callType ? 1 : !selectedDisp ? 2 : selectedSubs.length === 0 ? 3 : 4;
  
  const [formData, setFormData] = useState({
    note: "",
    nextFollowUpAt: "",
    priority: "medium",
    probability: 50,
  });

  const toggleSub = (sub: string) => {
    setSelectedSubs(prev => 
      prev.includes(sub) ? prev.filter(s => s !== sub) : [...prev, sub]
    );
  };

  const handleSave = async () => {
    if (!callType || !selectedDisp || selectedSubs.length === 0) return;
    setLoading(true);
    try {
      await saveDisposition(leadId, {
        type: callType,
        disposition: selectedDisp,
        subDisposition: selectedSubs.join(", "),
        ...formData
      });
      router.refresh();
      // Reset form
      setCallType(null);
      setSelectedDisp(null);
      setSelectedSubs([]);
      setFormData({ note: "", nextFollowUpAt: "", priority: "medium", probability: 50 });
    } catch (error) {
      console.error("Save failed", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-[2rem] border border-slate-200 shadow-xl overflow-hidden transition-all duration-500 w-full h-full flex flex-col">
      <div className="p-4 lg:p-5 border-b border-slate-100 bg-gradient-to-r from-primary/5 to-transparent shrink-0">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <div className="h-8 w-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <MessageSquare className="h-5 w-5 text-primary" />
            </div>
            Call Disposition
          </h3>
          <div className="flex gap-1">
            {[1, 2, 3, 4].map((s) => (
              <div 
                key={s} 
                className={`h-1 w-6 rounded-full transition-all duration-500 ${
                  s <= step ? 'bg-primary shadow-[0_0_8px_rgba(var(--primary),0.5)]' : 'bg-slate-100'
                }`} 
              />
            ))}
          </div>
        </div>
      </div>

      <div className="p-4 lg:p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
        {/* Step 1: Call Type */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="h-5 w-5 rounded-full bg-slate-900 text-white text-[9px] flex items-center justify-center font-bold">1</div>
              <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Status</p>
            </div>
            {callType && (
              <Badge variant="outline" className="h-5 bg-emerald-50 text-emerald-700 border-emerald-100 text-[8px] uppercase font-bold">Selected</Badge>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => { setCallType("connected"); setSelectedDisp(null); setSelectedSubs([]); }}
              className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all group relative overflow-hidden ${
                callType === 'connected' 
                  ? 'border-emerald-500 bg-emerald-50 text-emerald-700 shadow-md scale-[1.02]' 
                  : 'border-slate-100 bg-white text-slate-600 hover:border-emerald-200'
              }`}
            >
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-500 ${
                callType === 'connected' ? 'bg-emerald-500 text-white rotate-0' : 'bg-slate-50 text-emerald-500 group-hover:bg-emerald-100'
              }`}>
                <CheckCircle2 className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">Connected</span>
            </button>
            <button
              onClick={() => { setCallType("not_connected"); setSelectedDisp(null); setSelectedSubs([]); }}
              className={`flex-1 flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all group relative overflow-hidden ${
                callType === 'not_connected' 
                  ? 'border-red-500 bg-red-50 text-red-700 shadow-md scale-[1.02]' 
                  : 'border-slate-100 bg-white text-slate-600 hover:border-red-200'
              }`}
            >
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center transition-all duration-500 ${
                callType === 'not_connected' ? 'bg-red-500 text-white rotate-0' : 'bg-slate-50 text-red-500 group-hover:bg-red-100'
              }`}>
                <XCircle className="h-6 w-6" />
              </div>
              <span className="text-[10px] font-bold uppercase tracking-widest">Not Connected</span>
            </button>
          </div>
        </div>

        {/* Step 2: Main Disposition */}
        <AnimatePresence mode="wait">
          {callType && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-slate-900 text-white text-[9px] flex items-center justify-center font-bold">2</div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Reason</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {DISPOSITIONS[callType].map((d) => {
                  const colorClass = DISPOSITION_COLORS[d.name] || "bg-primary";
                  const isActive = selectedDisp === d.name;
                  
                  return (
                    <button
                      key={d.name}
                      onClick={() => { setSelectedDisp(d.name); setSelectedSubs([]); }}
                      className={`relative p-3 rounded-xl border text-[10px] font-bold transition-all text-center overflow-hidden ${
                        isActive 
                          ? `border-transparent text-white shadow-lg ${colorClass} scale-[1.03] z-10` 
                          : 'border-slate-100 bg-slate-50/50 text-slate-700 hover:bg-white hover:border-slate-300'
                      }`}
                    >
                      <span className="relative z-10">{d.name}</span>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 3: Sub-Disposition */}
        <AnimatePresence mode="wait">
          {selectedDisp && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="h-5 w-5 rounded-full bg-slate-900 text-white text-[9px] flex items-center justify-center font-bold">3</div>
                  <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Sub-Details</p>
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {DISPOSITIONS[callType!].find(d => d.name === selectedDisp)?.subs.map((s) => {
                  const isSelected = selectedSubs.includes(s);
                  const baseColor = DISPOSITION_COLORS[selectedDisp] || "bg-primary";
                  
                  return (
                    <button
                      key={s}
                      onClick={() => toggleSub(s)}
                      className={`p-3 rounded-xl border text-[10px] font-medium text-left transition-all flex items-center justify-between group ${
                        isSelected 
                          ? 'border-primary bg-primary/5 text-primary shadow-sm' 
                          : 'border-slate-100 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      <span className={isSelected ? 'font-bold' : ''}>{s}</span>
                      <div className={`h-5 w-5 rounded-lg border flex items-center justify-center transition-all ${
                        isSelected 
                          ? `${baseColor} border-transparent text-white scale-105` 
                          : 'border-slate-200 bg-slate-50'
                      }`}>
                        {isSelected && <CheckSquare className="h-3 w-3" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Step 4: Details Form */}
        <AnimatePresence>
          {selectedSubs.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 pt-4 border-t border-slate-100"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Calendar className="h-3 w-3" /> Next Follow-up
                  </label>
                  <input
                    type="datetime-local"
                    value={formData.nextFollowUpAt}
                    onChange={(e) => setFormData({ ...formData, nextFollowUpAt: e.target.value })}
                    className="w-full h-10 px-4 bg-slate-50 border-transparent rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-primary/5 transition-all text-xs font-medium text-slate-900"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
                    <Flag className="h-3 w-3" /> Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                    className="w-full h-10 px-4 bg-slate-50 border-transparent rounded-xl outline-none focus:bg-white focus:ring-2 focus:ring-primary/5 transition-all text-xs font-medium text-slate-900 appearance-none"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="urgent">Urgent</option>
                  </select>
                </div>
              </div>

              <div className="space-y-2 bg-slate-50/50 p-4 rounded-2xl border border-slate-100">
                <div className="flex justify-between items-center">
                  <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Probability</label>
                  <span className="text-[10px] font-bold text-primary bg-primary/10 px-2 py-0.5 rounded-full">{formData.probability}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={formData.probability}
                  onChange={(e) => setFormData({ ...formData, probability: parseInt(e.target.value) })}
                  className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-primary"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Remarks</label>
                <textarea
                  value={formData.note}
                  onChange={(e) => setFormData({ ...formData, note: e.target.value })}
                  placeholder="Conversation notes..."
                  className="w-full min-h-[80px] p-4 bg-slate-50 border-transparent rounded-2xl outline-none focus:bg-white focus:ring-2 focus:ring-primary/5 transition-all text-xs font-medium text-slate-900 resize-none"
                />
              </div>

              <div className="flex items-center justify-between pt-2">
                <div className="flex gap-1.5">
                  <Button variant="outline" className="h-9 w-9 p-0 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50">
                    <MessageCircle className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" className="h-9 w-9 p-0 rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50">
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
                <Button 
                  onClick={handleSave}
                  disabled={loading}
                  className="h-10 px-6 rounded-xl font-bold uppercase tracking-widest text-[10px] shadow-lg shadow-primary/20 transition-all active:scale-95"
                >
                  {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4 mr-2" />}
                  Save
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
