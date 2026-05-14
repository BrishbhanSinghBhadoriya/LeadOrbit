import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Course } from "@/models";
import { requireUser, requirePermission } from "@/lib/auth";
import { courseSchema } from "@/lib/validators";

export async function GET(req: Request) {
  await requireUser();
  await connectDB();
  const { searchParams } = new URL(req.url);
  const universityId = searchParams.get("universityId") ?? undefined;
  const filter: Record<string, unknown> = { active: true };
  if (universityId) filter.universityId = universityId;
  const items = await Course.find(filter).sort({ name: 1 }).lean();
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  await requirePermission("courses.manage");
  const data = courseSchema.parse(await req.json());
  await connectDB();
  const c = await Course.create(data);
  return NextResponse.json({ id: c._id }, { status: 201 });
}
