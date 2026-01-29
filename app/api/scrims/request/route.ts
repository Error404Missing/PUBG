import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ requests: [] });
  }

  const supabase = await createClient();

  const { data: team } = await supabase
    .from('teams')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (!team) {
    return NextResponse.json({ requests: [] });
  }

  const { data: items } = await supabase
    .from('system_config')
    .select('key')
    .like('key', 'request:scrim:%');

  const list = (items || [])
    .filter(i => i.key.endsWith(`:team:${team.id}`))
    .map(i => {
      const parts = i.key.split(':');
      return parts[2]; // request:scrim:<scrimId>:team:<teamId>
    });

  return NextResponse.json({ requests: list });
}

export async function POST(req: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  const { data: team } = await supabase
    .from('teams')
    .select('*')
    .eq('owner_id', user.id)
    .single();

  if (!team || team.status !== 'APPROVED') {
    return NextResponse.json({ message: "გუნდი არ არის დადასტურებული" }, { status: 400 });
  }

  const { scrimId } = await req.json();
  if (!scrimId) return NextResponse.json({ message: "Missing scrimId" }, { status: 400 });

  const { data: existing } = await supabase
    .from('system_config')
    .select('key')
    .like('key', 'request:scrim:%');

  const myRequests = (existing || []).filter(i => i.key.endsWith(`:team:${team.id}`));
  if (myRequests.length >= 3) {
    return NextResponse.json({ message: "შეგიძლიათ მაქსიმუმ 3 მოთხოვნა" }, { status: 400 });
  }

  await supabase
    .from('system_config')
    .upsert({
      key: `request:scrim:${scrimId}:team:${team.id}`,
      value: 'REQUESTED',
      updated_at: new Date().toISOString()
    });

  return NextResponse.json({ message: "მოთხოვნა გაგზავნილია" });
}

export async function DELETE(req: Request) {
  const user = await getUser();
  if (!user) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  const { data: team } = await supabase
    .from('teams')
    .select('id')
    .eq('owner_id', user.id)
    .single();

  if (!team) {
    return NextResponse.json({ message: "No team" }, { status: 404 });
  }

  const { scrimId } = await req.json();
  if (!scrimId) return NextResponse.json({ message: "Missing scrimId" }, { status: 400 });

  await supabase
    .from('system_config')
    .delete()
    .eq('key', `request:scrim:${scrimId}:team:${team.id}`);

  return NextResponse.json({ message: "მოთხოვნა გაუქმებულია" });
}
