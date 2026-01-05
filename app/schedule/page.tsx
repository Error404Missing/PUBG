import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import ScrimList from "@/components/ScrimList";
import { redirect } from "next/navigation";

export default async function SchedulePage() {
  const session = await auth();
  
  const scrims = await prisma.scrim.findMany({
    where: {
        status: { in: ['OPEN', 'CLOSED'] } // Show active scrims
    },
    orderBy: { startTime: 'asc' },
    include: {
        slots: {
            include: {
                team: true
            },
            orderBy: { slotNumber: 'asc' }
        }
    }
  });

  let userTeam: { id: string } | null = null;
  let requests: string[] = [];
  let allowedScrimIds: string[] = [];
  if (session?.user) {
    userTeam = await prisma.team.findUnique({
        where: { leaderId: session.user.id }
    });
    if (userTeam) {
      const items = await prisma.systemConfig.findMany({
        where: { key: { startsWith: `request:scrim:` } }
      });
      requests = items.filter(i => i.key.endsWith(`:team:${userTeam.id}`))
        .map(i => i.key.split(':')[2]);
      const keys = scrims.map(s => `slot_assigned_at:${s.id}:team:${(userTeam as any).id}`);
      const cfg = keys.length > 0 
        ? await prisma.systemConfig.findMany({ where: { key: { in: keys } } })
        : [];
      const cutoff = Date.now() - 24 * 60 * 60 * 1000;
      allowedScrimIds = cfg
        .filter(item => new Date(item.value).getTime() > cutoff)
        .map(item => item.key.split(':')[1]);
    }
  }

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold text-white">განრიგი</h1>
      <ScrimList scrims={scrims} userTeam={userTeam} userId={session?.user?.id} requests={requests} allowedScrimIds={allowedScrimIds} />
    </div>
  );
}
