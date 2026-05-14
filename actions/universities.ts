"use server";

import { connectDB } from "@/lib/db";
import { University } from "@/models";
import { requireUser } from "@/lib/auth";
import { universitySchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";

export async function createUniversity(input: any) {
  await requireUser();
  const data = universitySchema.parse(input);
  await connectDB();
  const university = await University.create(data);
  revalidatePath("/universities");
  return { id: university._id.toString() };
}

export async function updateUniversity(id: string, input: any) {
  await requireUser();
  const data = universitySchema.parse(input);
  await connectDB();
  await University.findByIdAndUpdate(id, data);
  revalidatePath("/universities");
  return { success: true };
}

export async function deleteUniversity(id: string) {
  await requireUser();
  await connectDB();
  await University.findByIdAndDelete(id);
  revalidatePath("/universities");
  return { success: true };
}
