import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const CourseSchema = new Schema(
  {
    name: { type: String, required: true, index: true },
    code: String,
    level: { type: String, enum: ["UG","PG","Diploma","Certificate"], required: true, index: true },
    durationMonths: { type: Number, required: true },
    fees: { type: Number, required: true },
    eligibility: String,
    brochureUrl: String,
    placementInfo: String,
    specializations: [String],
    universityId: { type: Schema.Types.ObjectId, ref: "University", required: true, index: true },
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

CourseSchema.index({ universityId: 1, level: 1, active: 1 });

export type CourseDoc = InferSchemaType<typeof CourseSchema> & { _id: string };
export const Course: Model<CourseDoc> =
  (models.Course as Model<CourseDoc>) || model<CourseDoc>("Course", CourseSchema);
