import { getUser } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

export async function GET() {
  const user = await getUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'FOUNDER')) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  const { data: configItems } = await supabase
    .from('system_config')
    .select('*');

  const config: Record<string, any> = {};
  
  (configItems || []).forEach(item => {
    if (item.key === 'registrationOpen') config.registrationOpen = item.value === 'true';
    else config[item.key] = item.value;
  });

  return NextResponse.json(config);
}

export async function POST(req: Request) {
  const user = await getUser();
  if (!user || (user.role !== 'ADMIN' && user.role !== 'FOUNDER')) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const supabase = await createClient();

  const body = await req.json();
  const entries = Object.entries(body);
  
  for (const [key, value] of entries) {
    await supabase
      .from('system_config')
      .upsert({
        key,
        value: String(value ?? ""),
        updated_at: new Date().toISOString()
      });
  }

  return NextResponse.json({ message: "Saved" });
}
