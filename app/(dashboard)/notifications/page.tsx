import { connectDB } from "@/lib/db";
import { Notification } from "@/models";
import { requireUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format } from "date-fns";
import { Bell } from "lucide-react";

export default async function NotificationsPage() {
  const user = await requireUser();
  await connectDB();
  const items = await Notification.find({ userId: user.sub })
    .sort({ createdAt: -1 })
    .limit(50);

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-3xl font-extrabold text-slate-900 flex items-center gap-3">
        <Bell className="h-8 w-8 text-primary" />
        Notifications
      </h1>
      <Card className="border-none shadow-xl">
        <CardHeader>
          <CardTitle>All Notifications</CardTitle>
        </CardHeader>
        <CardContent className="divide-y">
          {items.length === 0 ? (
            <p className="py-8 text-center text-slate-400 italic">No notifications</p>
          ) : (
            items.map((n: any) => (
              <div key={n._id} className="py-4 flex justify-between gap-4">
                <div>
                  <p className="font-semibold text-slate-900">{n.title || n.type}</p>
                  <p className="text-sm text-slate-600 mt-1">{n.body || n.title}</p>
                </div>
                <span className="text-xs text-slate-400 shrink-0">
                  {format(new Date(n.createdAt), "MMM d, HH:mm")}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
