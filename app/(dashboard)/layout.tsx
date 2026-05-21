import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { Sidebar } from "@/components/layout/Sidebar";
import { Topbar } from "@/components/layout/Topbar";
import { SocketProvider } from "@/components/providers/SocketProvider";
import { BreakAlertProvider } from "@/components/providers/BreakAlertProvider";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const user = await getCurrentUser();
  if (!user) redirect("/login");

  return (
    <SocketProvider>
      <BreakAlertProvider>
        <div className="flex h-screen overflow-hidden bg-slate-50/80">
          <Sidebar role={user.role} user={user} />
          <div className="flex-1 flex flex-col h-full overflow-hidden min-w-0">
            <Topbar user={user} />
            {/* px-4 on mobile (hamburger takes ~40px on left, handled in page), md:px-6 on desktop */}
            <main className="flex-1 overflow-y-auto p-4 md:p-6">
              {children}
            </main>
          </div>
        </div>
      </BreakAlertProvider>
    </SocketProvider>
  );
}
