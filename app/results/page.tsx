import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Map, Trophy } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import DeleteResultButton from "@/components/DeleteResultButton";
import PageHeader from "@/components/PageHeader";

export default async function ResultsPage() {
  const session = await auth();
  const isAdmin = session?.user && (session.user.role === "ADMIN" || session.user.role === "FOUNDER");
  const scrimsWithResults = await prisma.scrim.findMany({
    where: {
      results: {
        some: {}
      }
    },
    include: {
      results: true
    },
    orderBy: {
      startTime: "desc"
    }
  });

  return (
    <div className="space-y-8 pb-20">
      <PageHeader
        title="შედეგები"
        description="დასრულებული სკრიმების და ტურნირების შედეგები"
      />

      <div className="space-y-12">
        {scrimsWithResults.length === 0 ? (
          <div className="text-center py-20 text-cyber-muted bg-white/5 rounded-3xl border border-white/5 italic">
            შედეგები ჯერ არ არის ატვირთული
          </div>
        ) : (
          scrimsWithResults.map((scrim) => (
            <div key={scrim.id} className="space-y-6">
              <div className="flex items-center gap-4 px-2">
                <div className="p-2 bg-primary/10 rounded-lg">
                  <Trophy className="w-5 h-5 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white uppercase tracking-tight">
                    {String(scrim.map).split(',').join(' / ')}
                  </h3>
                  <div className="flex items-center gap-2 text-[10px] text-cyber-muted font-bold uppercase tracking-widest mt-1">
                    <Calendar className="w-3 h-3 text-secondary" />
                    {new Date(scrim.startTime).toLocaleString("ka-GE")}
                  </div>
                </div>
              </div>

              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {scrim.results.map((result) => (
                  <Card key={result.id} className="bg-[#06070a] border-white/5 group overflow-hidden rounded-2xl hover:border-primary/50 transition-all duration-500">
                    <CardContent className="p-0 relative">
                      <div className="aspect-[16/9] relative overflow-hidden">
                        <SafeImage src={result.image} alt="Scoreboard" className="group-hover:scale-105 transition-transform duration-700" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                      </div>

                      {result.description && (
                        <div className="p-4 bg-black/40 backdrop-blur-md border-t border-white/5">
                          <p className="text-xs font-medium text-cyber-muted leading-relaxed">
                            {result.description}
                          </p>
                        </div>
                      )}

                      {isAdmin && (
                        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <div className="bg-black/60 backdrop-blur-md p-1 rounded-lg border border-white/10">
                            <DeleteResultButton resultId={result.id} />
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
