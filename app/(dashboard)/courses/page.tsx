import { requireUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Course, University } from "@/models";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BookOpen, Clock, Banknote, GraduationCap, Trash2, FileText, Download } from "lucide-react";
import { deleteCourse } from "@/actions/courses";
import { Badge } from "@/components/ui/badge";
import { CourseForm } from "@/components/courses/CourseForm";

export default async function CoursesPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  await requireUser();
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

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Course Catalog</h1>
          <p className="text-slate-500 mt-1">Explore and manage available academic programs.</p>
        </div>
        <CourseForm universities={universityList} />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {courses.map((course) => (
          <Card key={course._id.toString()} className="border-none shadow-xl bg-white/50 backdrop-blur-sm overflow-hidden group hover:shadow-2xl transition-all duration-300">
            <CardHeader className="pb-4 border-b border-slate-100 bg-slate-50/50">
              <div className="flex justify-between items-start mb-2">
                <Badge variant="secondary" className="bg-primary/10 text-primary border-none font-bold uppercase tracking-tighter text-[10px]">
                  {course.level}
                </Badge>
                <div className="flex gap-1">
                  <CourseForm course={JSON.parse(JSON.stringify(course))} universities={universityList} />
                  <form action={async () => {
                    "use server";
                    await deleteCourse(course._id.toString());
                  }}>
                    <Button variant="ghost" size="icon" className="h-7 w-7 rounded-full text-slate-400 hover:text-red-500">
                      <Trash2 className="h-3.5 w-3.5" />
                    </Button>
                  </form>
                </div>
              </div>
              <CardTitle className="text-xl font-bold text-slate-900 group-hover:text-primary transition-colors line-clamp-2">
                {course.name}
              </CardTitle>
              <CardDescription className="flex items-center gap-1 font-semibold text-slate-500 mt-1">
                <GraduationCap className="h-3.5 w-3.5" />
                {(course.universityId as any)?.name}
              </CardDescription>
            </CardHeader>
            <CardContent className="pt-6 space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Duration</p>
                  <div className="flex items-center gap-2 text-slate-700 font-bold">
                    <Clock className="h-4 w-4 text-orange-500" />
                    <span>{course.durationMonths} Months</span>
                  </div>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Fees</p>
                  <div className="flex items-center gap-2 text-slate-700 font-bold">
                    <Banknote className="h-4 w-4 text-green-500" />
                    <span>₹{course.fees.toLocaleString("en-IN")}</span>
                  </div>
                </div>
              </div>

              {course.eligibility && (
                <div className="space-y-1">
                  <p className="text-[10px] font-bold uppercase text-slate-400 tracking-widest">Eligibility</p>
                  <p className="text-sm text-slate-600 line-clamp-2">{course.eligibility}</p>
                </div>
              )}

              <div className="pt-4 border-t border-slate-100">
                {course.brochureUrl ? (
                  <Button variant="outline" className="w-full rounded-xl border-slate-200 hover:bg-primary/5 hover:text-primary hover:border-primary/30 group/btn" asChild>
                    <a href={course.brochureUrl} target="_blank" rel="noopener noreferrer">
                      <FileText className="mr-2 h-4 w-4 text-primary group-hover/btn:animate-bounce" />
                      View Brochure
                      <Download className="ml-auto h-3.5 w-3.5 opacity-50" />
                    </a>
                  </Button>
                ) : (
                  <Button variant="outline" className="w-full rounded-xl border-dashed border-slate-300 text-slate-400 cursor-not-allowed">
                    No Brochure Available
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        ))}

        {courses.length === 0 && (
          <div className="col-span-full p-16 border-2 border-dashed border-slate-200 rounded-3xl text-center space-y-6 bg-white/30 backdrop-blur-sm">
            <div className="bg-primary/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto rotate-12">
              <BookOpen className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">No Courses Listed</h3>
              <p className="text-slate-500 max-w-xs mx-auto">Start adding academic programs and courses for your partner universities.</p>
            </div>
            <CourseForm universities={universityList} />
          </div>
        )}
      </div>
    </div>
  );
}
