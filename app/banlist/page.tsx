import { prisma } from "@/lib/prisma";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

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
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold text-white">დაბლოკილი გუნდები</h1>
        <p className="text-gray-400">წესების დარღვევის გამო დაბლოკილი გუნდების სია</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {blockedTeams.length === 0 ? (
          <div className="col-span-full text-center py-12 text-gray-400 bg-zinc-900/50 rounded-lg border border-zinc-800">
            ამ დროისთვის არცერთი გუნდი არ არის დაბლოკილი
          </div>
        ) : (
          blockedTeams.map((team) => (
            <Card key={team.id} className="bg-red-950/20 border-red-900/50">
              <CardHeader>
                <CardTitle className="flex justify-between items-center text-red-400">
                  <span>{team.name}</span>
                  <span className="text-sm font-normal bg-red-900/50 px-2 py-1 rounded">
                    {team.tag}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-sm text-gray-400">
                    <span className="font-semibold text-gray-300">მიზეზი:</span>
                    <p className="mt-1 text-red-200/80">
                      {team.blockReason || "მიზეზი მითითებული არ არის"}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500 pt-2 border-t border-red-900/30">
                    დაბლოკვის თარიღი: {new Date(team.updatedAt).toLocaleDateString("ka-GE")}
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
