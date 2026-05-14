import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const UniversitySchema = new Schema(
  {
    name: { type: String, required: true, unique: true, index: true },
    shortName: String,
    city: String,
    state: String,
    website: String,
    logoUrl: String,
    description: String,
    accreditation: [String], // UGC, NAAC A++, AICTE, etc.
    rating: { type: Number, min: 0, max: 5 },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

export type UniversityDoc = InferSchemaType<typeof UniversitySchema> & { _id: string };
export const University: Model<UniversityDoc> =
  (models.University as Model<UniversityDoc>) ||
  model<UniversityDoc>("University", UniversitySchema);
