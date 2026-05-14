import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Lead } from "@/models";
import { requireUser, requirePermission } from "@/lib/auth";
import { leadSchema } from "@/lib/validators";
import { emitToRoom } from "@/lib/socket-emit";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: Request, { params }: Ctx) {
  await requireUser();
  await connectDB();
  const { id } = await params;
  const lead = await Lead.findById(id)
    .populate("assignedTo", "name email role")
    .populate("courseId", "name level")
    .populate("universityId", "name")
    .lean();
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(lead);
}

export async function PATCH(req: Request, { params }: Ctx) {
  const user = await requirePermission("leads.update");
  const { id } = await params;
  const data = leadSchema.partial().parse(await req.json());
  await connectDB();
  const lead = await Lead.findByIdAndUpdate(
    id,
    {
      ...data,
      $push: {
        activities: {
          type: "update",
          by: user.sub,
          message: "Lead updated",
          meta: data,
        },
      },
    },
    { new: true }
  );
  if (!lead) return NextResponse.json({ error: "Not found" }, { status: 404 });
  emitToRoom("leads", "lead:updated", { id });
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: Ctx) {
  await requirePermission("leads.delete");
  const { id } = await params;
  await connectDB();
  await Lead.findByIdAndDelete(id);
  emitToRoom("leads", "lead:deleted", { id });
  return NextResponse.json({ ok: true });
}
