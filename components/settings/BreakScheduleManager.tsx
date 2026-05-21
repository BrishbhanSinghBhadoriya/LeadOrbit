"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Coffee, Plus } from "lucide-react";

const BREAK_TYPES = [
  { id: "lunch", label: "Lunch Break" },
  { id: "tea", label: "Tea Break" },
  { id: "meeting", label: "Meeting Break" },
  { id: "custom", label: "Custom Slot" },
];

export function BreakScheduleManager() {
  const [breaks, setBreaks] = useState<any[]>([]);
  const [form, setForm] = useState({
    name: "Lunch Break",
    type: "lunch",
    startTime: "13:00",
    endTime: "14:00",
    notifyUsers: true,
  });

  const load = () => fetch("/api/breaks").then((r) => r.json()).then(setBreaks);
  useEffect(() => {
    load();
  }, []);

  const add = async () => {
    await fetch("/api/breaks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...form, daysOfWeek: [1, 2, 3, 4, 5, 6], active: true }),
    });
    load();
  };

  return (
    <Card className="border-none shadow-xl">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-lg">
          <Coffee className="h-5 w-5 text-amber-600" />
          Break Time Management
        </CardTitle>
        <p className="text-xs text-slate-500">Users get popup reminder during official break slots</p>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid sm:grid-cols-2 gap-3">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Break name" />
          <select
            className="h-11 border rounded-xl px-3 text-sm"
            value={form.type}
            onChange={(e) => setForm({ ...form, type: e.target.value })}
          >
            {BREAK_TYPES.map((t) => (
              <option key={t.id} value={t.id}>{t.label}</option>
            ))}
          </select>
          <Input type="time" value={form.startTime} onChange={(e) => setForm({ ...form, startTime: e.target.value })} />
          <Input type="time" value={form.endTime} onChange={(e) => setForm({ ...form, endTime: e.target.value })} />
        </div>
        <label className="flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.notifyUsers}
            onChange={(e) => setForm({ ...form, notifyUsers: e.target.checked })}
          />
          Notify all users (popup + alert)
        </label>
        <Button onClick={add} className="rounded-xl">
          <Plus className="h-4 w-4 mr-2" />
          Add Break Slot
        </Button>
        <div className="space-y-2 pt-4 border-t">
          {breaks.map((b: any) => (
            <div key={b._id} className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border">
              <div>
                <p className="font-semibold text-sm">{b.name}</p>
                <p className="text-xs text-slate-500 capitalize">
                  {b.type} • {b.startTime} – {b.endTime}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
