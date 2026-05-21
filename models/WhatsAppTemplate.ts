import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const TEMPLATE_TYPES = [
  "admission_followup",
  "fee_reminder",
  "welcome",
  "payment_confirmation",
  "registration_reminder",
  "custom",
] as const;

const WhatsAppTemplateSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: TEMPLATE_TYPES, default: "custom" },
    body: { type: String, required: true },
    variables: [{ type: String }],
    createdBy: { type: Schema.Types.ObjectId, ref: "User" },
    active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export type WhatsAppTemplateDoc = InferSchemaType<typeof WhatsAppTemplateSchema> & { _id: string };
export const WhatsAppTemplate: Model<WhatsAppTemplateDoc> =
  (models.WhatsAppTemplate as Model<WhatsAppTemplateDoc>) ||
  model<WhatsAppTemplateDoc>("WhatsAppTemplate", WhatsAppTemplateSchema);
