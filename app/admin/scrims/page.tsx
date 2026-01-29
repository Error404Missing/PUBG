import { createClient } from "@/lib/supabase/server";
import CreateScrimForm from "@/components/CreateScrimForm";
import AdminScrimList from "@/components/AdminScrimList";

export default async function AdminScrimsPage() {
  const supabase = await createClient();

  const { data: scrims } = await supabase
    .from('scrims')
    .select(`
      *,
      slots(id)
    `)
    .order('date', { ascending: false })
    .order('time', { ascending: false });

  // Transform data to match expected format
  const scrimsWithCount = (scrims || []).map(scrim => ({
    id: scrim.id,
    startTime: `${scrim.date}T${scrim.time}`,
    map: scrim.map,
    maxTeams: scrim.max_teams,
    status: scrim.status,
    roomId: scrim.room_id,
    roomPass: scrim.room_password,
    _count: {
      slots: scrim.slots?.length || 0
    }
  }));

  return (
    <div className="space-y-8">
      <h1 className="text-2xl font-bold">სკრიმების მართვა</h1>
      
      <CreateScrimForm />
      
      <div className="bg-neutral-800 rounded-lg border border-neutral-700 overflow-hidden">
        <div className="p-4 border-b border-neutral-700 bg-neutral-800">
          <h3 className="font-bold">არსებული სკრიმები</h3>
        </div>
        <AdminScrimList scrims={scrimsWithCount} />
      </div>
    </div>
  );
}
