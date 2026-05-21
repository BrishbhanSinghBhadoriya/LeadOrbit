import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Campaign } from "@/models";
import { requireUser } from "@/lib/auth";

type Ctx = { params: Promise<{ id: string }> };

export async function PATCH(req: Request, { params }: Ctx) {
  await requireUser();
  await connectDB();
  const { id } = await params;
  const body = await req.json();
  const doc = await Campaign.findByIdAndUpdate(id, { $set: body }, { new: true });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(doc);
}

export async function DELETE(_req: Request, { params }: Ctx) {
  await requireUser();
  await connectDB();
  const { id } = await params;
  await Campaign.findByIdAndDelete(id);
  return NextResponse.json({ ok: true });
}
