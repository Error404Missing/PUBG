import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";

export async function GET() {
  try {
    const user = await getCurrentUser();

    if (!user || (user.role !== "ADMIN" && user.role !== "FOUNDER")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const supabase = await createClient();

    // Get counts
    const [profilesResult, teamsResult, scrimsResult] = await Promise.all([
      supabase.from("profiles").select("id", { count: "exact", head: true }),
      supabase.from("teams").select("id", { count: "exact", head: true }).eq("is_verified", true),
      supabase.from("scrims").select("id", { count: "exact", head: true }),
    ]);

    return NextResponse.json({
      users: profilesResult.count || 0,
      teams: teamsResult.count || 0,
      scrims: scrimsResult.count || 0,
    });
  } catch (error) {
    console.error("Error fetching admin stats:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
