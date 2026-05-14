import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { University } from "@/models";
import { requireUser, requirePermission } from "@/lib/auth";
import { universitySchema } from "@/lib/validators";

export async function GET() {
  await requireUser();
  await connectDB();
  const items = await University.find({ active: true }).sort({ name: 1 }).lean();
  return NextResponse.json({ items });
}

export async function POST(req: Request) {
  await requirePermission("universities.manage");
  const data = universitySchema.parse(await req.json());
  await connectDB();
  const uni = await University.create(data);
  return NextResponse.json({ id: uni._id }, { status: 201 });
}
