"use client";

import Link from "next/link";
import { Phone, PhoneCall, PhoneOff, Users, Target, CalendarClock, FileDown } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";

// 6 distinct colors — one per metric
const COLORS = [
  "#6366f1", // Total Leads   — indigo
  "#3b82f6", // Attempted     — blue
  "#10b981", // Connected     — emerald
  "#ef4444", // Not Connected — red
  "#f59e0b", // Follow-ups    — amber
  "#8b5cf6", // Conversions   — violet
];

interface CallOverviewCardProps {
  stats: {
    totalLeads: number;
    attemptedCalls: number;
    connectedCalls: number;
    notConnectedCalls: number;
    followUps: number;
    conversionCount: number;
    attemptRate: number;
    connectRate: number;
    conversionRate: number;
  };
}

const CustomTooltip = ({ active, payload }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-slate-100 rounded-lg shadow-lg px-3 py-2 text-xs">
      <p className="font-semibold text-slate-700">{payload[0].name}</p>
      <p className="text-slate-900 font-bold">{payload[0].value}</p>
    </div>
  );
};

export function CallOverviewCard({ stats }: CallOverviewCardProps) {
  // All 6 metrics shown in the donut — filter out zeros so chart stays clean
  const allData = [
    { name: "Total Leads",   value: stats.totalLeads,        colorIdx: 0 },
    { name: "Attempted",     value: stats.attemptedCalls,    colorIdx: 1 },
    { name: "Connected",     value: stats.connectedCalls,    colorIdx: 2 },
    { name: "Not Connected", value: stats.notConnectedCalls, colorIdx: 3 },
    { name: "Follow-ups",    value: stats.followUps,         colorIdx: 4 },
    { name: "Conversions",   value: stats.conversionCount,   colorIdx: 5 },
  ];

  // Show all in chart (even zeros show as tiny slice so legend stays consistent)
  // But filter true zeros to avoid ugly 0-value slices
  const chartData = allData.filter((d) => d.value > 0);

  const metrics = [
    { label: "Total Leads",   value: stats.totalLeads,        icon: Users,         color: "text-indigo-600",  bg: "bg-indigo-50",   colorIdx: 0 },
    { label: "Attempted",     value: stats.attemptedCalls,    icon: PhoneCall,     color: "text-blue-600",    bg: "bg-blue-50",     colorIdx: 1, pct: stats.attemptRate,    bar: "bg-blue-500" },
    { label: "Connected",     value: stats.connectedCalls,    icon: Phone,         color: "text-emerald-600", bg: "bg-emerald-50",  colorIdx: 2, pct: stats.connectRate,    bar: "bg-emerald-500" },
    { label: "Not Connected", value: stats.notConnectedCalls, icon: PhoneOff,      color: "text-red-500",     bg: "bg-red-50",      colorIdx: 3 },
    { label: "Follow-ups",    value: stats.followUps,         icon: CalendarClock, color: "text-amber-600",   bg: "bg-amber-50",    colorIdx: 4 },
    { label: "Conversions",   value: stats.conversionCount,   icon: Target,        color: "text-violet-600",  bg: "bg-violet-50",   colorIdx: 5, pct: stats.conversionRate, bar: "bg-violet-500" },
  ];

  return (
    <Card className="border border-slate-100 shadow-sm bg-white overflow-hidden h-full">
      <CardHeader className="flex flex-row items-center justify-between py-3 px-4 border-b border-slate-100">
        <CardTitle className="text-sm font-bold text-slate-900">Call Overview</CardTitle>
        <Button variant="outline" size="sm" asChild className="h-7 rounded-lg text-xs font-semibold px-2.5">
          <Link href="/reports/calls" className="flex items-center gap-1">
            <FileDown className="h-3 w-3 shrink-0" />
            <span>Report</span>
          </Link>
        </Button>
      </CardHeader>

      <CardContent className="p-4 flex flex-col gap-4">
        {/* Donut chart + legend */}
        <div className="flex items-center gap-4">

          {/* Donut with center label */}
          <div className="relative shrink-0 w-[130px] h-[130px] sm:w-[150px] sm:h-[150px]">
            {chartData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      innerRadius="42%"
                      outerRadius="65%"
                      paddingAngle={2}
                      dataKey="value"
                      strokeWidth={0}
                    >
                      {chartData.map((d) => (
                        <Cell key={d.name} fill={COLORS[d.colorIdx]} />
                      ))}
                    </Pie>
                    <Tooltip content={<CustomTooltip />} />
                  </PieChart>
                </ResponsiveContainer>
                {/* Center text */}
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-lg font-bold text-slate-900 leading-none">{stats.totalLeads}</p>
                  <p className="text-[9px] font-semibold text-slate-400 uppercase tracking-wide mt-0.5">Total</p>
                </div>
              </>
            ) : (
              <div className="h-full flex items-center justify-center text-slate-400 text-xs text-center">
                No data
              </div>
            )}
          </div>

          {/* Legend — all 6 items */}
          <div className="flex flex-col gap-1.5 flex-1 min-w-0">
            {allData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full shrink-0"
                  style={{ backgroundColor: COLORS[d.colorIdx] }}
                />
                <span className="text-[11px] text-slate-600 font-medium truncate">{d.name}</span>
                <span className="text-[11px] font-bold text-slate-900 ml-auto pl-1 shrink-0">{d.value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Metrics tiles grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {metrics.map((m) => (
            <div key={m.label} className="rounded-lg border border-slate-100 bg-slate-50 p-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                <div className={`h-5 w-5 rounded-md flex items-center justify-center shrink-0 ${m.bg}`}>
                  <m.icon className={`h-3 w-3 ${m.color}`} />
                </div>
                <span className="text-[9px] font-bold text-slate-500 uppercase tracking-wide leading-tight">{m.label}</span>
              </div>
              <p className="text-lg font-bold text-slate-900 leading-none">{m.value}</p>
              {m.pct !== undefined && (
                <>
                  <div className="mt-1.5 h-1 bg-slate-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${m.bar}`}
                      style={{ width: `${Math.min(100, m.pct)}%` }}
                    />
                  </div>
                  <p className="text-[9px] text-slate-400 mt-0.5">{m.pct}%</p>
                </>
              )}
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
