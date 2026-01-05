import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Map, Crown } from "lucide-react";
import PageHeader from "@/components/PageHeader";

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
      <PageHeader
        title="გუნდები"
        description="რეგისტრირებული და დადასტურებული გუნდები"
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {teams.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400 bg-white/5 rounded-2xl border border-white/5 italic">
            ამ დროისთვის არცერთი გუნდი არ არის რეგისტრირებული
          </div>
        ) : (
          teams.map((team) => (
            <Card key={team.id} className={`bg-[#06070a] border-white/5 transition-all duration-300 hover:border-primary/50 group rounded-2xl overflow-hidden ${team.isVip ? 'ring-1 ring-amber-500/20 bg-amber-500/5' : ''}`}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                <CardTitle className="text-xl font-bold text-white truncate pr-2 uppercase tracking-tight">
                  {team.name}
                </CardTitle>
                <div className="flex items-center gap-2">
                  {team.isVip && <Crown className="w-5 h-5 text-amber-500 animate-pulse" />}
                  <span className="font-mono text-xs bg-white/5 px-2 py-1 rounded text-primary border border-primary/20">
                    {team.tag}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div className="flex items-center gap-2 text-cyber-muted">
                    <Users className="w-4 h-4 text-primary" />
                    <span className="text-xs font-bold uppercase">{team.playerCount} PLR</span>
                  </div>
                  <div className="flex items-center gap-2 text-cyber-muted">
                    <Map className="w-4 h-4 text-secondary" />
                    <span className="text-xs font-bold uppercase">{team.mapsCount} MAPS</span>
                  </div>
                </div>
                <div className="mt-6 pt-4 border-t border-white/5 flex justify-between items-center text-[10px] text-cyber-muted font-mono uppercase tracking-widest">
                  <span>REG: {new Date(team.createdAt).toLocaleDateString("ka-GE")}</span>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
