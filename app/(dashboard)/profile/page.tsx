import { requireUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { User as UserIcon, Mail, Phone, Briefcase, Shield, Building2 } from "lucide-react";

export default async function ProfilePage() {
  const userPayload = await requireUser();
  await connectDB();
  const user = await User.findById(userPayload.sub);

  if (!user) return <div className="p-8 text-slate-500">User not found</div>;

  const initials = (user.name ?? user.email ?? "U").slice(0, 2).toUpperCase();
  const isEditable = ["super_admin", "general_manager", "admin"].includes(userPayload.role);

  const infoFields = [
    { icon: UserIcon, label: "Full Name", value: user.name ?? "—" },
    { icon: Mail, label: "Email Address", value: user.email ?? "—" },
    { icon: Phone, label: "Phone Number", value: user.phone ?? "—" },
    { icon: Building2, label: "Department", value: user.department ?? "—" },
    { icon: Briefcase, label: "Team", value: user.teamName ?? "—" },
    { icon: Shield, label: "Role", value: (user.role as string || "").replace("_", " ").toUpperCase() },
  ];

  return (
    <div className="max-w-3xl mx-auto flex flex-col gap-5 pb-8">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">My Profile</h1>
        <p className="text-xs text-slate-400 mt-0.5">View and manage your account information</p>
      </div>

      {/* Profile Card */}
      <Card className="border border-slate-100 shadow-sm bg-white overflow-hidden">
        <div className="h-20 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
        <CardContent className="px-6 pb-6 -mt-10">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4">
            <Avatar className="h-20 w-20 border-4 border-white shadow-md shrink-0">
              <AvatarFallback className="bg-primary text-white text-2xl font-bold">{initials}</AvatarFallback>
            </Avatar>
            <div className="pb-1">
              <h2 className="text-lg font-bold text-slate-900 leading-tight">{user.name ?? user.email}</h2>
              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge className="text-[10px] h-5 px-2 capitalize bg-primary/10 text-primary border-0 font-semibold">
                  {(user.role as string || "").replace("_", " ")}
                </Badge>
                {user.department && (
                  <span className="text-xs text-slate-500">{user.department}</span>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Info Grid */}
      <Card className="border border-slate-100 shadow-sm bg-white">
        <CardHeader className="py-3 px-5 border-b border-slate-100">
          <CardTitle className="text-sm font-bold text-slate-900">Account Information</CardTitle>
        </CardHeader>
        <CardContent className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {infoFields.map((f) => (
              <div key={f.label} className="flex items-start gap-3 p-3 rounded-xl bg-slate-50 border border-slate-100">
                <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                  <f.icon className="h-4 w-4 text-primary" />
                </div>
                <div className="min-w-0">
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">{f.label}</p>
                  <p className="text-sm font-semibold text-slate-900 truncate capitalize">{f.value}</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Edit Form */}
      <Card className="border border-slate-100 shadow-sm bg-white">
        <CardHeader className="py-3 px-5 border-b border-slate-100">
          <CardTitle className="text-sm font-bold text-slate-900">Edit Profile</CardTitle>
          <p className="text-xs text-slate-400">
            {isEditable ? "Update your profile information below." : "Contact your manager to update restricted fields."}
          </p>
        </CardHeader>
        <CardContent className="p-5">
          <ProfileForm
            userId={user._id.toString()}
            defaultValues={{
              name: user.name ?? "",
              email: user.email ?? "",
              phone: user.phone ?? "",
              department: user.department ?? "",
              teamName: user.teamName ?? "",
            }}
            isEditable={isEditable}
          />
        </CardContent>
      </Card>
    </div>
  );
}
