import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { BreakSchedule } from "@/models";

function timeToMinutes(t: string) {
  const [h, m] = t.split(":").map(Number);
  return h * 60 + m;
}

export async function GET() {
  await connectDB();
  const now = new Date();
  const day = now.getDay();
  const mins = now.getHours() * 60 + now.getMinutes();

  const breaks = await BreakSchedule.find({ active: true, notifyUsers: true });
  for (const b of breaks) {
    if (b.daysOfWeek?.length && !b.daysOfWeek.includes(day)) continue;
    const start = timeToMinutes(b.startTime);
    const end = timeToMinutes(b.endTime);
    if (mins >= start && mins <= end) {
      return NextResponse.json({
        active: true,
        name: b.name,
        type: b.type,
        endTime: b.endTime,
      });
    }
  }
  return NextResponse.json({ active: false });
}
