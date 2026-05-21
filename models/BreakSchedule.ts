import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const BREAK_TYPES = ["lunch", "tea", "meeting", "custom"] as const;

const BreakScheduleSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: BREAK_TYPES, default: "custom" },
    startTime: { type: String, required: true }, // HH:mm
    endTime: { type: String, required: true },
    daysOfWeek: [{ type: Number, min: 0, max: 6 }], // 0=Sun
    active: { type: Boolean, default: true },
    notifyUsers: { type: Boolean, default: true },
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export type BreakScheduleDoc = InferSchemaType<typeof BreakScheduleSchema> & { _id: string };
export const BreakSchedule: Model<BreakScheduleDoc> =
  (models.BreakSchedule as Model<BreakScheduleDoc>) ||
  model<BreakScheduleDoc>("BreakSchedule", BreakScheduleSchema);
