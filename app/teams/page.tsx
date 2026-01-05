import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Map, Crown } from "lucide-react";

export default async function TeamsPage() {
  const teams = await prisma.team.findMany({
    where: { status: "APPROVED" },
    orderBy: [
        { isVip: 'desc' },
        { createdAt: 'desc' }
    ]
  });

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-white">გუნდები</h1>
        <p className="text-gray-400">რეგისტრირებული და დადასტურებული გუნდები</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {teams.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400 bg-zinc-900/50 rounded-lg border border-zinc-800">
            ამ დროისთვის არცერთი გუნდი არ არის რეგისტრირებული
          </div>
        ) : (
          teams.map((team) => (
            <Card key={team.id} className={`bg-zinc-900/50 border-zinc-800 transition-colors hover:border-zinc-700 ${team.isVip ? 'border-yellow-900/50 bg-yellow-900/10' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-xl font-bold text-white truncate pr-2">
                    {team.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                    {team.isVip && <Crown className="w-5 h-5 text-yellow-500" />}
                    <span className="font-mono text-sm bg-zinc-800 px-2 py-1 rounded text-gray-300">
                        {team.tag}
                    </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mt-2">
                    <div className="flex items-center gap-2 text-gray-400">
                        <Users className="w-4 h-4" />
                        <span>{team.playerCount} მოთამაშე</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                        <Map className="w-4 h-4" />
                        <span>{team.mapsCount} რუკა</span>
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t border-zinc-800/50 flex justify-between items-center text-xs text-gray-500">
                    <span>რეგისტრაცია: {new Date(team.createdAt).toLocaleDateString("ka-GE")}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
