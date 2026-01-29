import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const { data: scrims, error } = await supabase
    .from('scrims')
    .select(`
      *,
      slots(
        id,
        slot_number,
        team:teams(id, name, tag)
      )
    `)
    .eq('status', 'OPEN')
    .order('date', { ascending: true })
    .order('time', { ascending: true });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch scrims" }, { status: 500 });
  }

  // Transform to expected format
  const transformedScrims = (scrims || []).map(scrim => ({
    id: scrim.id,
    title: scrim.title,
    startTime: `${scrim.date}T${scrim.time}`,
    map: scrim.map,
    mode: scrim.mode,
    maxTeams: scrim.max_teams,
    status: scrim.status,
    roomId: scrim.room_id,
    roomPass: scrim.room_password,
    slots: (scrim.slots || []).map((slot: any) => ({
      id: slot.id,
      slotNumber: slot.slot_number,
      team: slot.team
    })),
    registeredCount: scrim.slots?.length || 0
  }));

  return NextResponse.json(transformedScrims);
}
