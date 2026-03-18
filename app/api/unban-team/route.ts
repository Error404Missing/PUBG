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

    const { team_id } = await request.json()

    if (!team_id) {
      return NextResponse.json({ error: "Missing team_id" }, { status: 400 })
    }

    // Verify team
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("id, status, leader_id")
      .eq("id", team_id)
      .single()

    if (teamError || !team) {
      return NextResponse.json({ error: "გუნდი არ მოიძებნა" }, { status: 404 })
    }

    if (team.status !== "blocked") {
      return NextResponse.json({ error: "გუნდი არ არის დაბლოკილი" }, { status: 400 })
    }

    if (team.leader_id !== user.id) {
      return NextResponse.json({ error: "მხოლოდ გუნდის ლიდერს შეუძლია ბანის მოხსნა" }, { status: 403 })
    }

    // Check balance
    const { data: profile } = await supabase
      .from("profiles")
      .select("balance")
      .eq("id", user.id)
      .single()

    if (!profile || (profile.balance || 0) < 10) {
      return NextResponse.json({ error: "ბალანსზე არ გაქვთ საკმარისი თანხა (საჭიროა 10 ლარი)" }, { status: 400 })
    }

    // Deduct balance and unban team
    const { error: updateProfileError } = await supabase
      .from("profiles")
      .update({ balance: profile.balance - 10 })
      .eq("id", user.id)

    if (updateProfileError) {
       return NextResponse.json({ error: "ბალანსის ჩამოჭრა ვერ მოხერხდა" }, { status: 500 })
    }

    // Insert transaction log
    try {
      await supabase.from("transactions").insert({
        user_id: user.id,
        amount: -10,
        type: "unban_team",
        description: "გუნდის ბანის მოხსნა",
        status: "completed"
      })
    } catch (e) {
      console.warn("Could not insert transaction log", e)
    }

    // Change team status to pending or approved (pending implies they might need review again? let's set to pending)
    const { error: unbanError } = await supabase
      .from("teams")
      .update({ status: "pending" })
      .eq("id", team_id)

    if (unbanError) {
       // Refund balance if unban failed
       await supabase.from("profiles").update({ balance: profile.balance }).eq("id", user.id)
       return NextResponse.json({ error: "ბანის მოხსნა ვერ მოხერხდა" }, { status: 500 })
    }

    // Remove them from any schedules or whatever is necessary happens automatically or they need to register anew.

    return NextResponse.json({ success: true, message: "ბანი წარმატებით მოიხსნა, 10 ლარი ჩამოიჭრა" })

  } catch (error: any) {
    console.error("[unban-team] error:", error)
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    )
  }
}
