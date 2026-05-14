"use server";

import { uploadToCloudinary } from "@/lib/cloudinary";
import { requireUser } from "@/lib/auth";

export async function uploadFile(formData: FormData) {
  await requireUser();
  const file = formData.get("file") as File;
  if (!file) throw new Error("No file provided");

  const buffer = Buffer.from(await file.arrayBuffer());
  const folder = file.type.includes("pdf") ? "brochures" : "logos";
  
  const result = await uploadToCloudinary(buffer, folder);
  return result.url;
}
