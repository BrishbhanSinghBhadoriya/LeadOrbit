"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from "recharts";

interface StageItem { key: string; label: string; count: number; percent: number; }
interface LeadsByStageCardProps { data: { total: number; stages: StageItem[] }; }

const COLORS = ["#6366f1","#3b82f6","#10b981","#f59e0b","#8b5cf6","#ec4899","#14b8a6","#ef4444","#64748b","#0ea5e9"];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-slate-700 mb-0.5">{label}</p>
      <p className="text-slate-900 font-bold">{payload[0].value} leads</p>
    </div>
  );
};

export function LeadsByStageCard({ data }: LeadsByStageCardProps) {
  const chartData = data.stages.filter((s) => s.key !== "total").slice(0, 8);

  return (
    <Card className="border border-slate-100 shadow-sm bg-white overflow-hidden">
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-slate-100">
        <div>
          <CardTitle className="text-sm font-bold text-slate-900">Leads by Stage</CardTitle>
          <p className="text-xs text-slate-400">{data.total} total leads in pipeline</p>
        </div>
        <Button variant="outline" size="sm" asChild className="h-7 rounded-lg text-xs font-semibold px-2.5">
          <Link href="/reports/leads">Full Report</Link>
        </Button>
      </CardHeader>

      <CardContent className="p-4">
        {/* Chart */}
        <div className="h-[180px] sm:h-[200px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} layout="vertical" margin={{ left: 0, right: 10, top: 0, bottom: 0 }}>
              <XAxis type="number" hide />
              <YAxis
                type="category" dataKey="label"
                width={105}
                tick={{ fontSize: 10, fill: "#64748b", fontWeight: 500 }}
                axisLine={false} tickLine={false}
              />
              <Tooltip content={<CustomTooltip />} cursor={{ fill: "rgba(241,245,249,0.6)" }} />
              <Bar dataKey="count" radius={[0, 5, 5, 0]} barSize={13}>
                {chartData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Stage tiles — responsive grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-5 xl:grid-cols-10 gap-2 mt-4">
          {data.stages.map((s, i) => (
            <div key={s.key} className="rounded-lg border border-slate-100 bg-slate-50 px-2 py-2 text-center">
              <p className="text-[9px] font-bold text-slate-500 uppercase truncate leading-tight">{s.label}</p>
              <p className="text-base font-bold text-slate-900 leading-tight mt-0.5">{s.count}</p>
              <p className="text-[10px] font-semibold" style={{ color: COLORS[i % COLORS.length] }}>{s.percent}%</p>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
