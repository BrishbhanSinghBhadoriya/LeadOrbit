"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function NewTemplatePage() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    type: "custom",
    body: "Hi {{student_name}}, thank you for your interest in {{course_name}}.",
    variables: "{{student_name}}, {{course_name}}",
  });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    await fetch("/api/templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        ...form,
        variables: form.variables.split(",").map((v) => v.trim()).filter(Boolean),
      }),
    });
    router.push("/templates");
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <h1 className="text-2xl font-bold">New Template</h1>
      <Card>
        <CardContent className="pt-6">
          <form onSubmit={submit} className="space-y-4">
            <Input placeholder="Template name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            <select className="w-full h-11 border rounded-xl px-3" value={form.type} onChange={(e) => setForm({ ...form, type: e.target.value })}>
              <option value="welcome">Welcome</option>
              <option value="admission_followup">Admission Follow-up</option>
              <option value="fee_reminder">Fee Reminder</option>
              <option value="payment_confirmation">Payment Confirmation</option>
              <option value="registration_reminder">Registration Reminder</option>
              <option value="custom">Custom</option>
            </select>
            <textarea className="w-full min-h-[140px] border rounded-xl p-3 text-sm font-mono" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} />
            <Input placeholder="Variables: {{student_name}}, {{course_name}}" value={form.variables} onChange={(e) => setForm({ ...form, variables: e.target.value })} />
            <div className="flex gap-3">
              <Button type="button" variant="outline" asChild className="flex-1"><Link href="/templates">Cancel</Link></Button>
              <Button type="submit" className="flex-1">Save Template</Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
