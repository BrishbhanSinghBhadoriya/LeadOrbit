import { Schema, model, models, type InferSchemaType, type Model } from "mongoose";
import { ROLE_HIERARCHY } from "@/config/rbac";

const UserSchema = new Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, index: true },
    passwordHash: { type: String, required: true },
    phone: { type: String },
    role: { type: String, enum: ROLE_HIERARCHY, required: true, default: "counselor", index: true },
    department: { type: String, enum: ["Sales", "IT", "HR", "Operations", "Management"], default: "Sales" },
    teamName: { type: String },
    managerId: { type: Schema.Types.ObjectId, ref: "User", index: true },
    teamIds: [{ type: Schema.Types.ObjectId, ref: "User" }],
    avatarUrl: String,
    fcmTokens: [String],
    refreshTokens: [String],
    lastLoginAt: Date,
    active: { type: Boolean, default: true, index: true },
  },
  { timestamps: true }
);

UserSchema.index({ role: 1, active: 1 });

export type UserDoc = InferSchemaType<typeof UserSchema> & { _id: string };
export const User: Model<UserDoc> =
  (models.User as Model<UserDoc>) || model<UserDoc>("User", UserSchema);
