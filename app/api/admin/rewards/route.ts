import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getUser();
  if (user?.role !== 'ADMIN' && user?.role !== 'FOUNDER') {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  const { data: rewards, error } = await supabase
    .from('case_rewards')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(error);
    return NextResponse.json({ message: "Failed to fetch rewards" }, { status: 500 });
  }

  return NextResponse.json(rewards);
}

export async function PATCH(req: Request) {
  const user = await getUser();
  if (user?.role !== 'ADMIN' && user?.role !== 'FOUNDER') {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, action } = await req.json();

    const supabase = await createClient();

    const { data: reward } = await supabase
      .from('case_rewards')
      .select('*')
      .eq('id', id)
      .single();

    if (!reward) {
      return NextResponse.json({ message: "Not found" }, { status: 404 });
    }

    if (action === 'APPROVE') {
      // Update reward status
      await supabase
        .from('case_rewards')
        .update({ rarity: 'APPROVED' })
        .eq('id', id);

      // Add coins to user
      const { data: profile } = await supabase
        .from('profiles')
        .select('coins')
        .eq('username', reward.name)
        .single();

      if (profile) {
        await supabase
          .from('profiles')
          .update({ coins: (profile.coins || 0) + reward.coins })
          .eq('username', reward.name);
      }

      // Log
      await supabase
        .from('audit_logs')
        .insert({
          action: 'APPROVE_REWARD',
          user_id: user.id,
          entity_type: 'case_reward',
          entity_id: id,
          details: { reward_name: reward.name, coins: reward.coins }
        });

    } else if (action === 'REJECT') {
      await supabase
        .from('case_rewards')
        .update({ rarity: 'REJECTED' })
        .eq('id', id);

      // Log
      await supabase
        .from('audit_logs')
        .insert({
          action: 'REJECT_REWARD',
          user_id: user.id,
          entity_type: 'case_reward',
          entity_id: id,
          details: { reward_name: reward.name }
        });
    }

    return NextResponse.json({ message: "Success" });
  } catch (error: any) {
    return NextResponse.json({ message: error.message }, { status: 500 });
  }
}
