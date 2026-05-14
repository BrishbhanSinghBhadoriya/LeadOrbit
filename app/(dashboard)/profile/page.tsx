import { requireUser } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default async function ProfilePage() {
  const userPayload = await requireUser();
  await connectDB();
  const user = await User.findById(userPayload.sub);

  if (!user) return <div>User not found</div>;

  const isGMOrAbove = ["super_admin", "general_manager", "admin"].includes(userPayload.role);

  return (
    <div className="max-w-2xl mx-auto space-y-6 py-10">
      <h1 className="text-3xl font-bold tracking-tight">Your Profile</h1>
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <p className="text-sm text-muted-foreground">
            {isGMOrAbove ? "You have full access to update this profile." : "Some fields are restricted and can only be updated by your manager."}
          </p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Name</label>
              <Input defaultValue={user.name ?? ""} disabled={!isGMOrAbove} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input defaultValue={user.email ?? ""} disabled />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Role</label>
              <Input defaultValue={(user.role as string || "").replace("_", " ").toUpperCase()} disabled />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Phone</label>
              <Input defaultValue={user.phone ?? ""} />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Department</label>
              <Input defaultValue={user.department ?? ""} disabled={!isGMOrAbove} />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Team Name</label>
              <Input defaultValue={user.teamName ?? ""} disabled={!isGMOrAbove} />
            </div>
          </div>
          <Button className="w-full">Update Profile</Button>
        </CardContent>
      </Card>
    </div>
  );
}
