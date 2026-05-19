import { requireUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { Lead, User, Pipeline, Course, University, SavedFilter } from "@/models";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Upload, Phone, Mail, Search, Building2, GraduationCap } from "lucide-react";
import { LeadImport } from "@/components/leads/LeadImport";
import { LeadForm } from "@/components/leads/LeadForm";
import { LeadFilters } from "@/components/leads/LeadFilters";
import { LeadListTable } from "@/components/leads/LeadListTable";
import { Badge } from "@/components/ui/badge";
import { startOfDay, endOfDay, subDays, startOfWeek, startOfMonth } from "date-fns";
import mongoose from "mongoose";

export default async function LeadsPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const user = await requireUser();
  await connectDB();
  
  const sp = await searchParams;
  const status = sp.status as string | undefined;
  const source = sp.source as string | undefined;
  const pipeline = sp.pipeline as string | undefined;
  const course = sp.course as string | undefined;
  const university = sp.university as string | undefined;
  const assignedTo = sp.assignedTo as string | undefined;
  const temperature = sp.temperature as string | undefined;
  const paymentStatus = sp.paymentStatus as string | undefined;
  const callStatus = sp.callStatus as string | undefined;
  const whatsappStatus = sp.whatsappStatus as string | undefined;
  const emailStatus = sp.emailStatus as string | undefined;
  const admissionStage = sp.admissionStage as string | undefined;
  
  const dateRange = sp.dateRange as string | undefined;
  const followUpDate = sp.followUpDate as string | undefined;
  
  const city = sp.city as string | undefined;
  const state = sp.state as string | undefined;
  const country = sp.country as string | undefined;
  const q = sp.q as string | undefined;

  const smart = sp.smart as string | undefined;

  // Build query
  let query: any = {};
  
  // Basic Selects - Using Mongoose casting for ObjectIds
  if (status) query.status = { $in: status.split(",") };
  if (source) query.source = { $in: source.split(",") };
  
  if (pipeline) {
    const ids = pipeline.split(",").filter(id => mongoose.isValidObjectId(id));
    if (ids.length > 0) query.pipelineId = { $in: ids };
  }
  
  if (course) {
    const courseNames = course.split(",");
    const coursesFound = await Course.find({ name: { $in: courseNames } }).select("_id");
    const ids = coursesFound.map(c => c._id);
    if (ids.length > 0) query.courseId = { $in: ids };
  }
  
  if (university) {
    const ids = university.split(",").filter(id => mongoose.isValidObjectId(id));
    if (ids.length > 0) query.universityId = { $in: ids };
  }
  
  if (assignedTo) {
    const ids = assignedTo.split(",").filter(id => mongoose.isValidObjectId(id));
    if (ids.length > 0) query.assignedTo = { $in: ids };
  }
  
  if (temperature) query.temperature = { $in: temperature.split(",") };
  if (paymentStatus) query.paymentStatus = { $in: paymentStatus.split(",") };
  if (callStatus) query.callStatus = { $in: callStatus.split(",") };
  if (whatsappStatus) query.whatsappStatus = { $in: whatsappStatus.split(",") };
  if (emailStatus) query.emailStatus = { $in: emailStatus.split(",") };
  if (admissionStage) query.admissionStage = { $in: admissionStage.split(",") };

  // Location
  if (city) query.city = { $regex: city, $options: "i" };
  if (state) query.state = { $regex: state, $options: "i" };
  if (country) query.country = { $regex: country, $options: "i" };
  
  // Date Filters
  if (dateRange) {
    const now = new Date();
    if (dateRange === "today") {
      query.createdAt = { $gte: startOfDay(now), $lte: endOfDay(now) };
    } else if (dateRange === "yesterday") {
      const yesterday = subDays(now, 1);
      query.createdAt = { $gte: startOfDay(yesterday), $lte: endOfDay(yesterday) };
    } else if (dateRange === "this_week") {
      query.createdAt = { $gte: startOfWeek(now) };
    } else if (dateRange === "this_month") {
      query.createdAt = { $gte: startOfMonth(now) };
    } else if (dateRange.includes(",")) {
      const [start, end] = dateRange.split(",");
      query.createdAt = { $gte: new Date(start), $lte: new Date(end) };
    }
  }

  // Follow-up Date Filter
  if (followUpDate) {
    const now = new Date();
    if (followUpDate === "today") {
      query.followUpAt = { $gte: startOfDay(now), $lte: endOfDay(now) };
    } else if (followUpDate === "missed") {
      query.followUpAt = { $lt: startOfDay(now) };
      query.status = { $ne: "converted" }; // Only non-converted missed followups
    } else if (followUpDate === "upcoming") {
      query.followUpAt = { $gt: endOfDay(now) };
    }
  }

  // Smart Filters
  if (smart === "duplicates") {
    query.duplicateOf = { $exists: true };
  } else if (smart === "inactive") {
    const sevenDaysAgo = subDays(new Date(), 7);
    query.lastContactedAt = { $lt: sevenDaysAgo };
  } else if (smart === "high_priority") {
    query.score = { $gte: 70 };
  }

  // Search
  if (q) {
    query.$or = [
      { name: { $regex: q, $options: "i" } },
      { phone: { $regex: q, $options: "i" } },
      { email: { $regex: q, $options: "i" } },
      { leadId: q },
    ];
  }

  // Role based access
  if (!["super_admin", "admin", "general_manager", "hr"].includes(user.role)) {
    if (user.role === "team_leader" || user.role === "manager") {
      const members = await User.find({ managerId: user.sub }).select("_id");
      const memberIds = members.map(m => m._id);
      query.assignedTo = { $in: [user.sub, ...memberIds] };
    } else {
      query.assignedTo = user.sub;
    }
  }

  const leads = await Lead.find(query)
    .sort({ createdAt: -1 })
    .populate("assignedTo", "name")
    .populate("courseId", "name")
    .populate("universityId", "name")
    .populate("activities.by", "name")
    .limit(100);

  const teamMembers = await User.find({ 
    role: { $in: ["counselor", "team_leader", "manager", "admin"] } 
  }).select("name role");

  const pipelines = await Pipeline.find({ active: true }).select("name");
  const allCourses = await Course.find().select("name");
  
  // Courses for Form (with IDs)
  const coursesForForm = allCourses.map(c => ({ id: c._id.toString(), name: c.name }));
  
  // Unique Courses for Filter (by Name)
  const uniqueCourseNames = Array.from(new Set(allCourses.map(c => c.name)));
  const coursesForFilter = uniqueCourseNames.map(name => ({ id: name, name }));
  
  const universities = await University.find().select("name");
  const savedFilters = await SavedFilter.find({ userId: user.sub, type: "lead" }).sort({ createdAt: -1 });

  const isGM = ["super_admin", "general_manager", "admin"].includes(user.role);

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Leads Management</h1>
          <p className="text-slate-500 mt-1">Track and engage with your potential customers.</p>
        </div>
        <div className="flex flex-wrap gap-3">
          <LeadForm 
            pipelines={pipelines.map(p => ({ id: p._id.toString(), name: p.name }))} 
            courses={coursesForForm}
            universities={universities.map(u => ({ id: u._id.toString(), name: u.name }))}
          />
        </div>
      </div>

      <LeadFilters 
        initialFilters={sp}
        teamMembers={teamMembers.map(m => ({ id: m._id.toString(), name: m.name }))}
        pipelines={pipelines.map(p => ({ id: p._id.toString(), name: p.name }))}
        courses={coursesForFilter}
        universities={universities.map(u => ({ id: u._id.toString(), name: u.name }))}
        savedFilters={savedFilters.map(f => ({ id: f._id.toString(), name: f.name, filters: f.filters }))}
      />

      <Card className="border-none shadow-xl bg-white/50 backdrop-blur-sm overflow-hidden">
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-xl font-bold">Leads List</CardTitle>
            <CardDescription>Showing {leads.length} leads matching filters.</CardDescription>
          </div>
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-full">
            <div className="h-2 w-2 rounded-full bg-green-500 animate-pulse" />
            <span className="text-xs font-bold text-slate-600 uppercase tracking-wider">{leads.length} Total</span>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <LeadListTable 
            leads={JSON.parse(JSON.stringify(leads))}
            teamMembers={teamMembers.map(m => ({ id: m._id.toString(), name: m.name }))}
            pipelines={pipelines.map(p => ({ id: p._id.toString(), name: p.name }))}
            courses={coursesForForm}
            universities={universities.map(u => ({ id: u._id.toString(), name: u.name }))}
            isGM={isGM}
          />
        </CardContent>
      </Card>
    </div>
  );
}
