import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { BreakSchedule } from "@/models";
import { requireUser, requirePermission } from "@/lib/auth";

export async function GET() {
  await connectDB();
  const breaks = await BreakSchedule.find({ active: true }).sort({ startTime: 1 });
  return NextResponse.json(breaks);
}

export async function POST(req: Request) {
  await requirePermission("settings.manage");
  await connectDB();
  const body = await req.json();
  const user = await requireUser();
  const doc = await BreakSchedule.create({ ...body, createdBy: user.sub });
  return NextResponse.json(doc);
}
