/* eslint-disable no-console */
import "dotenv/config";
import { connectDB } from "../lib/db";
import { University, Course, User } from "../models";
import { hashPassword } from "../lib/password";

const UNIVERSITIES = [
  "Amity University Online", "Jain University Online",
  "Manipal University Jaipur", "Dr. D. Y. Patil Vidyapeeth",
  "Lovely Professional University", "NMIMS",
  "Sharda University", "Chandigarh University Online",
  "Symbiosis Centre for Distance Learning", "IGNOU",
];

async function main() {
  await connectDB();
  const superAdminEmail = "superadmin@unifost.local";
  const superAdmin = await User.findOne({ email: superAdminEmail });
  const superAdminData = {
    name: "Super Admin",
    email: superAdminEmail,
    passwordHash: await hashPassword("SuperAdmin@12345"),
    role: "super_admin",
    department: "Management",
  };
  if (!superAdmin) {
    await User.create(superAdminData);
    console.log("Created Super Admin:", superAdminEmail, "password: SuperAdmin@12345");
  } else {
    await User.updateOne({ email: superAdminEmail }, superAdminData);
    console.log("Updated Super Admin password:", superAdminEmail);
  }

  const gmEmail = "gm@unifost.local";
  const gm = await User.findOne({ email: gmEmail });
  const gmData = {
    name: "General Manager",
    email: gmEmail,
    passwordHash: await hashPassword("GMAdmin@12345"),
    role: "general_manager",
    department: "Management",
  };
  if (!gm) {
    await User.create(gmData);
    console.log("Created General Manager:", gmEmail, "password: GMAdmin@12345");
  } else {
    await User.updateOne({ email: gmEmail }, gmData);
    console.log("Updated General Manager password:", gmEmail);
  }

  for (const name of UNIVERSITIES) {
    const u = await University.findOneAndUpdate(
      { name }, { name, active: true }, { upsert: true, new: true }
    );
    const courses = [
      { name: "Online MBA", level: "PG", durationMonths: 24, fees: 175000 },
      { name: "Online MCA", level: "PG", durationMonths: 24, fees: 150000 },
      { name: "Online BBA", level: "UG", durationMonths: 36, fees: 120000 },
      { name: "Online BCA", level: "UG", durationMonths: 36, fees: 110000 },
    ] as const;
    for (const c of courses) {
      await Course.findOneAndUpdate(
        { universityId: u._id, name: c.name },
        { ...c, universityId: u._id, active: true },
        { upsert: true }
      );
    }
  }
  console.log("Seed complete.");
  process.exit(0);
}
main().catch((e) => { console.error(e); process.exit(1); });
