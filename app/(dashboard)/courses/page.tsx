import { requirePermission } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Course, University } from "@/models";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Banknote, GraduationCap, Trash2, FileText, Download } from "lucide-react";
import { deleteCourse } from "@/actions/courses";
import { Badge } from "@/components/ui/badge";
import { CourseForm } from "@/components/courses/CourseForm";
import { BrochureActions } from "@/components/courses/BrochureActions";
import { CourseGroupingView } from "@/components/courses/CourseGroupingView";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requirePermission("courses.manage");
  await connectDB();
  
  const sp = await searchParams;
  const universityId = sp.university as string | undefined;

  let query: any = { active: true };
  if (universityId) {
    query.universityId = universityId;
  }

  const [courses, universities] = await Promise.all([
    Course.find(query).populate("universityId", "name").sort({ name: 1 }),
    University.find({ active: true }).select("name").sort({ name: 1 })
  ]);

  const universityList = universities.map(u => ({ id: u._id.toString(), name: u.name }));

  // Convert to plain objects to avoid serialization issues (Maximum call stack size exceeded)
  const plainCourses = JSON.parse(JSON.stringify(courses));

  // Group courses by name
  const groupedMap = new Map<string, any>();
  plainCourses.forEach((course: any) => {
    const name = course.name;
    if (!groupedMap.has(name)) {
      groupedMap.set(name, {
        name,
        level: course.level,
        count: 0,
        courses: []
      });
    }
    const group = groupedMap.get(name);
    group.courses.push(course);
    group.count++;
  });

  const groupedCourses = Array.from(groupedMap.values()).sort((a, b) => a.name.localeCompare(b.name));

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Course Catalog</h1>
          <p className="text-slate-500 mt-1">Explore academic programs across multiple universities.</p>
        </div>
        <CourseForm universities={universityList} />
      </div>

      <CourseGroupingView groupedCourses={groupedCourses} universityList={universityList} />
    </div>
  );
}
