import { requireUser, canCreateRole } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { User } from "@/models";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ROLE_HIERARCHY } from "@/config/rbac";
import { revalidatePath } from "next/cache";
import type { Role } from "@/types";

export default async function EmployeesPage() {
  const currentUser = await requireUser();
  await connectDB();
  
  // Get users managed by current user or all if super_admin/hr
  let users = [];
  if (["super_admin", "hr", "admin"].includes(currentUser.role)) {
    users = await User.find().sort({ createdAt: -1 });
  } else {
    users = await User.find({ managerId: currentUser.sub }).sort({ createdAt: -1 });
  }

  async function addUser(formData: FormData) {
    "use server";
    const user = await requireUser();
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const role = formData.get("role") as Role;
    const phone = formData.get("phone") as string;
    const password = formData.get("password") as string;

    if (!canCreateRole(user.role, role)) {
      throw new Error("Unauthorized to create this role");
    }

    const { hashPassword } = await import("@/lib/password");
    const passwordHash = await hashPassword(password);

    await User.create({
      name,
      email,
      passwordHash,
      role,
      phone,
      managerId: user.sub,
      active: true,
    });
    
    revalidatePath("/employees");
  }

  // Filter roles current user can create
  const creatableRoles = ROLE_HIERARCHY.filter(r => canCreateRole(currentUser.role, r));

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Employees</h1>
          <p className="text-muted-foreground">Manage your team members and roles.</p>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {creatableRoles.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle>Add New User</CardTitle>
            </CardHeader>
            <CardContent>
              <form action={addUser} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Full Name</label>
                    <Input name="name" required placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Email</label>
                    <Input name="email" type="email" required placeholder="john@example.com" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Role</label>
                    <select name="role" required className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
                      {creatableRoles.map(r => (
                        <option key={r} value={r}>{r.replace("_", " ").toUpperCase()}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Phone</label>
                    <Input name="phone" placeholder="+91..." />
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Initial Password</label>
                  <Input name="password" type="password" required minLength={8} placeholder="Min 8 characters" />
                </div>
                <Button type="submit" className="w-full">Create User</Button>
              </form>
            </CardContent>
          </Card>
        )}

        <Card className={creatableRoles.length === 0 ? "md:col-span-2" : ""}>
          <CardHeader>
            <CardTitle>User List</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b text-left font-medium text-muted-foreground">
                    <th className="pb-2">Name</th>
                    <th className="pb-2">Role</th>
                    <th className="pb-2">Email</th>
                    <th className="pb-2">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y">
                  {users.map((u) => (
                    <tr key={u._id.toString()}>
                      <td className="py-2">{u.name}</td>
                      <td className="py-2 capitalize">{u.role.replace("_", " ")}</td>
                      <td className="py-2">{u.email}</td>
                      <td className="py-2">
                        <span className={`px-2 py-0.5 rounded-full text-xs ${u.active ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"}`}>
                          {u.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                    </tr>
                  ))}
                  {users.length === 0 && (
                    <tr>
                      <td colSpan={4} className="py-4 text-center text-muted-foreground">No users found</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
