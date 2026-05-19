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
      <Button onClick={() => setOpen(true)} className="gap-2">
        <Plus className="h-4 w-4" />
        Add Lead
      </Button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="p-6 border-b">
          <h2 className="text-xl font-bold">Add New Lead</h2>
        </div>
        <form action={handleSubmit} className="p-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Full Name</label>
            <Input name="name" required placeholder="Student Name" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Phone Number</label>
            <Input name="phone" required placeholder="+91..." />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Email Address</label>
            <Input name="email" type="email" placeholder="email@example.com" />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Source</label>
            <select name="source" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
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
            <div className="space-y-2">
              <label className="text-sm font-medium">Pipeline</label>
              <select name="pipelineId" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">No Pipeline</option>
                {pipelines.map(p => (
                  <option key={p.id} value={p.id}>{p.name}</option>
                ))}
              </select>
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">University</label>
              <select name="universityId" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Select University</option>
                {universities.map(u => (
                  <option key={u.id} value={u.id}>{u.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Course</label>
              <select name="courseId" className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm">
                <option value="">Select Course</option>
                {courses.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <Button type="button" variant="outline" onClick={() => setOpen(false)} className="flex-1">
              Cancel
            </Button>
            <Button type="submit" disabled={loading} className="flex-1">
              {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Lead"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
