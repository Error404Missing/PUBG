import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ShieldAlert, AlertTriangle } from "lucide-react";
import PageHeader from "@/components/PageHeader";

export default async function BanlistPage() {
  const blockedTeams = await prisma.team.findMany({
    where: {
      status: "BLOCKED",
    },
    orderBy: {
      updatedAt: "desc",
    },
  });

  return (
    <div className="space-y-8 pb-20">
      <PageHeader
        title="BANLIST"
        description="წესების დარღვევის გამო დაბლოკილი გუნდების სია"
      />

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {blockedTeams.length === 0 ? (
          <div className="col-span-full text-center py-20 text-cyber-muted bg-white/5 rounded-3xl border border-white/5 italic">
            ამ დროისთვის არცერთი გუნდი არ არის დაბლოკილი
          </div>
        ) : (
          blockedTeams.map((team) => (
            <Card key={team.id} className="bg-[#06070a] border-rose-500/10 group overflow-hidden rounded-2xl hover:border-rose-500/50 transition-all duration-500 ring-1 ring-rose-500/5">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4 bg-rose-500/5">
                <CardTitle className="text-xl font-black text-rose-400 uppercase tracking-tight flex items-center gap-2">
                  <ShieldAlert className="w-5 h-5" />
                  <span>{team.name}</span>
                </CardTitle>
                <span className="font-mono text-xs bg-rose-500/10 px-2 py-1 rounded text-rose-400 border border-rose-500/20">
                  {team.tag}
                </span>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="space-y-4">
                  <div className="bg-rose-500/5 p-4 rounded-xl border border-rose-500/5">
                    <div className="flex items-center gap-2 text-[10px] font-black text-rose-400/60 uppercase tracking-[0.2em] mb-2">
                      <AlertTriangle className="w-3 h-3" />
                      TERMINATION REASON
                    </div>
                    <p className="text-sm font-medium text-rose-200/80 leading-relaxed italic">
                      "{team.blockReason || "მიზეზი მითითებული არ არის"}"
                    </p>
                  </div>
                  <div className="text-[10px] text-cyber-muted pt-4 border-t border-white/5 flex justify-between items-center font-mono uppercase tracking-[0.1em]">
                    <span>STATUS: RESTRICTED</span>
                    <span>DATE: {new Date(team.updatedAt).toLocaleDateString("ka-GE")}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
