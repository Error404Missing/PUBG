import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const registerSchema = z.object({
  scrimId: z.string(),
  slotNumber: z.number().int().min(1).max(25),
});

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { scrimId, slotNumber } = registerSchema.parse(body);

    const supabase = await createClient();

    // Get user's team (where they are owner)
    const { data: team } = await supabase
      .from('teams')
      .select('*')
      .eq('owner_id', user.id)
      .single();

    if (!team) {
      return NextResponse.json({ message: "გუნდი არ მოიძებნა" }, { status: 400 });
    }

    if (team.status !== 'APPROVED') {
      return NextResponse.json({ message: "გუნდი არ არის დადასტურებული" }, { status: 400 });
    }

    // Check if scrim is open
    const { data: scrim } = await supabase
      .from('scrims')
      .select('*')
      .eq('id', scrimId)
      .single();

    if (!scrim || scrim.status !== 'OPEN') {
      return NextResponse.json({ message: "რეგისტრაცია დახურულია" }, { status: 400 });
    }

    // Check if slot is taken
    const { data: existingSlot } = await supabase
      .from('slots')
      .select('*')
      .eq('scrim_id', scrimId)
      .eq('slot_number', slotNumber)
      .single();

    if (existingSlot) {
      return NextResponse.json({ message: "სლოტი დაკავებულია" }, { status: 400 });
    }

    // Check if team is already registered for this scrim
    const { data: existingRegistration } = await supabase
      .from('slots')
      .select('*')
      .eq('scrim_id', scrimId)
      .eq('team_id', team.id)
      .single();

    if (existingRegistration) {
      return NextResponse.json({ message: "უკვე რეგისტრირებული ხართ" }, { status: 400 });
    }

    // Register
    const { data: slot, error } = await supabase
      .from('slots')
      .insert({
        scrim_id: scrimId,
        team_id: team.id,
        slot_number: slotNumber,
        registered_by: user.id
      })
      .select(`
        *,
        team:teams(id, name, tag)
      `)
      .single();

    if (error) {
      console.error(error);
      return NextResponse.json({ message: "Failed to register" }, { status: 500 });
    }

    return NextResponse.json(slot, { status: 201 });

  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid input" }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
