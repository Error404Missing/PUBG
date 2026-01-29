import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function PATCH(req: Request) {
  const user = await getUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'FOUNDER')) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { teamId, status, isVip, blockReason, blockDays, blockPermanent } = body;

    const supabase = await createClient();

    const updates: Record<string, any> = {
      updated_at: new Date().toISOString()
    };
    if (status) updates.status = status;
    if (typeof isVip === 'boolean') updates.is_vip = isVip;
    if (blockReason) updates.block_reason = blockReason;

    // Get team info
    const { data: team } = await supabase
      .from('teams')
      .select('*')
      .eq('id', teamId)
      .single();

    if (!team) {
      return NextResponse.json({ message: "Team not found" }, { status: 404 });
    }

    // If approving, also make the leader a MANAGER
    if (status === 'APPROVED') {
      await supabase
        .from('profiles')
        .update({ role: 'MANAGER' })
        .eq('id', team.owner_id);

      // Clear blocks
      await supabase
        .from('system_config')
        .delete()
        .eq('key', `user:${team.owner_id}:block_until`);
      await supabase
        .from('system_config')
        .delete()
        .eq('key', `user:${team.owner_id}:create_block_until`);
    }

    // If blocking or rejecting
    if (status === 'BLOCKED' || status === 'REJECTED') {
      // Check if user is not admin/founder before downgrading
      const { data: profile } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', team.owner_id)
        .single();

      if (profile && profile.role !== 'ADMIN' && profile.role !== 'FOUNDER') {
        await supabase
          .from('profiles')
          .update({ role: 'GUEST' })
          .eq('id', team.owner_id);
      }

      if (status === 'BLOCKED') {
        const now = new Date();
        let value = 'FOREVER';
        if (!blockPermanent) {
          const days = typeof blockDays === 'number' && blockDays > 0 ? blockDays : 1;
          const until = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
          value = until.toISOString();
        }
        await supabase
          .from('system_config')
          .upsert({
            key: `user:${team.owner_id}:block_until`,
            value,
            updated_at: new Date().toISOString()
          });
      }
    }

    const { data: updatedTeam, error } = await supabase
      .from('teams')
      .update(updates)
      .eq('id', teamId)
      .select()
      .single();

    if (error) {
      console.error(error);
      return NextResponse.json({ message: "Failed to update team" }, { status: 500 });
    }

    return NextResponse.json(updatedTeam);
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

  try {
    const body = await req.json();
    const { teamId } = body;

    const supabase = await createClient();

    // Remove team_id from all members
    await supabase
      .from('profiles')
      .update({ team_id: null })
      .eq('team_id', teamId);

    const { error } = await supabase
      .from('teams')
      .delete()
      .eq('id', teamId);

    if (error) {
      console.error(error);
      return NextResponse.json({ message: "Failed to delete team" }, { status: 500 });
    }

    return NextResponse.json({ message: "Team deleted" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
