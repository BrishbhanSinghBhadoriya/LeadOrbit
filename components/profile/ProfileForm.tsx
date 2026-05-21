"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Save, Loader2 } from "lucide-react";

interface ProfileFormProps {
  userId: string;
  defaultValues: {
    name: string;
    email: string;
    phone: string;
    department: string;
    teamName: string;
  };
  isEditable: boolean;
}

export function ProfileForm({ userId, defaultValues, isEditable }: ProfileFormProps) {
  const [values, setValues] = useState(defaultValues);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (field: keyof typeof values, value: string) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setSaved(false);
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const res = await fetch(`/api/users/${userId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      setSaved(true);
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  const fields: {
    key: keyof typeof defaultValues;
    label: string;
    type: string;
    placeholder: string;
    editable: boolean;
  }[] = [
    { key: "name", label: "Full Name", type: "text", placeholder: "Enter your full name", editable: isEditable },
    { key: "email", label: "Email Address", type: "email", placeholder: "Enter email", editable: false },
    { key: "phone", label: "Phone Number", type: "tel", placeholder: "Enter phone number", editable: true },
    { key: "department", label: "Department", type: "text", placeholder: "e.g. Sales, HR, IT", editable: isEditable },
    { key: "teamName", label: "Team Name", type: "text", placeholder: "Enter team name", editable: isEditable },
  ];

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {fields.map((f) => (
          <div key={f.key} className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-600">{f.label}</label>
            <Input
              type={f.type}
              value={values[f.key]}
              onChange={(e) => handleChange(f.key, e.target.value)}
              disabled={!f.editable}
              placeholder={f.placeholder}
              className="h-9 text-sm disabled:bg-slate-50 disabled:text-slate-400 disabled:cursor-not-allowed"
            />
          </div>
        ))}
      </div>

      {error && (
        <p className="text-xs text-red-500 bg-red-50 border border-red-100 rounded-lg px-3 py-2">{error}</p>
      )}
      {saved && (
        <p className="text-xs text-emerald-600 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
          Profile updated successfully.
        </p>
      )}

      <div className="flex justify-end">
        <Button type="submit" disabled={loading} size="sm" className="h-8 px-4 text-xs font-semibold">
          {loading ? (
            <>
              <Loader2 className="h-3.5 w-3.5 mr-1.5 animate-spin" />
              Saving…
            </>
          ) : (
            <>
              <Save className="h-3.5 w-3.5 mr-1.5" />
              Save Changes
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
