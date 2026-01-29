import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  const user = await getUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'FOUNDER')) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { startTime, map, maxTeams } = body;

    const supabase = await createClient();
    const date = new Date(startTime);

    const { data: scrim, error } = await supabase
      .from('scrims')
      .insert({
        title: `Scrim ${date.toLocaleDateString('ka-GE')}`,
        date: date.toISOString().split('T')[0],
        time: date.toTimeString().slice(0, 5),
        map,
        mode: 'TPP',
        max_teams: parseInt(maxTeams),
        status: "OPEN",
        created_by: user.id
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      return NextResponse.json({ message: "Failed to create scrim" }, { status: 500 });
    }

    return NextResponse.json(scrim);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const user = await getUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'FOUNDER')) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, roomId, roomPass, status, map, startTime } = body;

    const supabase = await createClient();

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString()
    };

    if (roomId !== undefined) updates.room_id = roomId;
    if (roomPass !== undefined) updates.room_password = roomPass;
    if (status !== undefined) updates.status = status;
    if (map !== undefined) updates.map = map;
    if (startTime) {
      const date = new Date(startTime);
      updates.date = date.toISOString().split('T')[0];
      updates.time = date.toTimeString().slice(0, 5);
    }

    const { data: scrim, error } = await supabase
      .from('scrims')
      .update(updates)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error(error);
      return NextResponse.json({ message: "Failed to update scrim" }, { status: 500 });
    }

    return NextResponse.json(scrim);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const user = await getUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'FOUNDER')) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get('id');

  if (!id) {
    return NextResponse.json({ message: "ID required" }, { status: 400 });
  }

  try {
    const supabase = await createClient();

    // Delete slots first
    await supabase.from('slots').delete().eq('scrim_id', id);
    // Delete results
    await supabase.from('results').delete().eq('scrim_id', id);

    // Delete scrim
    const { error } = await supabase
      .from('scrims')
      .delete()
      .eq('id', id);

    if (error) {
      console.error(error);
      return NextResponse.json({ message: "Failed to delete scrim" }, { status: 500 });
    }

    return NextResponse.json({ message: "Deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
