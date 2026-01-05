import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Map, Trophy } from "lucide-react";
import SafeImage from "@/components/SafeImage";
import DeleteResultButton from "@/components/DeleteResultButton";

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
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-white">შედეგები</h1>
        <p className="text-gray-400">დასრულებული სკრიმების და ტურნირების შედეგები</p>
      </div>

      <div className="space-y-8">
        {scrimsWithResults.length === 0 ? (
          <div className="text-center py-12 text-gray-400 bg-zinc-900/50 rounded-lg border border-zinc-800">
            შედეგები ჯერ არ არის ატვირთული
          </div>
        ) : (
          scrimsWithResults.map((scrim) => (
            <Card key={scrim.id} className="bg-zinc-900/50 border-zinc-800 overflow-hidden">
              <CardHeader className="bg-zinc-800/50 border-b border-zinc-800">
                <div className="flex flex-col md:flex-row justify-between md:items-center gap-4">
                  <div className="flex items-center gap-4">
                    <div className="p-3 bg-yellow-900/20 rounded-lg">
                      <Trophy className="w-6 h-6 text-yellow-500" />
                    </div>
                    <div>
                      <CardTitle className="text-xl text-white">{String(scrim.map).split(',').join(' / ')}</CardTitle>
                      <div className="flex items-center gap-2 text-sm text-gray-400 mt-1">
                        <Calendar className="w-4 h-4" />
                        {new Date(scrim.startTime).toLocaleString("ka-GE")}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                  {scrim.results.map((result) => (
                    <div key={result.id} className="space-y-3">
                      <SafeImage src={result.image} alt="Scoreboard" />
                      {result.description && (
                        <p className="text-sm text-gray-400">{result.description}</p>
                      )}
                      {isAdmin && (
                        <div>
                          {/* Client-side delete button for admins */}
                          {/* eslint-disable-next-line react/jsx-no-undef */}
                          <DeleteResultButton resultId={result.id} />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
