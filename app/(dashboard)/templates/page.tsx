import { connectDB } from "@/lib/db";
import { WhatsAppTemplate } from "@/models";
import { requireUser } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";

const TYPE_LABELS: Record<string, string> = {
  admission_followup: "Admission Follow-up",
  fee_reminder: "Fee Reminder",
  welcome: "Welcome Message",
  payment_confirmation: "Payment Confirmation",
  registration_reminder: "Registration Reminder",
  custom: "Custom",
};

export default async function TemplatesPage() {
  await requireUser();
  await connectDB();
  const templates = await WhatsAppTemplate.find({ active: true }).sort({ updatedAt: -1 });

  return (
    <div className="space-y-8">
      <div className="flex justify-between">
        <div>
          <h1 className="text-3xl font-extrabold text-slate-900">WhatsApp Templates</h1>
          <p className="text-slate-500">Reusable messages with variables</p>
        </div>
        <Button asChild>
          <Link href="/templates/new">
            <Plus className="h-4 w-4 mr-2" />
            New Template
          </Link>
        </Button>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {templates.length === 0 ? (
          <Card className="md:col-span-2 border-dashed">
            <CardContent className="py-12 text-center text-slate-400">No templates. Create welcome, fee reminder & more.</CardContent>
          </Card>
        ) : (
          templates.map((t: any) => (
            <Card key={t._id} className="shadow-lg border-none">
              <CardHeader className="flex flex-row justify-between pb-2">
                <CardTitle className="text-base">{t.name}</CardTitle>
                <Badge variant="secondary">{TYPE_LABELS[t.type] || t.type}</Badge>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-slate-600 whitespace-pre-wrap line-clamp-4">{t.body}</p>
                {t.variables?.length > 0 && (
                  <p className="text-xs text-primary mt-3 font-mono">{t.variables.join(", ")}</p>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
