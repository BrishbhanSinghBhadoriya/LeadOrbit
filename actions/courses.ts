"use server";

import { connectDB } from "@/lib/db";
import { Course } from "@/models";
import { requireUser } from "@/lib/auth";
import { courseSchema } from "@/lib/validators";
import { revalidatePath } from "next/cache";

export async function createCourse(input: any) {
  await requireUser();
  const data = courseSchema.parse(input);
  await connectDB();
  const course = await Course.create(data);
  revalidatePath("/courses");
  return { id: course._id.toString() };
}

export async function updateCourse(id: string, input: any) {
  await requireUser();
  const data = courseSchema.parse(input);
  await connectDB();
  await Course.findByIdAndUpdate(id, data);
  revalidatePath("/courses");
  return { success: true };
}

export async function deleteCourse(id: string) {
  await requireUser();
  await connectDB();
  await Course.findByIdAndDelete(id);
  revalidatePath("/courses");
  return { success: true };
}
