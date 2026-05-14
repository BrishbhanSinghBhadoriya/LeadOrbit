import { requireUser } from "@/lib/auth";

export default async function FollowUpsPage() {
  await requireUser();
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold tracking-tight">Follow-ups</h1>
      <p className="text-muted-foreground">Stay on top of your tasks.</p>
      <div className="p-8 border-2 border-dashed rounded-lg flex items-center justify-center text-muted-foreground">
        Follow-up scheduler is coming soon...
      </div>
    </div>
  );
}
