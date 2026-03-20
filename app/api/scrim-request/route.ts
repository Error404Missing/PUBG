import { createClient } from "@/lib/supabase/server"
import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"

// Admin client that bypasses RLS entirely using service role key
function getAdminSupabase() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY!
  return createSupabaseClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false }
  })
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { team_id, schedule_id, preferred_maps } = await request.json()

    if (!team_id || !schedule_id) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    // Check if schedule permits registration
    const { data: schedule } = await supabase
      .from("schedules")
      .select("registration_status, logo_required, maps_count, date")
      .eq("id", schedule_id)
      .single()

    if (!schedule) {
      return NextResponse.json({ error: "განრიგი ვერ მოიძებნა" }, { status: 404 })
    }

    const regStatus = schedule?.registration_status || 'open'
    
    if (regStatus === 'closed') {
      return NextResponse.json({ error: "რეგისტრაცია დახურულია ამ მატჩზე" }, { status: 403 })
    }

    // NEW: Check for time conflicts with other APPROVED matches for this user
    try {
      // 1. Get all teams owned by this user
      const { data: userTeams } = await supabase
        .from("teams")
        .select("id")
        .eq("leader_id", user.id)

      const teamIds = userTeams?.map(t => t.id) || []

      if (teamIds.length > 0) {
        // 2. Find any approved requests for these teams
        const { data: approvedRequests } = await supabase
          .from("scrim_requests")
          .select("schedule_id, schedules(date)")
          .in("team_id", teamIds)
          .eq("status", "approved")

        if (approvedRequests && approvedRequests.length > 0) {
          const targetDate = schedule.date
          
          const hasConflict = approvedRequests.some((req: any) => {
            // Compare the full ISO date string (includes time)
            return req.schedules.date === targetDate
          })

          if (hasConflict) {
            return NextResponse.json({ 
              error: "თქვენ უკვე გაქვთ დადასტურებული თამაში მოცემულ დროს (სხვა ოთახში). ერთსა და იმავე დროს ორ სხვადასხვა მატჩში მონაწილეობა დაუშვებელია." 
            }, { status: 403 })
          }
        }
      }
    } catch (e) {
      console.warn("Time conflict check error (ignoring for resilience):", e)
    }

    // Check VIP status if needed
    let isVip = false
    try {
      const { data: vipStatus } = await supabase
        .from("user_vip_status")
        .select("vip_until")
        .eq("user_id", user.id)
        .maybeSingle()
      if (vipStatus && new Date(vipStatus.vip_until) > new Date()) {
        isVip = true
      }
    } catch (e) {
      console.warn("VIP status check failed:", e)
    }

    if (regStatus === 'vip_only' && !isVip) {
      return NextResponse.json({ error: "რეგისტრაცია ამჟამად მხოლოდ VIP მომხმარებლებისთვისაა ხელმისაწვდომი" }, { status: 403 })
    }

    // Validate preferred maps
    const scheduleMaps = schedule?.maps_count || 4
    if (preferred_maps && preferred_maps > scheduleMaps) {
      return NextResponse.json({ 
        error: `ეს პრეკი ტარდება ${scheduleMaps} მაპით. ${preferred_maps} მაპს ვერ ითამაშებთ ამ ფორმატში.`
      }, { status: 400 })
    }

    // Verify that the user owns this team
    const { data: team, error: teamError } = await supabase
      .from("teams")
      .select("id, status, team_name, logo_url")
      .eq("id", team_id)
      .eq("leader_id", user.id)
      .maybeSingle()

    if (teamError) {
      console.error("Team fetch error:", teamError)
      return NextResponse.json({ error: "Team lookup failed: " + teamError.message }, { status: 500 })
    }

    if (!team) {
      return NextResponse.json({ error: "გუნდი ვერ მოიძებნა ან თქვენ არ ხართ მისი ლიდერი" }, { status: 403 })
    }

    // Check Logo requirement
    if (schedule?.logo_required && !team.logo_url) {
      return NextResponse.json({ 
        error: "ამ მატჩზე რეგისტრაციისთვის გუნდის ლოგო სავალდებულოა. გთხოვთ ატვირთოთ ლოგო პროფილის გვერდიდან." 
      }, { status: 400 })
    }

    // Check if request already exists
    const { data: existingRequest } = await supabase
      .from("scrim_requests")
      .select("id")
      .eq("team_id", team_id)
      .eq("schedule_id", schedule_id)
      .maybeSingle()

    if (existingRequest) {
      return NextResponse.json(
        { error: "ამ მატჩზე მოთხოვნა უკვე გაგზავნილია" },
        { status: 409 }
      )
    }

    // Create scrim request - minimal fields only to avoid column issues
    const insertData: any = {
      team_id,
      schedule_id,
      status: "pending",
    }

    // Use pre-calculated isVip
    if (isVip) {
      insertData.has_vip = true
    }

    const { data: scrimRequest, error: insertError } = await supabase
      .from("scrim_requests")
      .insert(insertData)
      .select()
      .single()

    if (insertError) {
      console.error("Scrim request insert error:", insertError)
      // If has_vip column doesn't exist, retry without it
      if (insertError.message?.includes("has_vip")) {
        delete insertData.has_vip
        const { data: retry, error: retryError } = await supabase
          .from("scrim_requests")
          .insert(insertData)
          .select()
          .single()
        if (retryError) {
          return NextResponse.json({ error: retryError.message }, { status: 500 })
        }
        
        // Update team status and sync schedule_id
        await supabase
          .from("teams")
          .update({ 
            status: team.status === "draft" ? "pending" : team.status,
            schedule_id: schedule_id 
          })
          .eq("id", team_id)

        // Notify admins via admin client (bypasses RLS)
        await notifyAdminsViaServiceRole(team.team_name)

        return NextResponse.json({ success: true, message: "მოთხოვნა გაიგზავნა ადმინისტრაციისთვის", data: retry })
      }
      return NextResponse.json({ error: insertError.message }, { status: 500 })
    }

    // Update team status and sync schedule_id
    await supabase
      .from("teams")
      .update({ 
        status: team.status === "draft" ? "pending" : team.status,
        schedule_id: schedule_id 
      })
      .eq("id", team_id)

    // Notify admins via admin client (bypasses RLS)
    await notifyAdminsViaServiceRole(team.team_name)

    return NextResponse.json({
      success: true,
      message: "მოთხოვნა გაიგზავნა ადმინისტრაციისთვის",
      data: scrimRequest,
    })
  } catch (error: any) {
    console.error("[scrim-request] Unhandled error:", error)
    return NextResponse.json(
      { error: error?.message || "Internal server error" },
      { status: 500 }
    )
  }
}

async function notifyAdminsViaServiceRole(teamName: string) {
  try {
    const admin = getAdminSupabase()

    // Fetch all admins using service role (no RLS)
    const { data: admins, error: adminsError } = await admin
      .from("profiles")
      .select("id")
      .or("is_admin.eq.true,role.eq.admin")

    if (adminsError) {
      console.error("[notify] Failed to fetch admins:", adminsError.message)
      return
    }

    if (!admins || admins.length === 0) {
      console.warn("[notify] No admins found in profiles table")
      return
    }

    const notifications = admins.map((a) => ({
      user_id: a.id,
      title: "ახალი თამაშის მოთხოვნა 🎮",
      message: `გუნდმა '${teamName}' გამოგზავნა თამაშის მოთხოვნა.`,
      type: "info",
      is_read: false,
    }))

    const { error: insertError } = await admin
      .from("notifications")
      .insert(notifications)

    if (insertError) {
      console.error("[notify] Failed to insert notifications:", insertError.message)
    } else {
      console.log(`[notify] Sent notifications to ${admins.length} admin(s)`)
    }
  } catch (err: any) {
    console.error("[notify] Unexpected error:", err?.message)
  }
}
