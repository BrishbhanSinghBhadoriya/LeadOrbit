import { v2 as cloudinary } from "cloudinary";

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
  api_key: process.env.CLOUDINARY_API_KEY?.trim(),
  api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
  secure: true,
});

export async function uploadToCloudinary(buffer: Buffer, folder = "edu-crm") {
  return new Promise<{ url: string; publicId: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, resource_type: "auto" },
      (err, res) => {
        if (err || !res) return reject(err);
        resolve({ url: res.secure_url, publicId: res.public_id });
      }
    );
    stream.end(buffer);
  });
}

export const deleteFromCloudinary = (publicId: string) =>
  cloudinary.uploader.destroy(publicId);
