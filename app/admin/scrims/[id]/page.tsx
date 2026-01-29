import { createClient } from "@/lib/supabase/server";
import SlotManager from "@/components/SlotManager";

export default async function ScrimSlotsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();

  // Get scrim with slots
  const { data: scrim } = await supabase
    .from('scrims')
    .select(`
      *,
      slots(
        *,
        team:teams(id, name, tag)
      )
    `)
    .eq('id', id)
    .single();

  // Get requests for this scrim
  const { data: requests } = await supabase
    .from('system_config')
    .select('key')
    .like('key', `request:scrim:${id}:team:%`);

  const teamIds = (requests || [])
    .map(r => r.key.split(':').pop()!)
    .filter(Boolean);

  // Get teams that have requested
  let teams: any[] = [];
  if (teamIds.length > 0) {
    const { data: teamsData } = await supabase
      .from('teams')
      .select('id, name, tag')
      .in('id', teamIds)
      .order('name', { ascending: true });
    teams = teamsData || [];
  }

  if (!scrim) return <div className="text-white p-8">Scrim not found</div>;

  // Transform to expected format
  const transformedScrim = {
    id: scrim.id,
    startTime: `${scrim.date}T${scrim.time}`,
    map: scrim.map,
    maxTeams: scrim.max_teams,
    status: scrim.status,
    roomId: scrim.room_id,
    roomPass: scrim.room_password,
    slots: (scrim.slots || []).map((slot: any) => ({
      id: slot.id,
      slotNumber: slot.slot_number,
      teamId: slot.team_id,
      team: slot.team
    }))
  };

  return <SlotManager scrim={transformedScrim} teams={teams} />;
}
