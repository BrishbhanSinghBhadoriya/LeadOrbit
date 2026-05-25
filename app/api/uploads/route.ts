import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { DocumentModel } from "@/models";
import { requireUser } from "@/lib/auth";

export async function POST(req: Request) {
  const user = await requireUser();
  const form = await req.formData();
  const file = form.get("file") as File | null;
  const leadId = String(form.get("leadId") ?? "");
  const type = String(form.get("type") ?? "other");
  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (file.size > 5 * 1024 * 1024) return NextResponse.json({ error: "Too large. Max limit is 5MB" }, { status: 413 });

  const buffer = Buffer.from(await file.arrayBuffer());
  const { url, publicId } = await uploadToCloudinary(buffer, `edu-crm/leads/${leadId}`);
  await connectDB();
  const doc = await DocumentModel.create({
    leadId, type, url, publicId,
    sizeBytes: file.size, mime: file.type,
    uploadedBy: user.sub,
  });
  return NextResponse.json({ id: doc._id, url });
}
