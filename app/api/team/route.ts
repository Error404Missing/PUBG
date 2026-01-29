import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function DELETE() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();
  const now = new Date();

  // Check for block
  const { data: blockConfig } = await supabase
    .from('system_config')
    .select('value')
    .eq('key', `user:${user.id}:block_until`)
    .single();

  if (blockConfig?.value) {
    if (blockConfig.value === 'FOREVER') {
      return NextResponse.json({ message: "გუნდის გაუქმება შეზღუდულია" }, { status: 403 });
    }
    const until = new Date(blockConfig.value);
    if (until > now) {
      return NextResponse.json({ message: "გუნდის გაუქმება დროებით შეზღუდულია" }, { status: 403 });
    }
  }

  // Find user's team (where they are owner)
  const { data: team } = await supabase
    .from('teams')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  if (!team) {
    return NextResponse.json({ message: "No team" }, { status: 404 });
  }

  // Remove team_id from all members
  await supabase
    .from('profiles')
    .update({ team_id: null })
    .eq('team_id', team.id);

  // Delete team
  const { error } = await supabase
    .from('teams')
    .delete()
    .eq('id', team.id);

  if (error) {
    return NextResponse.json({ message: "Failed to delete team" }, { status: 500 });
  }

  // Set cooldown
  const cooldownUntil = new Date(now.getTime() + 24 * 60 * 60 * 1000);
  await supabase
    .from('system_config')
    .upsert({
      key: `user:${user.id}:create_block_until`,
      value: cooldownUntil.toISOString(),
      updated_at: new Date().toISOString()
    });

  return NextResponse.json({ message: "Team cancelled" });
}
