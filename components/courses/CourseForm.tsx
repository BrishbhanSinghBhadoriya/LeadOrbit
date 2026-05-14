"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, X, FileText, Upload, Trash2, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createCourse, updateCourse } from "@/actions/courses";
import { uploadFile } from "@/actions/uploads";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

interface CourseFormProps {
  course?: any;
  universities: { id: string; name: string }[];
  onSuccess?: () => void;
}

export function CourseForm({ course, universities, onSuccess }: CourseFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [brochureUrl, setBrochureUrl] = useState(course?.brochureUrl || "");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (open) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [open]);

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const url = await uploadFile(formData);
      setBrochureUrl(url);
    } catch (err) {
      console.error("Upload failed", err);
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    try {
      const data = {
        name: formData.get("name") as string,
        code: formData.get("code") as string,
        level: formData.get("level") as any,
        durationMonths: parseInt(formData.get("durationMonths") as string),
        fees: parseFloat(formData.get("fees") as string),
        eligibility: formData.get("eligibility") as string,
        universityId: formData.get("universityId") as string,
        brochureUrl,
      };

      if (course) {
        await updateCourse(course._id, data);
      } else {
        await createCourse(data);
      }
      setOpen(false);
      onSuccess?.();
    } catch (err) {
      console.error("Failed to save course", err);
    } finally {
      setLoading(false);
    }
  }

  const modalContent = (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 md:p-8">
          {/* Backdrop with Heavy Blur */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setOpen(false)}
            className="absolute inset-0 bg-slate-950/80 backdrop-blur-md"
          />
          
          {/* Centered Modal Card */}
          <motion.div 
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 40 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="bg-white rounded-[2.5rem] shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)] w-full max-w-3xl overflow-hidden relative z-10 border border-slate-200"
          >
            {/* Header Section */}
            <div className="px-8 py-8 border-b flex justify-between items-center bg-gradient-to-r from-orange-50 to-white">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                  {course ? "Modify Course" : "New Academic Program"}
                </h2>
                <p className="text-slate-500 mt-1 font-medium italic">Define the future of your students.</p>
              </div>
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setOpen(false)} 
                className="rounded-2xl h-12 w-12 hover:bg-red-50 hover:text-red-500 transition-all border border-transparent hover:border-red-100"
              >
                <X className="h-6 w-6" />
              </Button>
            </div>
            
            {/* Form Content */}
            <form action={handleSubmit} className="p-8 md:p-10 space-y-8 max-h-[70vh] overflow-y-auto custom-scrollbar">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Affiliated University</label>
                  <select 
                    name="universityId" 
                    required 
                    defaultValue={course?.universityId?._id || course?.universityId}
                    className="flex h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-lg font-semibold focus:ring-4 focus:ring-primary/10 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="">Choose Institution...</option>
                    {universities.map(u => (
                      <option key={u.id} value={u.id}>{u.name}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Course Title</label>
                  <Input name="name" required defaultValue={course?.name} placeholder="e.g. Master of Business Administration" className="h-14 rounded-2xl border-slate-200 font-semibold" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Internal Code</label>
                  <Input name="code" defaultValue={course?.code} placeholder="e.g. MBA-2024" className="h-14 rounded-2xl border-slate-200" />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Academic Level</label>
                  <select 
                    name="level" 
                    required 
                    defaultValue={course?.level || "UG"}
                    className="flex h-14 w-full rounded-2xl border border-slate-200 bg-white px-4 py-2 text-lg font-semibold focus:ring-4 focus:ring-primary/10 outline-none transition-all appearance-none cursor-pointer"
                  >
                    <option value="UG">Undergraduate (UG)</option>
                    <option value="PG">Postgraduate (PG)</option>
                    <option value="Diploma">Diploma</option>
                    <option value="Certificate">Certificate</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Course Tenure (Months)</label>
                  <Input name="durationMonths" type="number" required defaultValue={course?.durationMonths || 36} className="h-14 rounded-2xl border-slate-200 font-bold" />
                </div>

                <div className="space-y-2 md:col-span-2">
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Tuition Fees (INR)</label>
                  <div className="relative">
                    <span className="absolute left-4 top-1/2 -translate-y-1/2 font-black text-slate-400 text-xl">₹</span>
                    <Input name="fees" type="number" required defaultValue={course?.fees || 0} className="h-14 rounded-2xl border-slate-200 pl-10 text-2xl font-black text-primary" />
                  </div>
                </div>

                <div className="md:col-span-2 space-y-4">
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Marketing Assets (PDF)</label>
                  <div className="flex flex-col md:flex-row items-center gap-8 p-6 rounded-[2rem] bg-orange-50/50 border-2 border-dashed border-orange-200 hover:border-orange-400 transition-colors group">
                    <div className="h-20 w-20 rounded-2xl bg-white shadow-lg flex items-center justify-center shrink-0 group-hover:rotate-12 transition-transform">
                      <FileText className={`h-10 w-10 ${brochureUrl ? "text-orange-600" : "text-orange-200"}`} />
                    </div>
                    <div className="flex-1 space-y-3 w-full text-center md:text-left">
                      <div className="relative">
                        <Input 
                          type="file" 
                          accept="application/pdf" 
                          onChange={handleFileUpload} 
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                        <Button type="button" variant="outline" className="w-full h-12 rounded-xl border-orange-200 text-orange-700 font-bold hover:bg-orange-100 transition-colors">
                          {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                          {brochureUrl ? "Replace Brochure" : "Upload Brochure"}
                        </Button>
                      </div>
                      {brochureUrl && (
                        <p className="text-[11px] text-green-600 font-black uppercase tracking-widest flex items-center justify-center md:justify-start gap-2">
                          <Plus className="h-3 w-3 bg-green-500 text-white rounded-full p-0.5" /> File Ready
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Entry Requirements</label>
                  <textarea 
                    name="eligibility" 
                    defaultValue={course?.eligibility}
                    className="flex min-h-[120px] w-full rounded-[1.5rem] border border-slate-200 bg-white px-4 py-4 text-sm font-medium focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none"
                    placeholder="e.g. 50% in Class 12th with Mathematics..."
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-4 pt-6 pb-2 sticky bottom-0 bg-white">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setOpen(false)} 
                  className="flex-1 rounded-2xl h-16 border-slate-200 text-slate-600 font-bold text-lg hover:bg-slate-50 transition-all"
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || uploading} 
                  className="flex-[2] rounded-2xl h-16 shadow-[0_20px_40px_-10px_rgba(var(--primary),0.3)] hover:shadow-[0_25px_50px_-12px_rgba(var(--primary),0.5)] transition-all font-bold text-lg bg-primary"
                >
                  {loading ? <Loader2 className="h-6 w-6 animate-spin text-white" /> : (course ? "Save Changes" : "Create Program")}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  return (
    <>
      <Button 
        onClick={() => setOpen(true)} 
        variant={course ? "ghost" : "default"}
        size={course ? "icon" : "default"}
        className={course ? "h-9 w-9 rounded-full text-slate-400 hover:text-primary hover:bg-primary/10 shadow-none border-none" : "rounded-full h-12 px-6 shadow-xl shadow-primary/20 hover:scale-105 transition-transform font-bold"}
      >
        {course ? <Edit2 className="h-5 w-5" /> : <Plus className="mr-2 h-5 w-5" />}
        {!course && "Add Course"}
      </Button>

      {mounted && createPortal(modalContent, document.body)}
    </>
  );
}
