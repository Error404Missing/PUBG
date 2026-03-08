import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { team_id, schedule_id } = await request.json()

    if (!team_id || !schedule_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Verify that the user owns this team
    const { data: team } = await supabase
      .from("teams")
      .select("id")
      .eq("id", team_id)
      .eq("leader_id", user.id)
      .single()

    if (!team) {
      return NextResponse.json({ error: "Team not found or unauthorized" }, { status: 403 })
    }

    // Check if request already exists
    const { data: existingRequest } = await supabase
      .from("scrim_requests")
      .select("id")
      .eq("team_id", team_id)
      .eq("schedule_id", schedule_id)
      .single()

    if (existingRequest) {
      return NextResponse.json(
        { error: "თამაშის მოთხოვნა უკვე გაწერილია" },
        { status: 409 }
      )
    }

    // Check if team leader has VIP status
    const { data: vipStatus } = await supabase
      .from("user_vip_status")
      .select("vip_until")
      .eq("user_id", user.id)
      .single()

    const hasVip = !!(vipStatus && new Date(vipStatus.vip_until) > new Date())

    // Create scrim request
    const { data: scrimRequest, error } = await supabase
      .from("scrim_requests")
      .insert({
        team_id,
        schedule_id,
        status: "pending",
        has_vip: hasVip,
        created_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (error) throw error

    // Update team status if it's draft
    if (team.status === "draft") {
      await supabase.from("teams").update({ status: "pending" }).eq("id", team_id)
    }

    return NextResponse.json({
      success: true,
      message: "მოთხოვნა გაიგზავნა ადმინისტრაციისთვის",
      data: scrimRequest,
    })
  } catch (error) {
    console.error("[v0] Scrim request error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
