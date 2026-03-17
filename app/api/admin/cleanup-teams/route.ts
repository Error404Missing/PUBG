import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  const supabase = await createClient()

  // Check auth
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { data: profile } = await supabase.from("profiles").select("is_admin").eq("id", user.id).single()
  if (!profile?.is_admin) return NextResponse.json({ error: "Forbidden" }, { status: 403 })

  try {
    const { data, error } = await supabase.rpc('cleanup_expired_teams')

    if (error) throw error

    return NextResponse.json({ success: true, deletedCount: data })
  } catch (error: any) {
    console.error("Cleanup Error:", error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}
