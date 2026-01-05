import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import RoomInfoGrid from "@/components/RoomInfoGrid";
import PageHeader from "@/components/PageHeader";

export default async function RoomInfoPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  // Allow MANAGER, ADMIN, FOUNDER
  if (!["MANAGER", "ADMIN", "FOUNDER"].includes(session.user.role)) {
    redirect("/");
  }

  const team = await prisma.team.findUnique({
    where: { leaderId: session.user.id }
  });

  if (!team) {
    return (
      <div className="space-y-8 pb-20">
        <PageHeader
          title="ROOM INFO"
          description="პერსონალური სლოტების ინფორმაცია"
        />
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 italic text-cyber-muted">
          თქვენ ჯერ არ გაქვთ დარეგისტრირებული გუნდი.
        </div>
      </div>
    );
  }

  const slots = await prisma.slot.findMany({
    where: { teamId: team.id },
    include: { scrim: true },
    orderBy: { slotNumber: 'asc' }
  });

  const sys = await prisma.systemConfig.findMany({
    where: { key: { startsWith: `slot_assigned_at:` } }
  });

  const items = slots.map(s => {
    const key = `slot_assigned_at:${s.scrimId}:team:${team.id}`;
    const item = sys.find(x => x.key === key);
    const allowed = item ? (new Date(item.value).getTime() + 24 * 60 * 60 * 1000) > Date.now() : false;
    return { ...s, allowed };
  });

  return (
    <div className="space-y-8 pb-20">
      <PageHeader
        title="ROOM INFO"
        description="თქვენი გუნდის მიმდინარე სლოტები და პაროლები"
      />
      {slots.length === 0 ? (
        <div className="text-center py-20 bg-white/5 rounded-3xl border border-white/5 italic text-cyber-muted">
          ვერცერთ სკრიმზე არ გაქვთ მინიჭებული სლოტი.
        </div>
      ) : (
        <RoomInfoGrid slots={items} />
      )}
    </div>
  );
}
