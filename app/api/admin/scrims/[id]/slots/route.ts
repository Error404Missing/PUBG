import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'FOUNDER')) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  const body = await req.json();
  const { slotNumber, teamId } = body;

  if (!slotNumber || !teamId) {
    return NextResponse.json({ message: "Missing fields" }, { status: 400 });
  }

  // Check if request exists
  const { data: requestExists } = await supabase
    .from('system_config')
    .select('key')
    .eq('key', `request:scrim:${id}:team:${teamId}`)
    .single();

  if (!requestExists) {
    return NextResponse.json({ message: "ეს გუნდი არ აქვს გამოგზავნილი მოთხოვნა მოცემულ განრიგზე" }, { status: 400 });
  }

  // Check if slot is already taken
  const { data: existingSlot } = await supabase
    .from('slots')
    .select('*')
    .eq('scrim_id', id)
    .eq('slot_number', Number(slotNumber))
    .single();

  if (existingSlot) {
    // If team is already in this slot, do nothing
    if (existingSlot.team_id === teamId) {
      return NextResponse.json({ message: "Already assigned" });
    }
    
    // Remove old team from this slot
    await supabase
      .from('slots')
      .delete()
      .eq('id', existingSlot.id);
  }

  // Check if team is already in another slot for this scrim
  const { data: teamInOtherSlot } = await supabase
    .from('slots')
    .select('*')
    .eq('scrim_id', id)
    .eq('team_id', teamId)
    .single();

  if (teamInOtherSlot) {
    // Move team - delete old slot
    await supabase
      .from('slots')
      .delete()
      .eq('id', teamInOtherSlot.id);
  }

  // Create new slot assignment
  const { data: newSlot, error } = await supabase
    .from('slots')
    .insert({
      scrim_id: id,
      team_id: teamId,
      slot_number: Number(slotNumber),
      registered_by: user.id
    })
    .select()
    .single();

  if (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to create slot" }, { status: 500 });
  }

  const assignedAt = new Date().toISOString();
  await supabase
    .from('system_config')
    .upsert({
      key: `slot_assigned_at:${id}:team:${teamId}`,
      value: assignedAt,
      updated_at: assignedAt
    });

  await supabase
    .from('system_config')
    .delete()
    .eq('key', `request:scrim:${id}:team:${teamId}`);

  return NextResponse.json(newSlot);
}

export async function DELETE(req: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await getUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'FOUNDER')) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  const { searchParams } = new URL(req.url);
  const slotNumber = searchParams.get('slot');

  if (slotNumber) {
    // Delete specific slot
    const { data: slot } = await supabase
      .from('slots')
      .select('*')
      .eq('scrim_id', id)
      .eq('slot_number', Number(slotNumber))
      .single();
    
    if (slot) {
      await supabase
        .from('slots')
        .delete()
        .eq('id', slot.id);

      await supabase
        .from('system_config')
        .delete()
        .eq('key', `slot_assigned_at:${id}:team:${slot.team_id}`);
    }
  } else {
    // Clear all slots
    await supabase
      .from('slots')
      .delete()
      .eq('scrim_id', id);

    // Clear all slot_assigned_at configs for this scrim
    const { data: configs } = await supabase
      .from('system_config')
      .select('key')
      .like('key', `slot_assigned_at:${id}:team:%`);

    for (const config of configs || []) {
      await supabase
        .from('system_config')
        .delete()
        .eq('key', config.key);
    }
  }

  return NextResponse.json({ message: "Deleted" });
}
