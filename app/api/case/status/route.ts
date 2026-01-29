import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getUser();
  if (!user) return NextResponse.json({});

  const supabase = await createClient();

  const { data: profile } = await supabase
    .from('profiles')
    .select('last_case_open')
    .eq('id', user.id)
    .single();

  if (!profile) return NextResponse.json({});

  let cooldownStr = null;
  if (profile.last_case_open) {
    const nextOpen = new Date(profile.last_case_open);
    nextOpen.setDate(nextOpen.getDate() + 14);
    if (nextOpen > new Date()) {
      cooldownStr = nextOpen.toLocaleString('ka-GE');
    }
  }

  return NextResponse.json({
    cooldown: cooldownStr,
    pending: false // Simplified - rewards are instant now
  });
}
