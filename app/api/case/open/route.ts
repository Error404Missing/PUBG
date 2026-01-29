import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function POST() {
  const user = await getUser();
  if (!user) return NextResponse.json({ message: "Unauthorized" }, { status: 401 });

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (!profile) return NextResponse.json({ message: "User not found" }, { status: 404 });

  // Check cooldown (2 weeks)
  if (profile.last_case_open) {
    const twoWeeksAgo = new Date();
    twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 14);
    if (new Date(profile.last_case_open) > twoWeeksAgo) {
      return NextResponse.json({ message: "Cooldown active" }, { status: 403 });
    }
  }

  // Get available rewards
  const { data: rewards } = await supabase
    .from('case_rewards')
    .select('*')
    .order('probability', { ascending: false });

  // Random reward selection
  const rand = Math.random() * 100;
  let cumulativeProbability = 0;
  let selectedReward = null;

  for (const reward of rewards || []) {
    cumulativeProbability += reward.probability;
    if (rand <= cumulativeProbability) {
      selectedReward = reward;
      break;
    }
  }

  // Update last case open time
  await supabase
    .from('profiles')
    .update({ last_case_open: new Date().toISOString() })
    .eq('id', user.id);

  // If won a reward, add coins
  if (selectedReward) {
    await supabase
      .from('profiles')
      .update({ coins: (profile.coins || 0) + selectedReward.coins })
      .eq('id', user.id);
  }

  // Audit Log
  await supabase
    .from('audit_logs')
    .insert({
      action: 'CASE_OPEN',
      user_id: user.id,
      entity_type: 'case',
      details: {
        reward: selectedReward?.name || 'NOTHING',
        coins: selectedReward?.coins || 0
      }
    });

  return NextResponse.json({
    type: selectedReward?.rarity || 'NOTHING',
    name: selectedReward?.name || 'არაფერი',
    coins: selectedReward?.coins || 0,
    rewardId: selectedReward?.id || null
  });
}
