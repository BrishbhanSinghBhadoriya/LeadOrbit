import { requirePermission } from "@/lib/auth";
import { connectDB } from "@/lib/db";
import { University } from "@/models";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, MapPin, Building2, Trash2, ExternalLink } from "lucide-react";
import Link from "next/link";
import { deleteUniversity } from "@/actions/universities";
import { UniversityForm } from "@/components/universities/UniversityForm";

export default async function UniversitiesPage() {
  await requirePermission("universities.manage");
  await connectDB();
  const universities = await University.find({ active: true }).sort({ name: 1 });

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight text-slate-900">Universities</h1>
          <p className="text-slate-500 mt-1">Manage partner universities and institutions.</p>
        </div>
        <UniversityForm />
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {universities.map((uni) => (
          <Card key={uni._id.toString()} className="border-none shadow-xl bg-white/50 backdrop-blur-sm overflow-hidden group hover:shadow-2xl transition-all duration-300">
            <CardHeader className="flex flex-row items-center gap-4 pb-4 border-b border-slate-100 bg-slate-50/50">
              <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center text-primary font-bold overflow-hidden">
                {uni.logoUrl ? (
                  <img src={uni.logoUrl} alt={uni.name} className="h-full w-full object-cover" />
                ) : (
                  <Building2 className="h-6 w-6" />
                )}
              </div>
              <div>
                <CardTitle className="text-lg font-bold text-slate-900 line-clamp-1">{uni.name}</CardTitle>
                <CardDescription className="font-medium text-xs uppercase tracking-wider">{uni.shortName || "Institution"}</CardDescription>
              </div>
            </CardHeader>
            <CardContent className="pt-6 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center gap-2 text-sm text-slate-600">
                  <MapPin className="h-4 w-4 text-primary" />
                  <span>{uni.city}, {uni.state}</span>
                </div>
                {uni.website && (
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Globe className="h-4 w-4 text-primary" />
                    <a href={uni.website} target="_blank" rel="noopener noreferrer" className="hover:text-primary transition-colors flex items-center gap-1">
                      {uni.website.replace("https://", "").replace("http://", "").split("/")[0]}
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  </div>
                )}
              </div>
              
              <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                <div className="flex gap-2">
                  <UniversityForm university={JSON.parse(JSON.stringify(uni))} />
                  <form action={async () => {
                    "use server";
                    await deleteUniversity(uni._id.toString());
                  }}>
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-slate-400 hover:text-red-500 hover:bg-red-50">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </form>
                </div>
                <Link href={`/courses?university=${uni._id.toString()}`} className="text-xs font-bold text-primary hover:underline">
                  View Courses →
                </Link>
              </div>
            </CardContent>
          </Card>
        ))}

        {universities.length === 0 && (
          <div className="col-span-full p-16 border-2 border-dashed border-slate-200 rounded-3xl text-center space-y-6 bg-white/30 backdrop-blur-sm">
            <div className="bg-primary/10 w-20 h-20 rounded-3xl flex items-center justify-center mx-auto rotate-12">
              <Building2 className="h-10 w-10 text-primary" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-slate-900">No Universities Found</h3>
              <p className="text-slate-500 max-w-xs mx-auto">Add your first partner university to start listing courses and managing leads.</p>
            </div>
            <UniversityForm />
          </div>
        )}
      </div>
    </div>
  );
}
