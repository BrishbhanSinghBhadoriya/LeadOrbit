"use client";

import { useState, useEffect } from "react";
import { Plus, Loader2, X, Upload, Edit2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { createUniversity, updateUniversity } from "@/actions/universities";
import { uploadFile } from "@/actions/uploads";
import { motion, AnimatePresence } from "framer-motion";
import { createPortal } from "react-dom";

interface UniversityFormProps {
  university?: any;
  onSuccess?: () => void;
}

export function UniversityForm({ university, onSuccess }: UniversityFormProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [logoUrl, setLogoUrl] = useState(university?.logoUrl || "");
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (open) {
      document.body.style.overflow = "hidden";
      setError(null);
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

    if (file.size > 5 * 1024 * 1024) {
      setError("File size too large. Maximum limit is 5MB.");
      return;
    }

    setUploading(true);
    setError(null);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const url = await uploadFile(formData);
      setLogoUrl(url);
    } catch (err: any) {
      console.error("Upload failed", err);
      setError(err.message || "Upload failed. Please try again.");
    } finally {
      setUploading(false);
    }
  }

  async function handleSubmit(formData: FormData) {
    setLoading(true);
    setError(null);
    try {
      const data = {
        name: formData.get("name") as string,
        shortName: formData.get("shortName") as string,
        city: formData.get("city") as string,
        state: formData.get("state") as string,
        website: formData.get("website") as string,
        description: formData.get("description") as string,
        logoUrl,
      };

      if (university) {
        await updateUniversity(university._id, data);
      } else {
        await createUniversity(data);
      }
      setOpen(false);
      onSuccess?.();
    } catch (err: any) {
      console.error("Failed to save university", err);
      setError(err.message || "Failed to save university. Please check all fields.");
    } finally {
      setLoading(false);
    }
  }

  const modalContent = (
    <AnimatePresence>
      {open && (
        <div className="fixed inset-0 flex items-center justify-center z-[9999] p-4 md:p-8">
          {/* Backdrop with Blur */}
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
            <div className="px-8 py-8 border-b flex justify-between items-center bg-gradient-to-r from-slate-50 to-white">
              <div>
                <h2 className="text-3xl font-black text-slate-900 tracking-tight">
                  {university ? "Edit University" : "New Institution"}
                </h2>
                <p className="text-slate-500 mt-1 font-medium italic">Update your partner database.</p>
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
              {error && (
                <div className="p-4 bg-red-50 border border-red-100 rounded-2xl flex items-center gap-3 text-red-600 text-sm font-bold animate-in fade-in slide-in-from-top-2">
                  <X className="h-5 w-5 shrink-0" />
                  {error}
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2 md:col-span-2">
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Full University Name</label>
                  <Input name="name" required defaultValue={university?.name} placeholder="e.g. University of Oxford" className="h-14 rounded-2xl border-slate-200 focus:ring-4 focus:ring-primary/10 transition-all text-lg font-semibold" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Acronym / Short Name</label>
                  <Input name="shortName" defaultValue={university?.shortName} placeholder="e.g. UOX" className="h-14 rounded-2xl border-slate-200" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Official Website</label>
                  <Input name="website" type="url" defaultValue={university?.website} placeholder="https://..." className="h-14 rounded-2xl border-slate-200" />
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">City Location</label>
                  <Input name="city" defaultValue={university?.city} placeholder="e.g. London" className="h-14 rounded-2xl border-slate-200" />
                </div>
                
                <div className="space-y-2">
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">State / Region</label>
                  <Input name="state" defaultValue={university?.state} placeholder="e.g. England" className="h-14 rounded-2xl border-slate-200" />
                </div>
                
                <div className="md:col-span-2 space-y-4">
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Brand Identity (Logo)</label>
                  <div className="flex flex-col md:flex-row items-center gap-8 p-6 rounded-[2rem] bg-slate-50 border-2 border-dashed border-slate-200 hover:border-primary/30 transition-colors group">
                    <div className="h-28 w-28 rounded-3xl bg-white shadow-xl border border-slate-100 flex items-center justify-center overflow-hidden shrink-0 group-hover:scale-105 transition-transform">
                      {logoUrl ? (
                        <img src={logoUrl} alt="Logo" className="h-full w-full object-contain p-2" />
                      ) : (
                        <Upload className="h-10 w-10 text-slate-200" />
                      )}
                    </div>
                    <div className="flex-1 space-y-3 w-full text-center md:text-left">
                      <div className="relative">
                        <Input 
                          type="file" 
                          accept="image/*" 
                          onChange={handleFileUpload} 
                          className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                        <Button type="button" variant="outline" className="w-full h-12 rounded-xl border-slate-300 font-bold">
                          {uploading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
                          Choose Brand Logo
                        </Button>
                      </div>
                      <p className="text-[10px] text-slate-400 uppercase font-bold tracking-widest">Recommended: Transparent PNG, max 2MB</p>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 space-y-2">
                  <label className="text-[11px] font-black uppercase text-slate-400 tracking-[0.2em] ml-1">Institution Bio</label>
                  <textarea 
                    name="description" 
                    defaultValue={university?.description}
                    className="flex min-h-[120px] w-full rounded-[1.5rem] border border-slate-200 bg-white px-4 py-4 text-sm font-medium focus:ring-4 focus:ring-primary/10 outline-none transition-all resize-none"
                    placeholder="Brief history or key highlights..."
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
                  Discard
                </Button>
                <Button 
                  type="submit" 
                  disabled={loading || uploading} 
                  className="flex-[2] rounded-2xl h-16 shadow-[0_20px_40px_-10px_rgba(var(--primary),0.3)] hover:shadow-[0_25px_50px_-12px_rgba(var(--primary),0.5)] transition-all font-bold text-lg bg-primary"
                >
                  {loading ? <Loader2 className="h-6 w-6 animate-spin text-white" /> : (university ? "Update Details" : "Finalize University")}
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
        variant={university ? "ghost" : "default"}
        size={university ? "icon" : "default"}
        className={university ? "h-10 w-10 rounded-full text-slate-400 hover:text-primary hover:bg-primary/10 shadow-none border-none" : "rounded-full h-12 px-6 shadow-xl shadow-primary/20 hover:scale-105 transition-transform font-bold"}
      >
        {university ? <Edit2 className="h-5 w-5" /> : <Plus className="mr-2 h-5 w-5" />}
        {!university && "Add University"}
      </Button>

      {mounted && createPortal(modalContent, document.body)}
    </>
  );
}
