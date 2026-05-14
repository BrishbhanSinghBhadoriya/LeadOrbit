import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const DocumentSchema = new Schema(
  {
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true, index: true },
    type: { type: String, enum: ["aadhaar","marksheet_10","marksheet_12","degree","signature","photo","other"], required: true },
    url: { type: String, required: true },
    publicId: String, // Cloudinary
    sizeBytes: Number,
    mime: String,
    verified: { type: Boolean, default: false, index: true },
    verifiedBy: { type: Schema.Types.ObjectId, ref: "User" },
    uploadedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export type DocumentDoc = InferSchemaType<typeof DocumentSchema> & { _id: string };
export const DocumentModel: Model<DocumentDoc> =
  (models.Document as Model<DocumentDoc>) ||
  model<DocumentDoc>("Document", DocumentSchema);
