"use server";

import { uploadToCloudinary } from "@/lib/cloudinary";
import { requireUser } from "@/lib/auth";

export async function uploadFile(formData: FormData) {
  try {
    await requireUser();
    const file = formData.get("file") as File;
    if (!file) throw new Error("No file provided");

    // Enforce 5MB limit (5 * 1024 * 1024 bytes)
    const MAX_SIZE = 5 * 1024 * 1024;
    if (file.size > MAX_SIZE) {
      throw new Error("File size exceeds 5MB limit. Please upload a smaller file.");
    }

    if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY || !process.env.CLOUDINARY_API_SECRET) {
      console.error("Cloudinary environment variables are missing");
      throw new Error("Cloudinary configuration is missing. Please check environment variables.");
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const folder = file.type.includes("pdf") ? "brochures" : "logos";
    
    console.log(`Uploading ${file.name} to Cloudinary folder: ${folder}`);
    const result = await uploadToCloudinary(buffer, folder);
    console.log("Upload successful:", result.url);
    return result.url;
  } catch (error: any) {
    console.error("Error in uploadFile action:", error);
    throw new Error(error.message || "Failed to upload file");
  }
}
