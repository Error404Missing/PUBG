import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function GET() {
  try {
    const supabase = await createClient();
    
    // Simple health check query
    const { error } = await supabase.from('profiles').select('id').limit(1);
    
    if (error) throw error;

    const res = NextResponse.json({
      ok: true,
      db: "supabase",
      host: process.env.NEXT_PUBLIC_SUPABASE_URL || "unknown",
    });
    res.headers.set("Cache-Control", "no-store");
    return res;
  } catch (error: any) {
    const res = NextResponse.json(
      { ok: false, error: error?.message || "Unknown error" },
      { status: 500 }
    );
    res.headers.set("Cache-Control", "no-store");
    return res;
  }
}
