"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  GraduationCap, 
  ChevronDown, 
  ChevronUp, 
  Building2, 
  Clock, 
  Banknote, 
  Trash2, 
  Search,
  Plus
} from "lucide-react";
import { CourseForm } from "@/components/courses/CourseForm";
import { BrochureActions } from "@/components/courses/BrochureActions";
import { deleteCourse } from "@/actions/courses";
import { Input } from "@/components/ui/input";

interface GroupedCourse {
  name: string;
  level: string;
  count: number;
  courses: any[];
}

interface CourseGroupingViewProps {
  groupedCourses: GroupedCourse[];
  universityList: { id: string; name: string }[];
}

export function CourseGroupingView({ groupedCourses, universityList }: CourseGroupingViewProps) {
  const router = useRouter();
  const [expandedCourse, setExpandedCourse] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filteredGroups = groupedCourses.filter(group => 
    group.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this course for this university?")) {
      try {
        await deleteCourse(id);
        router.refresh();
      } catch (err) {
        console.error("Delete failed", err);
        alert("Failed to delete course.");
      }
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Bar */}
      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
        <Input 
          placeholder="Search courses (e.g. MBA, BBA)..." 
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10 h-12 rounded-2xl border-slate-200 bg-white shadow-sm"
        />
      </div>

      <div className="grid gap-6">
        {filteredGroups.map((group) => (
          <div key={group.name} className="space-y-4">
            {/* Main Course Category Card */}
            <Card 
              className={`border-none shadow-lg transition-all duration-300 overflow-hidden cursor-pointer hover:shadow-xl ${
                expandedCourse === group.name ? "ring-2 ring-primary/20" : "bg-white/50 backdrop-blur-sm"
              }`}
              onClick={() => setExpandedCourse(expandedCourse === group.name ? null : group.name)}
            >
              <CardHeader className="py-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                      <GraduationCap className="h-8 w-8" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <CardTitle className="text-2xl font-black text-slate-900">{group.name}</CardTitle>
                        <Badge variant="secondary" className="bg-slate-100 text-slate-600 border-none font-bold uppercase tracking-tighter text-[10px]">
                          {group.level}
                        </Badge>
                      </div>
                      <CardDescription className="text-slate-500 font-medium">
                        Available in {group.count} {group.count === 1 ? 'University' : 'Universities'}
                      </CardDescription>
                    </div>
                  </div>
                  <Button variant="ghost" size="icon" className="rounded-full">
                    {expandedCourse === group.name ? <ChevronUp className="h-6 w-6" /> : <ChevronDown className="h-6 w-6" />}
                  </Button>
                </div>
              </CardHeader>
            </Card>

            {/* Expanded Universities List */}
            {expandedCourse === group.name && (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 pl-4 md:pl-8 animate-in fade-in slide-in-from-top-4 duration-300">
                {group.courses.map((course) => (
                  <Card key={course._id.toString()} className="border-none shadow-md bg-white overflow-hidden group/item hover:shadow-lg transition-all">
                    <CardHeader className="pb-3 border-b border-slate-50 bg-slate-50/30">
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2 text-primary font-bold">
                          <Building2 className="h-4 w-4" />
                          <span className="text-sm line-clamp-1">{(course.universityId as any)?.name}</span>
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover/item:opacity-100 transition-opacity">
                          <CourseForm course={JSON.parse(JSON.stringify(course))} universities={universityList} />
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-7 w-7 rounded-full text-slate-400 hover:text-red-500"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDelete(course._id.toString());
                            }}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-4 space-y-4">
                      <div className="grid grid-cols-2 gap-2">
                        <div className="space-y-0.5">
                          <p className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">Duration</p>
                          <div className="flex items-center gap-1.5 text-slate-700 font-bold text-sm">
                            <Clock className="h-3.5 w-3.5 text-orange-500" />
                            <span>{course.durationMonths}m</span>
                          </div>
                        </div>
                        <div className="space-y-0.5">
                          <p className="text-[9px] font-bold uppercase text-slate-400 tracking-widest">Fees</p>
                          <div className="flex items-center gap-1.5 text-slate-700 font-bold text-sm">
                            <Banknote className="h-3.5 w-3.5 text-green-500" />
                            <span>₹{course.fees.toLocaleString("en-IN")}</span>
                          </div>
                        </div>
                      </div>
                      
                      {course.brochureUrl && (
                        <div className="pt-2">
                          <BrochureActions url={course.brochureUrl} courseName={`${group.name} - ${(course.universityId as any)?.name}`} />
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>
        ))}

        {filteredGroups.length === 0 && (
          <div className="p-16 border-2 border-dashed border-slate-200 rounded-3xl text-center space-y-6 bg-white/30 backdrop-blur-sm">
            <div className="bg-primary/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto">
              <GraduationCap className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">No matching courses found</h3>
              <p className="text-slate-500 max-w-xs mx-auto">Try searching for a different course name or add a new program.</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
