/**
 * Run once to create super admin:
 *   npx tsx scripts/create-super-admin.ts
 */

import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import * as dotenv from "dotenv";

dotenv.config({ path: ".env" });

const MONGODB_URI = process.env.MONGODB_URI!;
if (!MONGODB_URI) throw new Error("MONGODB_URI not set in .env");

const UserSchema = new mongoose.Schema({
  name:         { type: String, required: true },
  email:        { type: String, required: true, unique: true, lowercase: true },
  passwordHash: { type: String, required: true },
  role:         { type: String, required: true },
  active:       { type: Boolean, default: true },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model("User", UserSchema);

async function main() {
  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  const email    = "amanpawar@unifost.com";
  const password = "Aman@1234";
  const name     = "Aman Pawar";
  const role     = "super_admin";

  const existing = await User.findOne({ email });
  if (existing) {
    // Update existing user to super_admin
    existing.name         = name;
    existing.role         = role;
    existing.active       = true;
    existing.passwordHash = await bcrypt.hash(password, 12);
    await existing.save();
    console.log("✅ Existing user updated to super_admin");
  } else {
    await User.create({
      name,
      email,
      passwordHash: await bcrypt.hash(password, 12),
      role,
      active: true,
    });
    console.log("✅ Super admin created successfully");
  }

  console.log("─────────────────────────────────");
  console.log("  Name     :", name);
  console.log("  Email    :", email);
  console.log("  Password :", password);
  console.log("  Role     :", role);
  console.log("─────────────────────────────────");

  await mongoose.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Error:", err.message);
  process.exit(1);
});
