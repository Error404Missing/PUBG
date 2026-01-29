import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const supabase = await createClient();

  const { data: teams, error } = await supabase
    .from('teams')
    .select(`
      id,
      name,
      tag,
      logo_url,
      status,
      is_vip,
      player_count,
      maps_count,
      owner:profiles!teams_owner_id_fkey(id, username),
      members:profiles!profiles_team_id_fkey(id, username)
    `)
    .eq('status', 'APPROVED')
    .order('name', { ascending: true });

  if (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to fetch teams" }, { status: 500 });
  }

  // Transform to expected format
  const transformedTeams = (teams || []).map(team => ({
    id: team.id,
    name: team.name,
    tag: team.tag,
    logo: team.logo_url,
    status: team.status,
    isVip: team.is_vip,
    playerCount: team.player_count,
    mapsCount: team.maps_count,
    members: team.members || []
  }));

  return NextResponse.json(transformedTeams);
}
