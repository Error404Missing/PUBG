import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { scrimId } = body;

    const supabase = await createClient();

    // Get user's team
    const { data: team } = await supabase
      .from('teams')
      .select('*')
      .eq('owner_id', user.id)
      .single();

    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 400 });
    }

    // Check if scrim allows unregister
    const { data: scrim } = await supabase
      .from('scrims')
      .select('*')
      .eq('id', scrimId)
      .single();

    if (!scrim || scrim.status === 'FINISHED') {
      return NextResponse.json({ message: "Cannot unregister" }, { status: 400 });
    }

    // Delete slot
    await supabase
      .from('slots')
      .delete()
      .eq('scrim_id', scrimId)
      .eq('team_id', team.id);

    // Clean up config
    await supabase
      .from('system_config')
      .delete()
      .eq('key', `slot_assigned_at:${scrimId}:team:${team.id}`);

    return NextResponse.json({ message: "Unregistered" });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
