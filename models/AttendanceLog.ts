import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const AttendanceLogSchema = new Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    loginAt: { type: Date, required: true, index: true },
    logoutAt: Date,
    lastActiveAt: Date,
    workingMinutes: { type: Number, default: 0 },
    ip: String,
    device: String,
  },
  { timestamps: true }
);

AttendanceLogSchema.index({ userId: 1, loginAt: -1 });

export type AttendanceLogDoc = InferSchemaType<typeof AttendanceLogSchema> & { _id: string };
export const AttendanceLog: Model<AttendanceLogDoc> =
  (models.AttendanceLog as Model<AttendanceLogDoc>) ||
  model<AttendanceLogDoc>("AttendanceLog", AttendanceLogSchema);
