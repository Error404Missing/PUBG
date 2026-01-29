import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { z } from "zod";

const teamSchema = z.object({
  name: z.string().min(2),
  tag: z.string().min(2).max(5),
  playerCount: z.coerce.number().min(1).max(10), 
  mapsCount: z.coerce.number().min(0),
});

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, tag, playerCount, mapsCount } = teamSchema.parse(body);

    const supabase = await createClient();
    const isPrivileged = user.role === 'ADMIN' || user.role === 'FOUNDER';

    // Global registration toggle (non-privileged users)
    const { data: regOpen } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', 'registrationOpen')
      .single();

    if (!isPrivileged && regOpen && regOpen.value !== 'true') {
      return NextResponse.json({ message: "რეგისტრაცია დახურულია" }, { status: 403 });
    }

    const now = new Date();

    // Check for block
    const { data: blockConfig } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', `user:${user.id}:block_until`)
      .single();

    if (!isPrivileged && blockConfig?.value) {
      if (blockConfig.value === 'FOREVER') {
        return NextResponse.json({ message: "გუნდის შექმნა შეზღუდულია (სამუდამოდ)" }, { status: 403 });
      }
      const until = new Date(blockConfig.value);
      if (until > now) {
        return NextResponse.json({ message: `შექმნა დროებით შეზღუდულია (${until.toLocaleString('ka-GE')}-მდე)` }, { status: 403 });
      }
    }

    // Check cooldown after delete
    const { data: createCooldown } = await supabase
      .from('system_config')
      .select('value')
      .eq('key', `user:${user.id}:create_block_until`)
      .single();

    if (!isPrivileged && createCooldown?.value) {
      const until = new Date(createCooldown.value);
      if (until > now) {
        return NextResponse.json({ message: `შექმნა შეზღუდულია 24 საათით გაუქმების შემდეგ (${until.toLocaleString('ka-GE')}-მდე)` }, { status: 403 });
      }
    }

    // Check if user already has a team
    const { data: existingTeam } = await supabase
      .from('teams')
      .select('id')
      .eq('owner_id', user.id)
      .single();

    if (existingTeam) {
      return NextResponse.json({ message: "You already have a team" }, { status: 400 });
    }

    // Create team
    const { data: team, error } = await supabase
      .from('teams')
      .insert({
        name,
        tag,
        player_count: playerCount,
        maps_count: mapsCount,
        owner_id: user.id,
        status: "PENDING",
      })
      .select()
      .single();

    if (error) {
      console.error(error);
      return NextResponse.json({ message: "Failed to create team" }, { status: 500 });
    }

    // Update user's team_id
    await supabase
      .from('profiles')
      .update({ team_id: team.id })
      .eq('id', user.id);

    return NextResponse.json(team, { status: 201 });
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ message: "Invalid input", errors: error.errors }, { status: 400 });
    }
    console.error(error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
