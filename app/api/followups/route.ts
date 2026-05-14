import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { FollowUp } from "@/models";
import { requireUser } from "@/lib/auth";
import { followUpSchema } from "@/lib/validators";

export async function GET(req: Request) {
  const user = await requireUser();
  await connectDB();
  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status") ?? "pending";
  const items = await FollowUp.find({ assignedTo: user.sub, status })
    .sort({ scheduledAt: 1 })
    .populate("leadId", "name phone status")
    .lean();
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  const user = await requireUser();
  const data = followUpSchema.parse(await req.json());
  await connectDB();
  const f = await FollowUp.create({ ...data, assignedTo: user.sub, createdBy: user.sub });
  return NextResponse.json({ id: f._id }, { status: 201 });
}
