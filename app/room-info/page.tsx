import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { Calendar, KeyRound, Map } from "lucide-react";
import RoomInfoGrid from "@/components/RoomInfoGrid";

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
      <div className="space-y-4">
        <h1 className="text-2xl font-bold text-white">Room Info</h1>
        <p className="text-gray-400">თქვენ ჯერ არ გაქვთ დარეგისტრირებული გუნდი.</p>
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
    const allowed = item ? (new Date(item.value).getTime() + 24*60*60*1000) > Date.now() : false;
    return { ...s, allowed };
  });

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold text-white">Room Info</h1>
      {slots.length === 0 ? (
        <p className="text-gray-400">ვერცერთ სკრიმზე არ გაქვთ მინიჭებული სლოტი.</p>
      ) : (
        <RoomInfoGrid slots={items} />
      )}
    </div>
  );
}
