"use client";

import { useState } from "react";
import { Plus, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createLead } from "@/actions/leads";

export function LeadForm({ 
  pipelines, 
  courses, 
  universities 
}: { 
  pipelines: { id: string; name: string }[],
  courses: { id: string; name: string }[],
  universities: { id: string; name: string }[]
}) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      const data = {
        name: formData.get("name") as string,
        phone: formData.get("phone") as string,
        email: formData.get("email") as string,
        source: formData.get("source") as any || "other",
        pipelineId: formData.get("pipelineId") as string || undefined,
        courseId: formData.get("courseId") as string || undefined,
        universityId: formData.get("universityId") as string || undefined,
        status: "new",
      };
      await createLead(data);
      setOpen(false);
    } catch (err) {
      console.error("Failed to create lead", err);
    } finally {
      setLoading(false);
    }
  }

  if (!open) {
    return (
      <Button onClick={() => setOpen(true)} size="sm" className="h-8 rounded-lg text-xs font-semibold gap-1.5">
        <Plus className="h-3.5 w-3.5" />
        Add Lead
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4 sm:p-6">
      <div className="bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.2)] w-full max-w-6xl overflow-hidden border border-slate-100 animate-in fade-in zoom-in duration-300">
        <div className="p-8 sm:p-10 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center">
              <Plus className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h2 className="text-2xl font-black text-slate-900">Add New Lead</h2>
              <p className="text-xs text-slate-400 font-medium uppercase tracking-widest mt-1">Enter student details below</p>
            </div>
          </div>
          <button onClick={() => setOpen(false)} className="h-10 w-10 flex items-center justify-center hover:bg-slate-100 rounded-xl transition-all active:scale-95">
            <Plus className="h-6 w-6 text-slate-400 rotate-45" />
          </button>
        </div>
        <form action={handleSubmit} className="p-8 sm:p-10">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest px-1">Full Name</label>
              <Input name="name" required placeholder="Student Name" className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest px-1">Phone Number</label>
              <Input name="phone" required placeholder="+91..." className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest px-1">Email Address</label>
              <Input name="email" type="email" placeholder="email@example.com" className="h-14 rounded-2xl border-slate-200 bg-slate-50/50 focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all text-sm font-medium" />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest px-1">Source</label>
              <select name="source" className="flex h-14 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-sm focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium appearance-none">
                <option value="facebook">Facebook</option>
                <option value="google_ads">Google Ads</option>
                <option value="website">Website</option>
                <option value="instagram">Instagram</option>
                <option value="whatsapp">WhatsApp</option>
                <option value="referral">Referral</option>
                <option value="organic">Organic</option>
                <option value="justdial">Justdial</option>
                <option value="indiamart">IndiaMART</option>
                <option value="other">Other</option>
              </select>
            </div>
            {pipelines.length > 0 && (
              <div className="space-y-3">
                <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest px-1">Pipeline</label>
                <select name="pipelineId" className="flex h-14 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-sm focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium appearance-none">
                  <option value="">No Pipeline</option>
                  {pipelines.map(p => (
                    <option key={p.id} value={p.id}>{p.name}</option>
                  ))}
                </select>
              </div>
            )}
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest px-1">University</label>
              <select name="universityId" className="flex h-14 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-sm focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium appearance-none">
                <option value="">Select University</option>
                {universities.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-900 uppercase tracking-widest px-1">Course</label>
              <select name="courseId" className="flex h-14 w-full rounded-2xl border border-slate-200 bg-slate-50/50 px-4 py-2 text-sm focus:bg-white focus:ring-4 focus:ring-primary/5 transition-all outline-none font-medium appearance-none">
                <option value="">Select Course</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex justify-end gap-4 pt-10 mt-8 border-t border-slate-100">
            <Button type="button" variant="ghost" onClick={() => setOpen(false)} className="h-14 px-10 rounded-2xl text-slate-500 hover:bg-slate-50 font-bold uppercase tracking-widest text-[10px] transition-all">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="h-14 px-12 rounded-2xl font-bold uppercase tracking-widest text-[10px] shadow-2xl shadow-primary/30 transition-all active:scale-95">
              {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : "Create Lead"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
