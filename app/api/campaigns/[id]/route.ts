import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Campaign } from "@/models";
import { requireUser } from "@/lib/auth";

export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  await requireUser();
  await connectDB();
  const body = await req.json();
  const doc = await Campaign.findByIdAndUpdate(
    params.id,
    { $set: body },
    { new: true }
  );
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(doc);
}

export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  await requireUser();
  await connectDB();
  await Campaign.findByIdAndDelete(params.id);
  return NextResponse.json({ ok: true });
}
