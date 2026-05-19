import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { SocketProvider } from "@/components/providers/SocketProvider";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");
  return (
    <SocketProvider>
      <div className="flex h-screen overflow-hidden bg-background">
        <Sidebar role={user.role} />
        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <Topbar user={user} />
          <main className="flex-1 overflow-y-auto p-6">{children}</main>
        </div>
      </div>
    </SocketProvider>
  );
}
