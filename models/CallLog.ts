import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const CallLogSchema = new Schema(
  {
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true, index: true },
    by: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },
    direction: { type: String, enum: ["outbound","inbound"], required: true },
    status: { type: String, enum: ["completed","missed","busy","no_answer","failed"], required: true },
    durationSec: { type: Number, default: 0 },
    recordingUrl: String,
    provider: { type: String, enum: ["twilio","exotel","knowlarity","manual"], default: "manual" },
    providerSid: String,
    notes: String,
    startedAt: Date,
  },
  { timestamps: true }
);

CallLogSchema.index({ leadId: 1, createdAt: -1 });

export type CallLogDoc = InferSchemaType<typeof CallLogSchema> & { _id: string };
export const CallLog: Model<CallLogDoc> =
  (models.CallLog as Model<CallLogDoc>) ||
  model<CallLogDoc>("CallLog", CallLogSchema);
