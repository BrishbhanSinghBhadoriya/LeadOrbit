import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";

const PaymentSchema = new Schema(
  {
    leadId: { type: Schema.Types.ObjectId, ref: "Lead", required: true, index: true },
    courseId: { type: Schema.Types.ObjectId, ref: "Course" },
    universityId: { type: Schema.Types.ObjectId, ref: "University" },
    amount: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    status: { type: String, enum: ["pending","paid","failed","refunded"], default: "pending", index: true },
    method: String, // upi, card, netbanking, ...
    transactionId: String,
    receiptUrl: String,
    paidAt: Date,
    collectedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export type PaymentDoc = InferSchemaType<typeof PaymentSchema> & { _id: string };
export const Payment: Model<PaymentDoc> =
  (models.Payment as Model<PaymentDoc>) ||
  model<PaymentDoc>("Payment", PaymentSchema);
