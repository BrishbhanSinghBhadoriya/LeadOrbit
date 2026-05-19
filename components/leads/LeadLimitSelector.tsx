"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Check, ChevronDown, ListOrdered } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const LIMIT_OPTIONS = [
  { id: "50", name: "50" },
  { id: "100", name: "100" },
  { id: "500", name: "500" },
  { id: "1000", name: "1000" },
  { id: "all", name: "All" },
  { id: "custom", name: "Custom" },
];

export function LeadLimitSelector() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const currentLimit = searchParams.get("limit") || "50";
  
  const [customLimit, setCustomLimit] = useState("");
  const [showCustomLimit, setShowCustomLimit] = useState(false);

  const handleLimitChange = (val: string) => {
    if (val === "custom") {
      setShowCustomLimit(true);
      return;
    }

    setShowCustomLimit(false);
    const params = new URLSearchParams(searchParams.toString());
    if (val === "50") {
      params.delete("limit");
    } else {
      params.set("limit", val);
    }
    router.push(`/leads?${params.toString()}`);
  };

  const handleCustomSubmit = () => {
    if (customLimit) {
      const params = new URLSearchParams(searchParams.toString());
      params.set("limit", customLimit);
      router.push(`/leads?${params.toString()}`);
      setShowCustomLimit(false);
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="relative">
        <ListOrdered className="absolute left-2.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
        <select
          value={LIMIT_OPTIONS.some(o => o.id === currentLimit) ? currentLimit : "custom"}
          onChange={(e) => handleLimitChange(e.target.value)}
          className="h-8 pl-8 pr-7 text-[11px] font-bold bg-white border border-slate-200 rounded-full outline-none focus:ring-4 focus:ring-primary/5 transition-all appearance-none cursor-pointer text-slate-600"
        >
          {LIMIT_OPTIONS.map(opt => (
            <option key={opt.id} value={opt.id}>{opt.name}</option>
          ))}
        </select>
        <ChevronDown className="absolute right-2.5 top-1/2 -translate-y-1/2 h-3 w-3 text-slate-400 pointer-events-none" />
      </div>

      {showCustomLimit && (
        <div className="flex gap-1 animate-in slide-in-from-left-2 duration-200">
          <Input 
            placeholder="Qty" 
            type="number"
            value={customLimit}
            onChange={(e) => setCustomLimit(e.target.value)}
            className="w-16 h-8 text-[11px] px-2 rounded-lg"
          />
          <Button 
            size="icon" 
            className="h-8 w-8 rounded-lg"
            onClick={handleCustomSubmit}
          >
            <Check className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}
    </div>
  );
}
