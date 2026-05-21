"use client";

import { useEffect, useState } from "react";
import { Coffee, X } from "lucide-react";
import { Button } from "@/components/ui/button";

export function BreakAlertProvider({ children }: { children: React.ReactNode }) {
  const [alert, setAlert] = useState<{ name: string; endTime: string } | null>(null);

  useEffect(() => {
    const check = async () => {
      try {
        const res = await fetch("/api/breaks/active");
        if (!res.ok) return;
        const data = await res.json();
        if (data.active) setAlert({ name: data.name, endTime: data.endTime });
      } catch {
        /* ignore */
      }
    };
    check();
    const id = setInterval(check, 60_000);
    return () => clearInterval(id);
  }, []);

  return (
    <>
      {children}
      {alert && (
        <div className="fixed bottom-6 right-6 z-[200] max-w-sm animate-in slide-in-from-bottom-4">
          <div className="bg-amber-500 text-white rounded-2xl shadow-2xl p-5 border-2 border-amber-400">
            <div className="flex items-start justify-between gap-3">
              <div className="flex gap-3">
                <Coffee className="h-6 w-6 shrink-0 animate-pulse" />
                <div>
                  <p className="font-bold text-sm">Break Time Reminder</p>
                  <p className="text-xs mt-1 opacity-90">
                    {alert.name} — until {alert.endTime}
                  </p>
                </div>
              </div>
              <button onClick={() => setAlert(null)} className="p-1 hover:bg-white/20 rounded-lg">
                <X className="h-4 w-4" />
              </button>
            </div>
            <Button
              size="sm"
              variant="secondary"
              className="w-full mt-3 h-8 text-xs font-bold"
              onClick={() => setAlert(null)}
            >
              Acknowledge
            </Button>
          </div>
        </div>
      )}
    </>
  );
}
