import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET(req: Request) {
  const user = await getUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "FOUNDER")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  if (!userId) return NextResponse.json({ message: "Missing userId" }, { status: 400 });

  const supabase = await createClient();

  const { data: block } = await supabase
    .from('system_config')
    .select('value')
    .eq('key', `user:${userId}:block_until`)
    .single();

  const { data: cooldown } = await supabase
    .from('system_config')
    .select('value')
    .eq('key', `user:${userId}:create_block_until`)
    .single();

  return NextResponse.json({
    block_until: block?.value || null,
    create_block_until: cooldown?.value || null,
  });
}

export async function PATCH(req: Request) {
  const user = await getUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "FOUNDER")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { userId, days, permanent } = await req.json();
    if (!userId) return NextResponse.json({ message: "Missing userId" }, { status: 400 });

    const supabase = await createClient();

    let value = "FOREVER";
    if (!permanent) {
      const d = typeof days === "number" && days > 0 ? days : 1;
      const until = new Date(Date.now() + d * 24 * 60 * 60 * 1000).toISOString();
      value = until;
    }

    await supabase
      .from('system_config')
      .upsert({
        key: `user:${userId}:block_until`,
        value,
        updated_at: new Date().toISOString()
      });

    return NextResponse.json({ message: "Block updated" });
  } catch (e) {
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}

export async function DELETE(req: Request) {
  const user = await getUser();
  if (!user || (user.role !== "ADMIN" && user.role !== "FOUNDER")) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  try {
    const { userId } = await req.json();
    if (!userId) return NextResponse.json({ message: "Missing userId" }, { status: 400 });

    const supabase = await createClient();

    await supabase
      .from('system_config')
      .delete()
      .eq('key', `user:${userId}:block_until`);

    await supabase
      .from('system_config')
      .delete()
      .eq('key', `user:${userId}:create_block_until`);

    return NextResponse.json({ message: "Block and cooldown cleared" });
  } catch (e) {
    return NextResponse.json({ message: "Internal Error" }, { status: 500 });
  }
}
